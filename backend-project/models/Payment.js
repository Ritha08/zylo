const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    parkingRecordId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'ParkingRecord' },
    amountPaid: { type: Number, required: true },
    paymentDate: { type: Date, required: true }
});

module.exports = mongoose.model('Payment', PaymentSchema);