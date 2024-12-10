const express = require('express');
const passport = require('passport');
const router = express.Router();

// ruta para el login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

module.exports = router;
