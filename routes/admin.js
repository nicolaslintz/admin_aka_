const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();

// ruta para crear el administrador
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('El usuario ya existe');
        }

        const user = new User({ username, password });
        await user.save();
        res.send('Administrador creado con éxito');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;