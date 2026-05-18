import React, { useState, useEffect } from 'react';
import api from './frontend-project/src/api';

export default function Car() {
    const [cars, setCars] = useState([]);
    const [form, setForm] = useState({ plateNumber: '', driverName: '', phoneNumber: '' });

    const fetchCars = async () => {
        const res = await api.get('/cars');
        setCars(res.data);
    };

    useEffect(() => { fetchCars(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/cars', form);
        setForm({ plateNumber: '', driverName: '', phoneNumber: '' });
        fetchCars();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Car Management</h2>
            <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow flex gap-2 flex-wrap">
                <input
                    placeholder="Plate Number"
                    value={form.plateNumber}
                    onChange={e => setForm({ ...form, plateNumber: e.target.value })}
                    className="border p-2 rounded"
                    required
                />
                <input
                    placeholder="Driver Name"
                    value={form.driverName}
                    onChange={e => setForm({ ...form, driverName: e.target.value })}
                    className="border p-2 rounded"
                    required
                />
                <input
                    placeholder="Phone Number"
                    value={form.phoneNumber}
                    onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                    className="border p-2 rounded"
                    required
                />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Add Car</button>
            </form>
            <table className="w-full bg-white shadow rounded">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2">Plate</th>
                        <th>Driver</th>
                        <th>Phone</th>
                    </tr>
                </thead>
                <tbody>
                    {cars.map(car => (
                        <tr key={car.plateNumber} className="border-t">
                            <td className="p-2">{car.plateNumber}</td>
                            <td>{car.driverName}</td>
                            <td>{car.phoneNumber}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}