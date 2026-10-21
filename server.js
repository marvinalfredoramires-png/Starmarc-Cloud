const express = require('express');
const path = require('path');
const app = express();

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 1. SECURE LOGIN API ROUTE
// ==========================================
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Default valid credentials
    const emailValido = "marvinalfredoramires@gmail.com"; 
    const passwordValida = "Mrvin503"; 

    // Strict credential validation
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
// 2. LOGIN PAGE (GET /)
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
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="bg-slate-950 text-white flex items-center justify-center h-screen m-0 font-sans">
        <div class="bg-slate-900/90 p-8 rounded-2xl shadow-2xl w-96 border border-slate-800 backdrop-blur-md">
            <div class="flex justify-center mb-4">
                <div class="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/30">
                    <i class="fa-solid fa-cloud"></i>
                </div>
            </div>
            <h2 class="text-2xl font-bold mb-1 text-center text-white tracking-tight">STARMARC CLOUD</h2>
            <p class="text-xs text-slate-400 text-center mb-6">Ingresa tus credenciales para acceder</p>
            
            <form id="loginForm" class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-300">Correo electrónico</label>
                    <div class="relative">
                        <i class="fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                        <input type="email" id="emailInput" value="admin@starmarc.com" required class="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-white text-sm transition">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-300">Contraseña</label>
                    <div class="relative">
                        <i class="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                        <input type="password" id="passwordInput" value="123456" required class="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-white text-sm transition">
                    </div>
                </div>
                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold py-2.5 rounded-xl transition duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 text-sm mt-6">
                    <span>Iniciar Sesión</span>
                    <i class="fa-solid fa-arrow-right text-xs"></i>
                </button>
            </form>
            <p id="errorMsg" class="text-red-400 text-xs mt-4 text-center hidden bg-red-500/10 py-2 rounded-lg border border-red-500/20"></p>
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
// 3. COMPLETE CLOUD STORAGE DASHBOARD (GET /dashboard)
// ==========================================
app.get('/dashboard', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Starmarc Cloud - Panel de Gestión</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="bg-[#0b0f19] text-slate-100 min-h-screen font-sans flex flex-col md:flex-row overflow-x-hidden">
        
        <!-- BARRA LATERAL (SIDEBAR) -->
        <aside class="w-full md:w-64 bg-[#0e1422] border-r border-slate-800/70 p-5 flex flex-col justify-between shrink-0">
            <div>
                <!-- LOGO DE STARMARC CLOUD -->
                <div class="flex items-center space-x-3 px-2 mb-8">
                    <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-blue-600/30">
                        <i class="fa-solid fa-cloud"></i>
                    </div>
                    <div>
                        <span class="font-bold text-lg text-white tracking-wide block leading-tight">STARMARC</span>
                        <span class="text-xs text-blue-400 font-semibold tracking-widest uppercase">Cloud Storage</span>
                    </div>
                </div>

                <!-- MENÚ DE NAVEGACIÓN -->
                <nav class="space-y-1" id="sidebarNav">
                    <p class="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Navegación</p>
                    
                    <button onclick="setCategory('all')" id="nav-all" class="nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition text-blue-400 bg-blue-600/10 border border-blue-500/20">
                        <div class="flex items-center space-x-3">
                            <i class="fa-solid fa-folder-open w-5 text-center"></i>
                            <span>Mis Archivos</span>
                        </div>
                        <span id="badge-all" class="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">0</span>
                    </button>

                    <button onclick="setCategory('foto')" id="nav-foto" class="nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition text-slate-400 hover:text-white hover:bg-slate-800/50">
                        <div class="flex items-center space-x-3">
                            <i class="fa-solid fa-image w-5 text-center text-emerald-400"></i>
                            <span>Fotos</span>
                        </div>
                        <span id="badge-foto" class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">0</span>
                    </button>

                    <button onclick="setCategory('video')" id="nav-video" class="nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition text-slate-400 hover:text-white hover:bg-slate-800/50">
                        <div class="flex items-center space-x-3">
                            <i class="fa-solid fa-video w-5 text-center text-purple-400"></i>
                            <span>Videos</span>
                        </div>
                        <span id="badge-video" class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">0</span>
                    </button>

                    <button onclick="setCategory('documento')" id="nav-documento" class="nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition text-slate-400 hover:text-white hover:bg-slate-800/50">
                        <div class="flex items-center space-x-3">
                            <i class="fa-solid fa-file-lines w-5 text-center text-amber-400"></i>
                            <span>Documentos</span>
                        </div>
                        <span id="badge-documento" class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">0</span>
                    </button>

                    <div class="pt-4 mt-4 border-t border-slate-800/80">
                        <p class="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Papelera</p>
                        <button onclick="setCategory('trash')" id="nav-trash" class="nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition text-slate-400 hover:text-white hover:bg-slate-800/50">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-trash-can w-5 text-center text-rose-400"></i>
                                <span>Papelera</span>
                            </div>
                            <span id="badge-trash" class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">0</span>
                        </button>
                    </div>
                </nav>
            </div>

            <!-- ESPACIO DE ALMACENAMIENTO -->
            <div class="mt-8 bg-[#131a2b] p-4 rounded-2xl border border-slate-800/80">
                <div class="flex items-center justify-between text-xs font-semibold mb-2">
                    <span class="text-slate-300">Almacenamiento</span>
                    <span id="storageText" class="text-blue-400">23.9 MB / 1 GB</span>
                </div>
                <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div id="storageBar" class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style="width: 2.4%;"></div>
                </div>
                <p class="text-[11px] text-slate-500 mt-2">Plan Gratuito de Starmarc Cloud</p>
            </div>
        </aside>

        <!-- ÁREA PRINCIPAL -->
        <div class="flex-1 flex flex-col min-w-0">
            
            <!-- HEADER DE ENCABEZADO -->
            <header class="flex items-center justify-between px-8 py-4 border-b border-slate-800/70 bg-[#0b0f19]/90 backdrop-blur-md sticky top-0 z-40 gap-4">
                
                <!-- Buscador en Tiempo Real -->
                <div class="relative flex-1 max-w-md">
                    <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                    <input type="text" id="searchInput" oninput="renderFiles()" placeholder="Buscar en Starmarc Cloud..." class="w-full bg-[#131927] text-sm text-slate-200 pl-11 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 transition placeholder-slate-500">
                </div>

                <!-- Acciones & Perfil -->
                <div class="flex items-center space-x-4">
                    
                    <!-- Botón Oculto de Carga de Archivos -->
                    <input type="file" id="fileUploader" class="hidden" onchange="handleFileUpload(event)">
                    
                    <button onclick="document.getElementById('fileUploader').click()" class="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-lg shadow-blue-600/25">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <span class="hidden sm:inline">Subir archivo</span>
                    </button>

                    <!-- Perfil de Usuario -->
                    <div class="flex items-center space-x-3 border-l border-slate-800 pl-4">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                            SA
                        </div>
                        <div class="text-left leading-tight hidden lg:block">
                            <p class="text-sm font-semibold text-slate-200">Starmarc Admin</p>
                            <p class="text-xs text-slate-400">admin@starmarc.com</p>
                        </div>
                        <a href="/" class="ml-2 w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition" title="Cerrar sesión">
                            <i class="fa-solid fa-right-from-bracket text-sm"></i>
                        </a>
                    </div>
                </div>
            </header>

            <!-- CONTENIDO DE ARCHIVOS -->
            <main class="p-8 flex-1">
                
                <!-- CABECERA Y SELECCIÓN DE VISTA -->
                <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
                    <div>
                        <div class="flex items-center space-x-3">
                            <h1 id="sectionTitle" class="text-2xl font-bold text-white tracking-tight">Mis Archivos</h1>
                            <span id="activeTag" class="bg-blue-500/10 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/20">Todos</span>
                        </div>
                        <p id="sectionSubtitle" class="text-xs text-slate-400 mt-1">Arrastra tus archivos o utiliza el botón para subirlos dinómicamente</p>
                    </div>

                    <div class="flex items-center space-x-3">
                        <button id="emptyTrashBtn" onclick="emptyTrash()" class="hidden bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold px-3 py-2 rounded-xl transition">
                            <i class="fa-solid fa-broom mr-1.5"></i>Vaciar Papelera
                        </button>

                        <!-- Botones Cuadrícula / Lista -->
                        <div class="flex space-x-1 bg-[#131927] p-1 rounded-xl border border-slate-800">
                            <button id="viewGridBtn" onclick="setViewMode('grid')" class="p-2 text-blue-400 bg-slate-800 rounded-lg transition">
                                <i class="fa-solid fa-border-all"></i>
                            </button>
                            <button id="viewListBtn" onclick="setViewMode('list')" class="p-2 text-slate-400 hover:text-white transition">
                                <i class="fa-solid fa-list"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- RECEPTOR DE ARCHIVOS Y CONTENEDOR DE CUADRÍCULA/LISTA -->
                <div id="fileContainer" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    <!-- Los archivos se renderizan aquí dinámicamente -->
                </div>

                <!-- MENSAJE DE ESTADO VACÍO -->
                <div id="emptyState" class="hidden flex-col items-center justify-center py-20 text-center">
                    <div class="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-500 text-2xl mb-4">
                        <i class="fa-solid fa-folder-open"></i>
                    </div>
                    <p class="text-base font-semibold text-slate-300">No hay archivos en este apartado</p>
                    <p class="text-xs text-slate-500 max-w-xs mt-1">Sube nuevos archivos o revisa los filtros de búsqueda</p>
                </div>

            </main>
        </div>

        <!-- SCRIPTS DE INTERACTIVIDAD -->
        <script>
            // Estado global de la aplicación
            let currentCategory = 'all';
            let currentView = 'grid';

            // Archivos por defecto
            let files = [
                {
                    id: 1,
                    name: 'Logo_Starmarc_Studios.png',
                    type: 'foto',
                    sizeMB: 2.3,
                    date: 'Hace 2 horas',
                    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
                    inTrash: false
                },
                {
                    id: 2,
                    name: 'Arquitectura_Nube_v1.pdf',
                    type: 'documento',
                    sizeMB: 4.0,
                    date: 'Ayer',
                    url: null,
                    inTrash: false
                },
                {
                    id: 3,
                    name: 'Demo_Presentacion.mp4',
                    type: 'video',
                    sizeMB: 17.6,
                    date: 'Hace 3 días',
                    url: null,
                    inTrash: false
                }
            ];

            // Cambiar categoría activa desde la barra lateral
            function setCategory(cat) {
                currentCategory = cat;

                // Actualizar estilo visual de los botones del sidebar
                document.querySelectorAll('.nav-btn').forEach(btn => {
                    btn.classList.remove('text-blue-400', 'bg-blue-600/10', 'border', 'border-blue-500/20');
                    btn.classList.add('text-slate-400');
                });

                const activeBtn = document.getElementById(\`nav-\${cat}\`);
                if (activeBtn) {
                    activeBtn.classList.remove('text-slate-400');
                    activeBtn.classList.add('text-blue-400', 'bg-blue-600/10', 'border', 'border-blue-500/20');
                }

                // Actualizar títulos de sección
                const titles = {
                    'all': 'Mis Archivos',
                    'foto': 'Fotos',
                    'video': 'Videos',
                    'documento': 'Documentos',
                    'trash': 'Papelera'
                };
                document.getElementById('sectionTitle').textContent = titles[cat] || 'Archivos';
                document.getElementById('activeTag').textContent = cat === 'all' ? 'Todos' : cat.toUpperCase();

                // Mostrar/Ocultar botón de vaciar papelera
                const emptyBtn = document.getElementById('emptyTrashBtn');
                if (cat === 'trash') {
                    emptyBtn.classList.remove('hidden');
                } else {
                    emptyBtn.classList.add('hidden');
                }

                renderFiles();
            }

            // Alternar vista de cuadrícula/lista
            function setViewMode(mode) {
                currentView = mode;
                const gridBtn = document.getElementById('viewGridBtn');
                const listBtn = document.getElementById('viewListBtn');

                if (mode === 'grid') {
                    gridBtn.className = "p-2 text-blue-400 bg-slate-800 rounded-lg transition";
                    listBtn.className = "p-2 text-slate-400 hover:text-white transition";
                } else {
                    listBtn.className = "p-2 text-blue-400 bg-slate-800 rounded-lg transition";
                    gridBtn.className = "p-2 text-slate-400 hover:text-white transition";
                }

                renderFiles();
            }

            // Mover archivo a la papelera o restaurarlo
            function toggleTrash(id) {
                files = files.map(file => {
                    if (file.id === id) {
                        return { ...file, inTrash: !file.inTrash };
                    }
                    return file;
                });
                renderFiles();
            }

            // Vaciar papelera
            function emptyTrash() {
                files = files.filter(file => !file.inTrash);
                renderFiles();
            }

            // Manejar subida de nuevo archivo dinámico
            function handleFileUpload(event) {
                const uploadedFile = event.target.files[0];
                if (!uploadedFile) return;

                let type = 'documento';
                if (uploadedFile.type.startsWith('image/')) type = 'foto';
                else if (uploadedFile.type.startsWith('video/')) type = 'video';

                const newFile = {
                    id: Date.now(),
                    name: uploadedFile.name,
                    type: type,
                    sizeMB: (uploadedFile.size / (1024 * 1024)).toFixed(1),
                    date: 'Ahora mismo',
                    url: type === 'foto' ? URL.createObjectURL(uploadedFile) : null,
                    inTrash: false
                };

                files.unshift(newFile);
                renderFiles();
                event.target.value = ''; // Resetea el input
            }

            // Renderizado dinámico de archivos y contadores
            function renderFiles() {
                const searchTerm = document.getElementById('searchInput').value.toLowerCase();
                const container = document.getElementById('fileContainer');
                const emptyState = document.getElementById('emptyState');

                // Filtrar archivos según categoría y búsqueda
                let filteredFiles = files.filter(file => {
                    const matchesSearch = file.name.toLowerCase().includes(searchTerm);
                    
                    if (currentCategory === 'trash') {
                        return file.inTrash && matchesSearch;
                    }
                    
                    if (file.inTrash) return false;

                    if (currentCategory === 'all') return matchesSearch;
                    return file.type === currentCategory && matchesSearch;
                });

                // Actualizar contadores del Sidebar
                document.getElementById('badge-all').textContent = files.filter(f => !f.inTrash).length;
                document.getElementById('badge-foto').textContent = files.filter(f => !f.inTrash && f.type === 'foto').length;
                document.getElementById('badge-video').textContent = files.filter(f => !f.inTrash && f.type === 'video').length;
                document.getElementById('badge-documento').textContent = files.filter(f => !f.inTrash && f.type === 'documento').length;
                document.getElementById('badge-trash').textContent = files.filter(f => f.inTrash).length;

                // Actualizar barra de almacenamiento
                const totalMB = files.reduce((acc, f) => acc + parseFloat(f.sizeMB), 0).toFixed(1);
                document.getElementById('storageText').textContent = \`\${totalMB} MB / 1 GB\`;
                document.getElementById('storageBar').style.width = \`\${Math.min((totalMB / 1024) * 100, 100)}%\`;

                // Renderizado si está vacío
                if (filteredFiles.length === 0) {
                    container.innerHTML = '';
                    container.className = "";
                    emptyState.classList.remove('hidden');
                    emptyState.classList.add('flex');
                    return;
                }

                emptyState.classList.add('hidden');
                emptyState.classList.remove('flex');

                // Configurar layout (Grid / List)
                if (currentView === 'grid') {
                    container.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5";
                    container.innerHTML = filteredFiles.map(file => getGridCard(file)).join('');
                } else {
                    container.className = "flex flex-col space-y-3";
                    container.innerHTML = filteredFiles.map(file => getListRow(file)).join('');
                }
            }

            // Plantilla para Vista de Cuadrícula (Grid)
            function getGridCard(file) {
                let iconClass = "fa-file-lines text-amber-400";
                if (file.type === 'foto') iconClass = "fa-image text-emerald-400";
                if (file.type === 'video') iconClass = "fa-film text-purple-400";

                return \`
                <div class="bg-[#131a2a] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-3.5 transition group relative flex flex-col justify-between">
                    <div>
                        <div class="relative h-36 rounded-xl overflow-hidden mb-3 bg-[#0d1320] flex items-center justify-center">
                            \${file.url ? 
                                \`<img src="\${file.url}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">\` : 
                                \`<i class="fa-solid \${iconClass} text-4xl"></i>\`
                            }
                        </div>
                        <p class="font-medium text-sm text-slate-200 truncate" title="\${file.name}">\${file.name}</p>
                    </div>

                    <div class="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/60">
                        <span>\${file.sizeMB} MB</span>
                        <div class="flex items-center space-x-2">
                            <span>\${file.date}</span>
                            <button onclick="toggleTrash(\${file.id})" class="text-slate-500 hover:text-rose-400 p-1 transition" title="\${file.inTrash ? 'Restaurar' : 'Eliminar'}">
                                <i class="fa-solid \${file.inTrash ? 'fa-rotate-left' : 'fa-trash-can'}"></i>
                            </button>
                        </div>
                    </div>
                </div>
                \`;
            }

            // Plantilla para Vista de Lista (List)
            function getListRow(file) {
                let iconClass = "fa-file-lines text-amber-400";
                if (file.type === 'foto') iconClass = "fa-image text-emerald-400";
                if (file.type === 'video') iconClass = "fa-film text-purple-400";

                return \`
                <div class="bg-[#131a2a] border border-slate-800/80 hover:border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between transition">
                    <div class="flex items-center space-x-4 min-w-0 flex-1">
                        <div class="w-10 h-10 rounded-lg bg-[#0d1320] flex items-center justify-center shrink-0">
                            <i class="fa-solid \${iconClass} text-lg"></i>
                        </div>
                        <p class="font-medium text-sm text-slate-200 truncate">\${file.name}</p>
                    </div>

                    <div class="flex items-center space-x-6 text-xs text-slate-400 shrink-0 ml-4">
                        <span class="capitalize px-2 py-1 bg-slate-800 rounded-md text-slate-300">\${file.type}</span>
                        <span class="w-16 text-right">\${file.sizeMB} MB</span>
                        <span class="w-24 text-right hidden sm:inline">\${file.date}</span>
                        <button onclick="toggleTrash(\${file.id})" class="text-slate-500 hover:text-rose-400 p-1.5 transition" title="\${file.inTrash ? 'Restaurar' : 'Eliminar'}">
                            <i class="fa-solid \${file.inTrash ? 'fa-rotate-left' : 'fa-trash-can'}"></i>
                        </button>
                    </div>
                </div>
                \`;
            }

            // Inicialización al cargar la página
            window.onload = () => {
                renderFiles();
            };
        </script>
    </body>
    </html>
    `);
});

// ==========================================
// 4. PUERTO Y SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Starmarc Cloud ejecutándose en el puerto ${PORT}`);
});
