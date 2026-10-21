const express = require('express');
const path = require('path');
const app = express();

// Middleware para procesar JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 1. RUTA DE INICIO DE SESIÓN SEGURO
// ==========================================
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // CREDENCIALES VÁLIDAS DE ACCESO
    const emailValido = "marvinalfredoramires@gmail.com"; 
    const passwordValida = "Marvin503"; 

    // Validación estricta
    if (email !== emailValido || password !== passwordValida) {
        return res.status(401).json({ 
            success: false, 
            message: 'Correo o contraseña incorrectos. Acceso denegado.' 
        });
    }

    return res.status(200).json({ 
        success: true, 
        message: 'Inicio de sesión exitoso' 
    });
});

// ==========================================
// 2. FORMULARIO DE INICIO DE SESIÓN (LOGIN)
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
    <body class="bg-slate-900 text-white flex items-center justify-center h-screen m-0">
        <div class="bg-slate-800 p-8 rounded-2xl shadow-xl w-96 border border-slate-700">
            <h2 class="text-2xl font-bold mb-6 text-center text-sky-400">STARMARC CLOUD</h2>
            
            <form id="loginForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Correo electrónico</label>
                    <input type="email" id="emailInput" required class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-sky-500 text-white">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Contraseña</label>
                    <input type="password" id="passwordInput" required class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-sky-500 text-white">
                </div>
                <button type="submit" class="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-lg transition duration-200">
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
                        // REDIRECCIÓN DIRECTA A LA INTERFAZ DE ARCHIVOS
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
// 3. INTERFAZ COMPLETA DE ARCHIVOS (DASHBOARD)
// ==========================================
app.get('/dashboard', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Starmarc Cloud - Mis Archivos</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="bg-[#0b0f19] text-slate-100 min-h-screen font-sans">
        
        <!-- BARRA SUPERIOR DE NAVEGACIÓN -->
        <header class="flex items-center justify-between px-8 py-4 border-b border-slate-800/60 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-50">
            <!-- Buscador -->
            <div class="relative w-1/3">
                <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input type="text" placeholder="Buscar en Starmarc Cloud..." class="w-full bg-[#131927] text-sm text-slate-200 pl-11 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500 placeholder-slate-500">
            </div>

            <!-- Botón Subir & Perfil -->
            <div class="flex items-center space-x-6">
                <button class="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-lg shadow-blue-600/20">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    <span>Subir archivo</span>
                </button>

                <div class="flex items-center space-x-3 border-l border-slate-800 pl-6">
                    <div class="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white text-sm">
                        SS
                    </div>
                    <div class="text-left leading-tight">
                        <p class="text-sm font-semibold text-slate-200">Starmarc Admin</p>
                        <p class="text-xs text-slate-400">admin@starmarc.com</p>
                    </div>
                    <a href="/" class="ml-2 text-slate-400 hover:text-red-400 transition" title="Cerrar sesión">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </a>
                </div>
            </div>
        </header>

        <!-- CONTENIDO PRINCIPAL -->
        <main class="p-8 max-w-7xl mx-auto">
            <!-- Título y selector de vista -->
            <div class="flex justify-between items-end mb-6">
                <div>
                    <div class="flex items-center space-x-3">
                        <h1 class="text-2xl font-bold text-white">Mis Archivos</h1>
                        <span class="bg-blue-500/10 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-500/20">Todos</span>
                    </div>
                    <p class="text-sm text-slate-400 mt-1">Arrastra y suelta tus archivos en cualquier lugar para subirlos</p>
                </div>

                <!-- Botones Cuadrícula / Lista -->
                <div class="flex space-x-1 bg-[#131927] p-1 rounded-lg border border-slate-800">
                    <button class="p-2 text-sky-400 bg-slate-800/80 rounded-md shadow-sm">
                        <i class="fa-solid fa-border-all"></i>
                    </button>
                    <button class="p-2 text-slate-400 hover:text-white transition">
                        <i class="fa-solid fa-list"></i>
                    </button>
                </div>
            </div>

            <!-- TARJETAS DE ARCHIVOS -->
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                
                <!-- Archivo 1: Imagen -->
                <div class="bg-[#131a2a] border border-slate-800/80 rounded-2xl p-3 hover:border-slate-700 transition group cursor-pointer relative">
                    <div class="relative h-40 rounded-xl overflow-hidden mb-3 bg-slate-900">
                        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                        <span class="absolute top-2 right-2 bg-amber-500 text-black text-xs p-1 rounded-full"><i class="fa-solid fa-star"></i></span>
                    </div>
                    <p class="font-semibold text-sm text-slate-200 truncate">Logo_Starmarc_Studios.png</p>
                    <div class="flex justify-between text-xs text-slate-400 mt-1">
                        <span>2.3 MB</span>
                        <span>Hace 2 horas</span>
                    </div>
                </div>

                <!-- Archivo 2: PDF -->
                <div class="bg-[#131a2a] border border-slate-800/80 rounded-2xl p-3 hover:border-slate-700 transition group cursor-pointer">
                    <div class="h-40 rounded-xl bg-[#0f1523] flex items-center justify-center mb-3">
                        <i class="fa-solid fa-file-pdf text-amber-500 text-4xl"></i>
                    </div>
                    <p class="font-semibold text-sm text-slate-200 truncate">Arquitectura_Nube_v1.pdf</p>
                    <div class="flex justify-between text-xs text-slate-400 mt-1">
                        <span>4 MB</span>
                        <span>Ayer</span>
                    </div>
                </div>

                <!-- Archivo 3: Video -->
                <div class="bg-[#131a2a] border border-slate-800/80 rounded-2xl p-3 hover:border-slate-700 transition group cursor-pointer">
                    <div class="h-40 rounded-xl bg-[#0f1523] flex items-center justify-center mb-3">
                        <i class="fa-sharp fa-solid fa-film text-purple-400 text-4xl"></i>
                    </div>
                    <p class="font-semibold text-sm text-slate-200 truncate">Demo_Presentacion.mp4</p>
                    <div class="flex justify-between text-xs text-slate-400 mt-1">
                        <span>17.6 MB</span>
                        <span>Hace 3 días</span>
                    </div>
                </div>

            </div>
        </main>
    </body>
    </html>
    `);
});

// ==========================================
// 4. INICIO DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
