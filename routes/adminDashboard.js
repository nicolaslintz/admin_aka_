const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/auth');

router.get('/admin/dashboard', isAdmin, (req, res) => {
    res.render('adminDashboard'); 
});

module.exports = router;