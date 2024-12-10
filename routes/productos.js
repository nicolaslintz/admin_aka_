const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get('/', productoController.listar);
router.post('/create', upload.single('imagen'), productoController.crear);
router.get('/edit/:id', productoController.editar);
router.post('/update/:id', upload.single('imagen'), productoController.actualizar);

module.exports = router;