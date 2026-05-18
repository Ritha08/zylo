import React, { useState } from 'react';
import api from './frontend-project/src/api';

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { username, password });
            if (res.data.message) onLogin();
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">PSSMS Login</h2>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full p-2 border mb-4 rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-2 border mb-4 rounded"
                    required
                />
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    Login
                </button>
                <p className="text-xs text-gray-500 mt-4 text-center">Default: admin / Admin@123</p>
            </form>
        </div>
    );
}