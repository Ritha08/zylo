const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
    plateNumber: { type: String, required: true, unique: true },
    driverName: { type: String, required: true },
    phoneNumber: { type: String, required: true }
});

module.exports = mongoose.model('Car', CarSchema);