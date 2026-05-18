const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const ParkingRecord = require('../models/ParkingRecord');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
    try {
        const payments = await Payment.find().sort({ paymentDate: -1 }).populate('parkingRecordId');
        const enriched = [];
        for (let p of payments) {
            const record = p.parkingRecordId;
            enriched.push({
                id: p._id,
                parkingRecordId: record._id,
                plateNumber: record.plateNumber,
                entryTime: record.entryTime,
                exitTime: record.exitTime,
                amountPaid: p.amountPaid,
                paymentDate: p.paymentDate,
                calculatedAmount: record.amount
            });
        }
        res.json(enriched);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { parkingRecordId, amountPaid, paymentDate } = req.body;
    if (!parkingRecordId || !amountPaid || !paymentDate) {
        return res.status(400).json({ message: 'All fields required' });
    }
    try {
        const record = await ParkingRecord.findById(parkingRecordId);
        if (!record || !record.exitTime) {
            return res.status(400).json({ message: 'Parking record not completed or no exit time' });
        }
        await Payment.create({
            parkingRecordId,
            amountPaid,
            paymentDate: new Date(paymentDate)
        });
        res.status(201).json({ message: 'Payment recorded' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;