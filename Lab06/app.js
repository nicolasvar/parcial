// Importar dependencias
const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('./public/scripts/config'); // Configuración externa (clave secreta, puerto, etc.)
const path = require('path'); // Módulo para manejar rutas de archivos

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Ruta para servir archivos estáticos (HTML, CSS, JS, imágenes)
app.use(express.static('public'));

// Middleware global (prueba de paso por todas las rutas con /user)
app.all('/user', (req, res, next) => {
    console.log('Paso por aquí');
    next();
});

// Ruta para mostrar el formulario de login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/login.html'));
});

// Ruta para mostrar el formulario de registro
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/register.html'));
});

// Nueva ruta para mostrar inici.html después de un login exitoso
app.get('/inici', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/inici.html'));
});

// Ruta para registro (simulado)
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    console.log(`Post página de register: Usuario: ${username}, Contraseña: ${password}`);

    // Verificar credenciales (esto es solo una simulación)
    if (username === 'Jose Perez' && password === '29') {
        console.log(`Usuario correcto: ${username}, Contraseña: ${password}`);

        // Creación del payload para el token
        const user = {
            nombre: username,
            password: password
        };

        // Generar JWT con un tiempo de expiración de 20 segundos
        jwt.sign({ user }, config.secret, { expiresIn: '20s' }, (err, token) => {
            if (err) {
                return res.status(500).json({ message: 'Error al generar el token' });
            }
            res.json({ token });
        });
    } else {
        return res.status(401).json({
            auth: false,
            message: 'Credenciales incorrectas, no tienes token'
        });
    }
});

// Ruta para login (verificación con token y redirección)
app.post('/signin', (req, res) => {
    const { username, password } = req.body;

    if (username === 'Jose Perez' && password === '29') {
        // Crear token
        const user = { nombre: username };
        jwt.sign({ user }, config.secret, { expiresIn: '20s' }, (err, token) => {
            if (err) {
                res.status(500).json({ message: 'Error al generar el token' });
            } else {
                // Redirigir a 'inici.html' después de un inicio de sesión exitoso
                res.redirect('/inici');
            }
        });
    } else {
        res.status(401).json({
            auth: false,
            message: 'Credenciales incorrectas'
        });
    }
});

// Middleware para verificar el token
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        // Obtener el token del encabezado
        const bearerToken = bearerHeader.split(" ")[1];
        req.token = bearerToken;
        next();
    } else {
        res.status(401).json({
            auth: false,
            message: 'Token no proveído'
        });
    }
}

// Levantar el servidor en el puerto especificado
app.listen(config.port, () => {
    console.log(`Servidor corriendo en el puerto ${config.port}, http://localhost:${config.port}`);
});
