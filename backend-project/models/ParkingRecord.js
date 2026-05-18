const mongoose = require('mongoose');

const ParkingRecordSchema = new mongoose.Schema({
    plateNumber: { type: String, required: true, ref: 'Car' },
    slotNumber: { type: String, required: true, ref: 'ParkingSlot' },
    entryTime: { type: Date, required: true },
    exitTime: { type: Date },
    duration: { type: Number },      // in hours
    amount: { type: Number }         // calculated fee (RWF)
});

module.exports = mongoose.model('ParkingRecord', ParkingRecordSchema);