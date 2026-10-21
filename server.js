const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (index.html, CSS, JS) desde la raíz
app.use(express.static(__dirname));

// Configurar cliente de Cloudflare R2
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const upload = multer({ storage: multer.memoryStorage() });

// --- RUTAS DE AUTENTICACIÓN Y SERVIDOR ---

// Ruta principal para servir el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint de Registro
app.post('/api/register', (req, res) => {
  const { nombre, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Por favor completa todos los campos' });
  }
  return res.json({ success: true, message: 'Usuario registrado correctamente', user: { nombre, email } });
});

// Endpoint de Inicio de Sesión
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña requeridos' });
  }
  return res.json({ success: true, message: 'Inicio de sesión exitoso', user: { email } });
});

// --- RUTAS DE ALMACENAMIENTO R2 ---

// Listar archivos del Bucket
app.get('/api/files', async (req, res) => {
  try {
    const command = new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME });
    const response = await s3.send(command);
    const files = (response.Contents || []).map((file) => ({
      key: file.Key,
      size: file.Size,
      lastModified: file.LastModified,
      url: `${process.env.R2_PUBLIC_URL}/${file.Key}`,
    }));
    res.json({ success: true, files });
  } catch (error) {
    console.error('Error al listar archivos:', error);
    res.status(500).json({ error: 'Error al conectar con el almacenamiento R2' });
  }
});

// Subir archivo a R2
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se seleccionó ningún archivo' });
    }
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });
    await s3.send(command);
    res.json({
      success: true,
      message: 'Archivo subido con éxito',
      fileUrl: `${process.env.R2_PUBLIC_URL}/${fileName}`,
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ error: 'Fallo al guardar el archivo en R2' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor Starmarc Cloud ejecutándose en el puerto ${PORT}`);
});
