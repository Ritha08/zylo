const express = require('express');
const router = express.Router();
const ParkingSlot = require('../models/ParkingSlot');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
    try {
        const slots = await ParkingSlot.find().sort({ slotNumber: 1 });
        res.json(slots);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { slotNumber, slotStatus } = req.body;
    if (!slotNumber) return res.status(400).json({ message: 'Slot number required' });
    try {
        const existing = await ParkingSlot.findOne({ slotNumber });
        if (existing) return res.status(400).json({ message: 'Slot already exists' });
        await ParkingSlot.create({ slotNumber, slotStatus: slotStatus || 'available' });
        res.status(201).json({ message: 'Parking slot added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;