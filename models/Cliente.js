const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
});

const Cliente = mongoose.model('Cliente', clienteSchema, 'users'); 
module.exports = Cliente;
