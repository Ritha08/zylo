const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });
        
        req.session.userId = user._id;
        req.session.username = user.username;
        res.json({ message: 'Login successful', user: { id: user._id, username: user.username } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: 'Logout failed' });
        res.json({ message: 'Logged out' });
    });
});

router.get('/session', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});

module.exports = router;