require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Variables de entorno para Cloudflare R2
const accountId = (process.env.R2_ACCOUNT_ID || '').trim();
const bucketName = (process.env.R2_BUCKET_NAME || '').trim();
const accessKeyId = (process.env.R2_ACCESS_KEY_ID || '').trim();
const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || '').trim();
const publicUrl = (process.env.R2_PUBLIC_URL || '').trim();

// Determinar si R2 está configurado
const useR2 = accountId && bucketName && accessKeyId && secretAccessKey;

let s3Client = null;
if (useR2) {
    s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
    });
    console.log('☁️ Modo de almacenamiento activo: Cloudflare R2');
} else {
    console.log('📁 Modo de almacenamiento activo: Disco Local');
}

// Configuración de almacenamiento local
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');
const usersFilePath = path.join(dataDir, 'users.json');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(usersFilePath)) fs.writeFileSync(usersFilePath, JSON.stringify([]));

function getUsers() {
    try { return JSON.parse(fs.readFileSync(usersFilePath, 'utf8')); } catch { return []; }
}
function saveUsers(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.headers['user-id'] || 'guest';
        const userFolder = path.join(uploadsDir, userId);
        if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true });
        cb(null, userFolder);
    },
    filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ 
    storage: useR2 ? multer.memoryStorage() : storage,
    limits: { fileSize: 500 * 1024 * 1024 }
});

app.use(express.static(__dirname));

// Autenticación
app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Campos incompletos' });

    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const newUser = { id: 'user_' + Date.now(), name, email: email.toLowerCase(), password };
    users.push(newUser);
    saveUsers(users);

    res.json({ message: 'Registro exitoso', user: { id: newUser.id, name: newUser.name, email: newUser.email } });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase() && u.password === password);

    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });
    res.json({ message: 'Login exitoso', user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/auth/social', (req, res) => {
    const { name, email, provider } = req.body;
    if (!email) return res.status(400).json({ error: 'Datos insuficientes' });

    const users = getUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        user = { id: `${provider}_` + Date.now(), name: name || email.split('@')[0], email: email.toLowerCase(), password: '' };
        users.push(user);
        saveUsers(users);
    }

    res.json({ message: 'Autenticación exitosa', user: { id: user.id, name: user.name, email: user.email } });
});

// Archivos Locales Servidos
app.use('/uploads/:userId/:filename', (req, res) => {
    const { userId, filename } = req.params;
    const filePath = path.join(uploadsDir, userId, filename);
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.status(404).send('Archivo no encontrado');
});

// Listar Archivos
app.get('/api/files', async (req, res) => {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ error: 'No autorizado' });

    if (useR2) {
        try {
            const command = new ListObjectsV2Command({ Bucket: bucketName, Prefix: `${userId}/` });
            const response = await s3Client.send(command);
            const files = (response.Contents || []).map(file => {
                const fileNameOnly = file.Key.replace(`${userId}/`, '');
                return {
                    id: fileNameOnly,
                    name: fileNameOnly,
                    size: file.Size,
                    date: file.LastModified ? new Date(file.LastModified).toLocaleDateString() : 'Reciente',
                    url: `${publicUrl}/${file.Key}`
                };
            }).filter(f => f.name !== '');
            return res.json(files);
        } catch (error) {
            console.error('Error R2:', error);
            return res.status(500).json({ error: 'Error al consultar R2' });
        }
    } else {
        const userFolder = path.join(uploadsDir, userId);
        if (!fs.existsSync(userFolder)) return res.json([]);

        fs.readdir(userFolder, (err, files) => {
            if (err) return res.status(500).json({ error: 'Error al leer archivos' });
            const fileList = files.map(filename => {
                const filePath = path.join(userFolder, filename);
                let stats = { size: 0, mtime: new Date() };
                try { stats = fs.statSync(filePath); } catch (e) {}

                return {
                    id: filename,
                    name: filename,
                    size: stats.size,
                    date: stats.mtime ? new Date(stats.mtime).toLocaleDateString() : 'Reciente',
                    url: `/uploads/${userId}/${encodeURIComponent(filename)}`
                };
            });
            res.json(fileList);
        });
    }
});

// Subir Archivo
app.post('/api/upload', upload.single('file'), async (req, res) => {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ error: 'No autorizado' });
    if (!req.file) return res.status(400).json({ error: 'No hay archivo' });

    if (useR2) {
        try {
            const key = `${userId}/${req.file.originalname}`;
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            });
            await s3Client.send(command);
            return res.json({ message: 'Subido a R2' });
        } catch (error) {
            console.error('Error al subir a R2:', error);
            return res.status(500).json({ error: 'Error en subida a R2' });
        }
    } else {
        res.json({ message: 'Guardado localmente' });
    }
});

// Eliminar Archivo
app.delete('/api/files/:key', async (req, res) => {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ error: 'No autorizado' });

    const fileName = req.params.key;

    if (useR2) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: bucketName,
                Key: `${userId}/${fileName}`,
            });
            await s3Client.send(command);
            return res.json({ message: 'Eliminado de R2' });
        } catch (error) {
            return res.status(500).json({ error: 'Error al eliminar de R2' });
        }
    } else {
        const filePath = path.join(uploadsDir, userId, fileName);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'No encontrado' });

        fs.unlink(filePath, (err) => {
            if (err) return res.status(500).json({ error: 'Error al eliminar' });
            res.json({ message: 'Eliminado localmente' });
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Stamarc Cloud listo en el puerto ${PORT}`);
});
