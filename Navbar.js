import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './frontend-project/src/api';

export default function Navbar({ onLogout }) {
    const navigate = useNavigate();
    const handleLogout = async () => {
        await api.post('/auth/logout');
        onLogout();
        navigate('/');
    };
    return (
        <nav className="psms-navbar">
            <div className="psms-navbar-inner">
                <div className="psms-navbar-links">
                    <Link to="/cars" className="psms-navlink">Car</Link>
                    <Link to="/slots" className="psms-navlink">Parking Slots</Link>
                    <Link to="/records" className="psms-navlink">Parking Record</Link>
                    <Link to="/payments" className="psms-navlink">Payment</Link>
                    <Link to="/reports" className="psms-navlink">Reports</Link>
                </div>
                <button onClick={handleLogout} className="psms-btn psms-btn-danger">
                    Logout
                </button>
            </div>
        </nav>
    );
}
