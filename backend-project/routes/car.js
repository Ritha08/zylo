const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
    try {
        const cars = await Car.find().sort({ plateNumber: 1 });
        res.json(cars);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { plateNumber, driverName, phoneNumber } = req.body;
    if (!plateNumber || !driverName || !phoneNumber) {
        return res.status(400).json({ message: 'All fields required' });
    }
    try {
        const existing = await Car.findOne({ plateNumber });
        if (existing) return res.status(400).json({ message: 'Car already exists' });
        await Car.create({ plateNumber, driverName, phoneNumber });
        res.status(201).json({ message: 'Car added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;