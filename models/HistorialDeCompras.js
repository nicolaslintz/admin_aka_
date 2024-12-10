const mongoose = require('mongoose');

const historialDeCompraSchema = new mongoose.Schema({
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto', 
      required: true
    },
    cantidad: {
      type: Number,
      required: true
    },
    precio: {
      type: Number,
      required: true
    }
  }],
  total: {
    type: Number,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

const HistorialDeCompra = mongoose.model('HistorialDeCompra', historialDeCompraSchema);
module.exports = HistorialDeCompra;