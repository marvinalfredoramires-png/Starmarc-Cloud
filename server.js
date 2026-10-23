const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const crypto = require('crypto');
const app = express();

// Configuración en memoria RAM pura (Cero uso de disco local, ideal para servidores con poco espacio)
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// CONFIGURACIÓN DE CLOUDFLARE R2
// ==========================================
const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

// ==========================================
// 1. AUTENTICACIÓN
// ==========================================
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === "marvinalfredoramires@gmail.com" && password === "Marvin503") {
        return res.status(200).json({ success: true });
    }
    return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
});

// ==========================================
// 2. SUBIR DIRECTAMENTE A R2 (DESDE MEMORIA)
// ==========================================
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se seleccionó ningún archivo.' });
        }

        const uniqueSuffix = crypto.randomBytes(6).toString('hex');
        const fileName = `${uniqueSuffix}-${req.file.originalname}`;

        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer, // Viaja directo desde la RAM hacia tu nube R2
            ContentType: req.file.mimetype,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        return res.status(200).json({
            success: true,
            file: {
                name: req.file.originalname,
                storedName: fileName,
                size: (req.file.size / (1024 * 1024)).toFixed(1) + ' MB',
                type: req.file.mimetype
            }
        });
    } catch (error) {
        console.error('R2 Error REALR2:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 3. PANTALLA DE LOGIN
// ==========================================
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Starmarc Cloud - Iniciar Sesión</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#0b0f19] text-white flex items-center justify-center h-screen m-0 font-sans">
        <div class="bg-[#131a2a] p-8 rounded-2xl shadow-2xl w-96 border border-slate-800">
            <h2 class="text-2xl font-bold mb-6 text-center text-sky-400 tracking-wider">STARMARC CLOUD</h2>
            <form id="loginForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1 text-slate-300">Correo electrónico</label>
                    <input type="email" id="emailInput" required class="w-full px-3 py-2.5 bg-[#0b0f19] border border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 text-white text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1 text-slate-300">Contraseña</label>
                    <input type="password" id="passwordInput" required class="w-full px-3 py-2.5 bg-[#0b0f19] border border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 text-white text-sm">
                </div>
                <button type="submit" class="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 rounded-xl transition duration-200 shadow-lg shadow-sky-500/20">
                    Iniciar Sesión
                </button>
            </form>
            <p id="errorMsg" class="text-red-400 text-sm mt-4 text-center hidden"></p>
        </div>
        <script>
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('emailInput').value;
                const password = document.getElementById('passwordInput').value;
                const errorMsg = document.getElementById('errorMsg');
                errorMsg.classList.add('hidden');
                try {
                    const response = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    const data = await response.json();
                    if (response.ok && data.success) {
                        window.location.href = '/dashboard'; 
                    } else {
                        errorMsg.textContent = data.message || 'Credenciales inválidas';
                        errorMsg.classList.remove('hidden');
                    }
                } catch (error) {
                    errorMsg.textContent = 'Error de conexión con el servidor.';
                    errorMsg.classList.remove('hidden');
                }
            });
        </script>
    </body>
    </html>
    `);
});

// ==========================================
// 4. PANEL PRINCIPAL (INTERFAZ EXACTA DE TU CAPTURA)
// ==========================================
app.get('/dashboard', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Starmarc Cloud - Cloud Storage</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="bg-[#0b0f19] text-slate-100 min-h-screen font-sans flex">

        <!-- BARRA LATERAL -->
        <aside class="w-72 bg-[#0b0f19] border-r border-slate-800/80 flex flex-col justify-between p-6 select-none">
            <div>
                <!-- Logo -->
                <div class="flex items-center space-x-3 mb-10">
                    <div class="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-600/30">
                        <i class="fa-solid fa-cloud text-xl"></i>
                    </div>
                    <div>
                        <h1 class="font-bold text-white tracking-wider text-base">STARMARC</h1>
                        <p class="text-[10px] text-sky-400 font-semibold tracking-widest uppercase">Cloud Storage</p>
                    </div>
                </div>

                <!-- Navegación -->
                <div class="mb-6">
                    <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Navegación</p>
                    <nav class="space-y-1.5">
                        <a href="#" onclick="filterCategory('todos')" id="nav-todos" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium bg-blue-600/10 text-sky-400 border border-blue-500/20 transition">
                            <div class="flex items-center space-x-3"><i class="fa-solid fa-folder w-5"></i><span>Mis Archivos</span></div>
                            <span class="bg-blue-500/20 text-xs px-2 py-0.5 rounded-full">3</span>
                        </a>
                        <a href="#" onclick="filterCategory('fotos')" id="nav-fotos" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition">
                            <div class="flex items-center space-x-3"><i class="fa-solid fa-image w-5"></i><span>Fotos</span></div>
                            <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800">1</span>
                        </a>
                        <a href="#" onclick="filterCategory('videos')" id="nav-videos" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition">
                            <div class="flex items-center space-x-3"><i class="fa-solid fa-video w-5"></i><span>Videos</span></div>
                            <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800">1</span>
                        </a>
                        <a href="#" onclick="filterCategory('documentos')" id="nav-documentos" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition">
                            <div class="flex items-center space-x-3"><i class="fa-solid fa-file-lines w-5"></i><span>Documentos</span></div>
                            <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800">1</span>
                        </a>
                    </nav>
                </div>

                <!-- Papelera -->
                <div>
                    <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Papelera</p>
                    <a href="#" onclick="filterCategory('papelera')" id="nav-papelera" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition">
                        <div class="flex items-center space-x-3"><i class="fa-solid fa-trash w-5"></i><span>Papelera</span></div>
                        <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800">0</span>
                    </a>
                </div>
            </div>

            <!-- Medidor de Almacenamiento -->
            <div class="bg-[#131a2a] p-4 rounded-2xl border border-slate-800/80">
                <div class="flex justify-between text-xs mb-2">
                    <span class="text-slate-300 font-medium">Almacenamiento</span>
                    <span class="text-sky-400 font-semibold">23.9 MB / 1 GB</span>
                </div>
                <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                    <div class="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full" style="width: 2.3%;"></div>
                </div>
                <p class="text-[11px] text-slate-500">Plan Gratuito de Starmarc Cloud</p>
            </div>
        </aside>

        <!-- CONTENIDO PRINCIPAL -->
        <div class="flex-1 flex flex-col min-h-screen">
            <!-- Barra Superior -->
            <header class="flex items-center justify-between px-8 py-4 border-b border-slate-800/80 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-50">
                <div class="relative w-1/3">
                    <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input type="text" id="searchInput" oninput="searchFiles(this.value)" placeholder="Buscar en Starmarc Cloud..." class="w-full bg-[#131927] text-sm text-slate-200 pl-11 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500 placeholder-slate-500">
                </div>
                <div class="flex items-center space-x-6">
                    <input type="file" id="fileInput" class="hidden">
                    <button onclick="document.getElementById('fileInput').click()" class="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-lg shadow-blue-600/20 cursor-pointer">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <span>Subir archivo</span>
                    </button>
                    <div class="flex items-center space-x-3 border-l border-slate-800 pl-6">
                        <div class="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md">SA</div>
                        <div class="text-left leading-tight">
                            <p class="text-sm font-semibold text-slate-200">Starmarc Admin</p>
                            <p class="text-xs text-slate-400">admin@starmarc.com</p>
                        </div>
                        <a href="/" class="ml-2 text-slate-400 hover:text-red-400 transition" title="Cerrar sesión">
                            <i class="fa-solid fa-right-from-bracket text-base"></i>
                        </a>
                    </div>
                </div>
            </header>

            <!-- Área de Archivos -->
            <main class="p-8 max-w-7xl mx-auto flex-1 w-full">
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <div class="flex items-center space-x-3">
                            <h2 id="currentCategoryTitle" class="text-2xl font-bold text-white">Mis Archivos</h2>
                            <span id="currentCategoryBadge" class="bg-blue-500/10 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-500/20">Todos</span>
                        </div>
                        <p class="text-sm text-slate-400 mt-1">Arrastra tus archivos o utiliza el botón para subirlos dinámicamente</p>
                    </div>
                    <div class="flex space-x-1 bg-[#131927] p-1 rounded-lg border border-slate-800">
                        <button class="p-2 text-sky-400 bg-slate-800/80 rounded-md shadow-sm"><i class="fa-solid fa-border-all text-sm"></i></button>
                        <button class="p-2 text-slate-400 hover:text-white transition"><i class="fa-solid fa-list text-sm"></i></button>
                    </div>
                </div>

                <!-- Cuadrícula de Archivos -->
                <div id="fileGrid" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <div class="file-card bg-[#131a2a] border border-slate-800/80 rounded-2xl p-3 hover:border-slate-700 transition group cursor-pointer relative" data-type="fotos" data-name="Logo_Starmarc_Studios.png">
                        <div class="relative h-40 rounded-xl overflow-hidden mb-3 bg-slate-900 flex items-center justify-center">
                            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                        </div>
                        <p class="font-semibold text-sm text-slate-200 truncate">Logo_Starmarc_Studios.png</p>
                        <div class="flex justify-between items-center text-xs text-slate-400 mt-1">
                            <span>2.3 MB</span>
                            <span>Hace 2 horas</span>
                        </div>
                    </div>

                    <div class="file-card bg-[#131a2a] border border-slate-800/80 rounded-2xl p-3 hover:border-slate-700 transition group cursor-pointer relative" data-type="documentos" data-name="Arquitectura_Nube_v1.pdf">
                        <div class="h-40 rounded-xl bg-[#0f1523] flex items-center justify-center mb-3">
                            <i class="fa-solid fa-file-pdf text-amber-500 text-4xl"></i>
                        </div>
                        <p class="font-semibold text-sm text-slate-200 truncate">Arquitectura_Nube_v1.pdf</p>
                        <div class="flex justify-between items-center text-xs text-slate-400 mt-1">
                            <span>4 MB</span>
                            <span>Ayer</span>
                        </div>
                    </div>

                    <div class="file-card bg-[#131a2a] border border-slate-800/80 rounded-2xl p-3 hover:border-slate-700 transition group cursor-pointer relative" data-type="videos" data-name="Demo_Presentacion.mp4">
                        <div class="h-40 rounded-xl bg-[#0f1523] flex items-center justify-center mb-3">
                            <i class="fa-solid fa-film text-purple-400 text-4xl"></i>
                        </div>
                        <p class="font-semibold text-sm text-slate-200 truncate">Demo_Presentacion.mp4</p>
                        <div class="flex justify-between items-center text-xs text-slate-400 mt-1">
                            <span>17.6 MB</span>
                            <span>Hace 3 días</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <script>
            // Conexión con Cloudflare R2
            document.getElementById('fileInput').addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const formData = new FormData();
                formData.append('file', file);

                const alertBox = document.createElement('div');
                alertBox.className = 'fixed bottom-5 right-5 bg-sky-600 text-white px-4 py-2 rounded-xl shadow-xl z-50 text-sm';
                alertBox.innerText = 'Subiendo directo a tu nube R2...';
                document.body.appendChild(alertBox);

                try {
                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await res.json();

                    if (res.ok && data.success) {
                        alertBox.innerText = '¡Guardado con éxito en tu nube R2!';
                        setTimeout(() => location.reload(), 1500);
                    } else {
                        alertBox.className = 'fixed bottom-5 right-5 bg-red-600 text-white px-4 py-2 rounded-xl shadow-xl z-50 text-sm';
                        alertBox.innerText = 'Error: ' + data.message;
                    }
                } catch (err) {
                    alertBox.className = 'fixed bottom-5 right-5 bg-red-600 text-white px-4 py-2 rounded-xl shadow-xl z-50 text-sm';
                    alertBox.innerText = 'Error de conexión con el servidor.';
                }
            });

            function filterCategory(category) {
                document.querySelectorAll('aside nav a').forEach(el => {
                    el.className = "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition";
                });
                const activeEl = document.getElementById('nav-' + category);
                if(activeEl) {
                    activeEl.className = "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium bg-blue-600/10 text-sky-400 border border-blue-500/20 transition";
                }

                document.getElementById('currentCategoryTitle').innerText = category === 'todos' ? 'Mis Archivos' : category.charAt(0).toUpperCase() + category.slice(1);
                document.getElementById('currentCategoryBadge').innerText = category.charAt(0).toUpperCase() + category.slice(1);

                document.querySelectorAll('.file-card').forEach(card => {
                    if (category === 'todos' || card.getAttribute('data-type') === category) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }

            function searchFiles(query) {
                const q = query.toLowerCase();
                document.querySelectorAll('.file-card').forEach(card => {
                    const name = card.getAttribute('data-name').toLowerCase();
                    card.style.display = name.includes(q) ? 'block' : 'none';
                });
            }
        </script>
    </body>
    </html>
    `);
});

// ==========================================
// 5. INICIAR SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
