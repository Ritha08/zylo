const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const ParkingRecord = require('../models/ParkingRecord');
const Car = require('../models/Car');
const auth = require('../middleware/auth');

router.use(auth);

// Daily payment report (filter by paymentDate = today)
router.get('/daily-payments', async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date required (YYYY-MM-DD)' });
    try {
        const start = new Date(date);
        start.setHours(0,0,0,0);
        const end = new Date(date);
        end.setHours(23,59,59,999);
        
        const payments = await Payment.find({ paymentDate: { $gte: start, $lte: end } }).populate('parkingRecordId');
        const result = [];
        for (let p of payments) {
            const record = p.parkingRecordId;
            const car = await Car.findOne({ plateNumber: record.plateNumber });
            result.push({
                plateNumber: car ? car.plateNumber : record.plateNumber,
                entryTime: record.entryTime,
                exitTime: record.exitTime,
                duration: record.duration,
                amountPaid: p.amountPaid
            });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generate bill for a specific parking record (by record id)
router.get('/bill/:recordId', async (req, res) => {
    const recordId = req.params.recordId;
    try {
        const record = await ParkingRecord.findById(recordId);
        if (!record) return res.status(404).json({ message: 'Record not found' });
        const car = await Car.findOne({ plateNumber: record.plateNumber });
        const payment = await Payment.findOne({ parkingRecordId: recordId });
        res.json({
            plateNumber: car ? car.plateNumber : record.plateNumber,
            entryTime: record.entryTime,
            exitTime: record.exitTime,
            duration: record.duration,
            amount: record.amount,
            amountPaid: payment ? payment.amountPaid : null,
            paymentDate: payment ? payment.paymentDate : null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all completed records (for bill selection dropdown)
router.get('/completed-records', async (req, res) => {
    try {
        const records = await ParkingRecord.find({ exitTime: { $ne: null } });
        const result = [];
        for (let rec of records) {
            const car = await Car.findOne({ plateNumber: rec.plateNumber });
            result.push({
                id: rec._id,
                plateNumber: car ? car.plateNumber : rec.plateNumber,
                entryTime: rec.entryTime,
                exitTime: rec.exitTime
            });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;