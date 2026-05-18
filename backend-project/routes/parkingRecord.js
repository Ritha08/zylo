const express = require('express');
const router = express.Router();
const ParkingRecord = require('../models/ParkingRecord');
const ParkingSlot = require('../models/ParkingSlot');
const auth = require('../middleware/auth');

router.use(auth);

// Helper: calculate duration & amount (500 RWF per started hour)
function calculateAmount(entryTime, exitTime) {
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const diffHours = Math.max(0, (exit - entry) / (1000 * 60 * 60));
    const roundedHours = Math.ceil(diffHours);
    const amount = roundedHours * 500;
    return { duration: parseFloat(diffHours.toFixed(2)), amount };
}

// GET all parking records (populate car and slot details)
router.get('/', async (req, res) => {
    try {
        const records = await ParkingRecord.find().sort({ entryTime: -1 });
        // Optionally populate additional details from Car and ParkingSlot if needed
        const enriched = [];
        for (let rec of records) {
            const car = await require('../models/Car').findOne({ plateNumber: rec.plateNumber });
            const slot = await ParkingSlot.findOne({ slotNumber: rec.slotNumber });
            enriched.push({
                ...rec._doc,
                driverName: car ? car.driverName : null,
                phoneNumber: car ? car.phoneNumber : null,
                slotStatus: slot ? slot.slotStatus : null
            });
        }
        res.json(enriched);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// INSERT new parking record (entry only)
router.post('/', async (req, res) => {
    const { plateNumber, slotNumber, entryTime } = req.body;
    if (!plateNumber || !slotNumber || !entryTime) {
        return res.status(400).json({ message: 'plateNumber, slotNumber, entryTime required' });
    }
    try {
        const slot = await ParkingSlot.findOne({ slotNumber });
        if (!slot) return res.status(404).json({ message: 'Slot not found' });
        if (slot.slotStatus !== 'available') return res.status(400).json({ message: 'Slot is occupied' });

        await ParkingRecord.create({ plateNumber, slotNumber, entryTime: new Date(entryTime) });
        // Update slot status
        slot.slotStatus = 'occupied';
        await slot.save();
        res.status(201).json({ message: 'Parking record created (entry logged)' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE exit time (and compute duration/amount)
router.put('/:id', async (req, res) => {
    const recordId = req.params.id;
    const { exitTime } = req.body;
    if (!exitTime) return res.status(400).json({ message: 'exitTime required' });
    try {
        const record = await ParkingRecord.findById(recordId);
        if (!record) return res.status(404).json({ message: 'Record not found' });
        if (record.exitTime) return res.status(400).json({ message: 'Exit already recorded' });

        const { duration, amount } = calculateAmount(record.entryTime, exitTime);
        record.exitTime = new Date(exitTime);
        record.duration = duration;
        record.amount = amount;
        await record.save();

        // Free the slot
        const slot = await ParkingSlot.findOne({ slotNumber: record.slotNumber });
        if (slot) {
            slot.slotStatus = 'available';
            await slot.save();
        }
        res.json({ message: 'Exit time recorded', duration, amount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE parking record (permanent)
router.delete('/:id', async (req, res) => {
    const recordId = req.params.id;
    try {
        const record = await ParkingRecord.findById(recordId);
        if (!record) return res.status(404).json({ message: 'Record not found' });
        // Free the slot
        const slot = await ParkingSlot.findOne({ slotNumber: record.slotNumber });
        if (slot) {
            slot.slotStatus = 'available';
            await slot.save();
        }
        await ParkingRecord.findByIdAndDelete(recordId);
        res.json({ message: 'Parking record deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;