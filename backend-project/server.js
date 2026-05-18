const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const bcrypt = require('bcrypt');
const User = require('./models/User');

dotenv.config();

const app = express();
connectDB();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 2 }
}));

// Seed default admin user if not exists
async function seedDefaultUser() {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
        const hashedPwd = await bcrypt.hash('Admin@123', 10);
        await User.create({ username: 'admin', password: hashedPwd });
        console.log('Default admin user created: admin / Admin@123');
    }
}
seedDefaultUser();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/car'));
app.use('/api/parking-slots', require('./routes/parkingSlot'));
app.use('/api/parking-records', require('./routes/parkingRecord'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/reports', require('./routes/report'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));