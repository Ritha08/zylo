import React, { useState, useEffect } from 'react';
import api from './frontend-project/src/api';

export default function ParkingRecord() {
    const [records, setRecords] = useState([]);
    const [cars, setCars] = useState([]);
    const [slots, setSlots] = useState([]);
    const [form, setForm] = useState({ plateNumber: '', slotNumber: '', entryTime: '' });
    const [exitForm, setExitForm] = useState({ id: '', exitTime: '' });

    const fetchData = async () => {
        const recordsRes = await api.get('/parking-records');
        const carsRes = await api.get('/cars');
        const slotsRes = await api.get('/parking-slots');
        setRecords(recordsRes.data);
        setCars(carsRes.data);
        setSlots(slotsRes.data);
    };
    useEffect(() => { fetchData(); }, []);

    const handleInsert = async (e) => {
        e.preventDefault();
        await api.post('/parking-records', form);
        setForm({ plateNumber: '', slotNumber: '', entryTime: '' });
        fetchData();
    };

    const handleUpdateExit = async (e) => {
        e.preventDefault();
        await api.put(`/parking-records/${exitForm.id}`, { exitTime: exitForm.exitTime });
        setExitForm({ id: '', exitTime: '' });
        fetchData();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this parking record permanently?')) {
            await api.delete(`/parking-records/${id}`);
            fetchData();
        }
    };

    // Helper to format datetime-local value
    const formatDateTimeLocal = (date) => {
        const d = new Date(date);
        return d.toISOString().slice(0, 16);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Parking Records</h2>

            {/* Insert new record */}
            <div className="bg-white p-4 rounded shadow mb-4">
                <h3 className="font-semibold mb-2">Register Car Entry</h3>
                <form onSubmit={handleInsert} className="flex gap-2 flex-wrap">
                    <select required value={form.plateNumber} onChange={e => setForm({ ...form, plateNumber: e.target.value })} className="border p-2 rounded">
                        <option value="">Select Car</option>
                        {cars.map(c => <option key={c.plateNumber} value={c.plateNumber}>{c.plateNumber} - {c.driverName}</option>)}
                    </select>
                    <select required value={form.slotNumber} onChange={e => setForm({ ...form, slotNumber: e.target.value })} className="border p-2 rounded">
                        <option value="">Select Slot</option>
                        {slots.filter(s => s.slotStatus === 'available').map(s => <option key={s.slotNumber} value={s.slotNumber}>{s.slotNumber}</option>)}
                    </select>
                    <input type="datetime-local" required value={form.entryTime} onChange={e => setForm({ ...form, entryTime: e.target.value })} className="border p-2 rounded" />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Record Entry</button>
                </form>
            </div>

            {/* Update exit time */}
            <div className="bg-white p-4 rounded shadow mb-4">
                <h3 className="font-semibold mb-2">Update Exit Time & Calculate Bill</h3>
                <form onSubmit={handleUpdateExit} className="flex gap-2 flex-wrap">
                    <select required value={exitForm.id} onChange={e => setExitForm({ id: e.target.value, exitTime: '' })} className="border p-2 rounded">
                        <option value="">Select occupied record</option>
                        {records.filter(r => !r.exitTime).map(r => (
                            <option key={r._id} value={r._id}>
                                {r.plateNumber} (Slot {r.slotNumber}) Entry: {new Date(r.entryTime).toLocaleString()}
                            </option>
                        ))}
                    </select>
                    <input type="datetime-local" required value={exitForm.exitTime} onChange={e => setExitForm({ ...exitForm, exitTime: e.target.value })} className="border p-2 rounded" />
                    <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded">Set Exit</button>
                </form>
            </div>

            {/* Records table with Delete button */}
            <table className="w-full bg-white shadow rounded text-sm overflow-x-auto block">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2">ID</th><th>Plate</th><th>Slot</th><th>Entry</th><th>Exit</th><th>Duration(h)</th><th>Amount(RWF)</th><th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map(rec => (
                        <tr key={rec._id} className="border-t">
                            <td className="p-2">{rec._id.slice(-6)}</td>
                            <td>{rec.plateNumber}</td>
                            <td>{rec.slotNumber}</td>
                            <td>{new Date(rec.entryTime).toLocaleString()}</td>
                            <td>{rec.exitTime ? new Date(rec.exitTime).toLocaleString() : '—'}</td>
                            <td>{rec.duration || '—'}</td>
                            <td>{rec.amount || '—'}</td>
                            <td>
                                <button onClick={() => handleDelete(rec._id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}