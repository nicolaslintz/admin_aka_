const Producto = require('../models/Product');

exports.listar = async (req, res) => {
  try {
      const productos = await Producto.find();
      console.log(productos);
      res.render('productos/index', { productos });
  } catch (error) {
      console.error('Error al listar productos:', error);
      res.status(500).send('Error al listar productos');
  }
};

exports.crear = async (req, res) => {
    try {
        const { nombre, precio, cantidad, categoria } = req.body;
        const images = req.file ? req.file.path : null;

        const nuevoProducto = new Producto({
            name: nombre,
            price: precio,
            quantity: cantidad,
            category: traducirCategoria(categoria),
            images,
        });

        await nuevoProducto.save();
        res.redirect('/productos');
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).send('Error al crear producto');
    }
};

exports.editar = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).send('Producto no encontrado');
        }
        res.render('productos/edit', { producto });
    } catch (error) {
        console.error('Error al cargar el producto para editar:', error);
        res.status(500).send('Error al cargar el producto para editar');
    }
};

exports.actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, cantidad, categoria } = req.body;
        const images = req.file ? req.file.path : null;

        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).send('Producto no encontrado');
        }

        producto.name = nombre;
        producto.price = precio;
        producto.quantity = cantidad;
        producto.category = traducirCategoria(categoria);
        if (images) producto.images = images;

        await producto.save();
        res.redirect('/productos');
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).send('Error al actualizar producto');
    }
};