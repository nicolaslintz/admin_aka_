const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const Cliente = require('./models/Cliente');
const { body, validationResult } = require('express-validator');
const User = require('./models/User');
const Product = require('./models/Product');
const HistorialDeCompra = require('./models/HistorialDeCompras');
const app = express();
const PORT = 3002;
require('dotenv').config();

// Configuración de Passport
require('./passport');

// Configuración de vistas y recursos estáticos
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'mi-secreto',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.urlencoded({ extended: true }));

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage });

// Redirección a la página de inicio
app.get('/', (req, res) => {
  res.redirect('/home'); 
});

// Rutas
app.get('/login', (req, res) => {
  res.render('login', { messages: req.flash('error') });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

// Página de inicio
app.get('/home', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('home', { user: req.user, products });
  } catch (err) {
    console.error('Error al cargar productos:', err);
    res.status(500).send('Error al cargar productos');
  }
});

// Rutas para productos
app.get('/productos', async (req, res) => {
  try {
    const productos = await Product.find();
    res.render('productos', { productos });
  } catch (err) {
    console.error('Error al cargar productos:', err);
    res.status(500).send('Error al cargar productos');
  }
});

app.get('/productos/create', (req, res) => {
  res.render('productos/create');
});

app.post('/productos/create', upload.single('image'), async (req, res) => {
  console.log('Nombre del archivo de imagen:', req.file);  

  try {
    const { name, price, quantity, category } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;

    console.log('Datos recibidos:', { name, price, quantity, category, image });  

    if (!name || !price || !quantity || !category || !image) {
      req.flash('error', 'Todos los campos son obligatorios');
      return res.redirect('/productos/create');
    }

    const newProduct = new Product({ name, price, quantity, category, image });
    await newProduct.save();

    console.log('Producto guardado:', newProduct); 

    req.flash('success', 'Producto agregado correctamente');
    res.redirect('/productos');
  } catch (err) {
    console.error('Error al agregar el producto:', err);
    req.flash('error', 'Hubo un error al agregar el producto');
    res.redirect('/productos/create');
  }
});

app.get('/productos/edit/:id', async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
    if (!producto) {
      return res.status(404).send('Producto no encontrado');
    }
    res.render('productos/edit', { producto });
  } catch (err) {
    console.error('Error al cargar producto:', err);
    res.status(500).send('Error al cargar producto');
  }
});

// Ruta para procesar la actualización del producto
app.post('/productos/edit/:id', upload.single('image'), async (req, res) => {
  try {
    console.log('Datos recibidos para editar:', req.body);
    console.log('Imagen recibida:', req.file);

    const { name, price, quantity, category } = req.body;
    const updatedProduct = { name, price, quantity, category };

    if (req.file) {
      updatedProduct.image = `/images/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updatedProduct, { new: true });

    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }

    res.redirect('/productos');
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).send('Error al actualizar producto');
  }
});

// Ruta para eliminar un producto
app.post('/productos/delete/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }
    res.redirect('/productos');
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).send('Error al eliminar producto');
  }
});

app.get('/historial-compras', async (req, res) => {
  try {
    const historial = await HistorialDeCompra.find()
      .populate('products.productId')  
      .exec();

    if (historial.length === 0) {
      return res.render('historialDeCompras', { historial: [] });
    }

    res.render('historialDeCompras', { historial });
  } catch (err) {
    console.error('Error al obtener el historial de compras:', err);
    res.status(500).send('Error al obtener el historial de compras');
  }
});

// Ruta para mostrar el historial de compras de un cliente específico
app.get('/historial/:clienteId', async (req, res) => {
  try {
    const clienteId = req.params.clienteId;

    const historial = await HistorialDeCompra.find({ clienteId: clienteId })
      .populate('products.productId') 
      .exec();

    if (historial.length === 0) {
      return res.render('historialDeCompras', { historial: [] });
    }

    res.render('historialDeCompras', { historial });
  } catch (err) {
    console.error('Error al obtener el historial de compras:', err);
    res.status(500).send('Error al obtener el historial de compras');
  }
});


// Ruta para mostrar todos los clientes
app.get('/clientes', async (req, res) => {
  try {
      console.log('Consultando los clientes...');
      const clientes = await Cliente.find();
      console.log('Clientes encontrados:', clientes);

      if (clientes.length === 0) {
          console.log('No hay clientes registrados.');
      }

      res.render('clientes', { clientes });
  } catch (err) {
      console.error('Error al obtener los clientes:', err);
      res.status(500).send('Error al obtener los clientes');
  }
});

// Eliminar un cliente
app.post('/clientes/eliminar/:id', async (req, res) => {
  try {
      const clienteId = req.params.id;
      const clienteEliminado = await Cliente.findByIdAndDelete(clienteId);

      if (!clienteEliminado) {
          console.log('Cliente no encontrado');
          return res.status(404).send('Cliente no encontrado');
      }

      console.log('Cliente eliminado');
      res.redirect('/clientes');
  } catch (err) {
      console.error('Error al eliminar el cliente:', err);
      res.status(500).send('Error al eliminar el cliente');
  }
});

// Conexión a MongoDB
mongoose.connect('mongodb+srv://lintz123:lintz123@cluster0.gb0xq.mongodb.net/?retryWrites=true&w=majority')
  .then(() => {
    console.log('Conectado a la base de datos');
  })
  .catch((err) => {
    console.error('Error al conectar a la base de datos:', err);
  });

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});