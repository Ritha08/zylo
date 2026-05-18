const mongoose = require('mongoose');

const ParkingSlotSchema = new mongoose.Schema({
    slotNumber: { type: String, required: true, unique: true },
    slotStatus: { type: String, enum: ['available', 'occupied'], default: 'available' }
});

module.exports = mongoose.model('ParkingSlot', ParkingSlotSchema);