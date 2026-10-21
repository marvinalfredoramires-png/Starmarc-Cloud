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

    // Credenciales válidas requeridas
    const emailValido = "marvinalfredoramires@gmail.com";
    const passwordValida = "Marvin503"; 

    // Validación estricta: Deniega el acceso si el correo o la contraseña no coinciden
    if (email !== emailValido || password !== passwordValida) {
        return res.status(401).json({ 
            success: false, 
            message: 'Correo o contraseña incorrectos. Acceso denegado.' 
        });
    }

    // Respuesta de éxito únicamente si las credenciales son correctas
    return res.status(200).json({ 
        success: true, 
        message: 'Inicio de sesión exitoso' 
    });
});

// ==========================================
// 2. INTERFAZ Y VALIDACIÓN EN EL FRONTEND
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
            // Lógica de control en el navegador
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

                    // BLOQUEO ESTRICTO: Solo permite avanzar si el servidor valida las credenciales
                    if (response.ok && data.success) {
                        alert('¡Acceso concedido!');
                        // window.location.href = '/dashboard'; // Redirección al panel
                    } else {
                        // Muestra el mensaje de error y detiene el acceso
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
// 3. PUERTO Y SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
