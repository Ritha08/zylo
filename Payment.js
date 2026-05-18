import React, { useState, useEffect } from 'react';
import api from './frontend-project/src/api';

export default function Payment() {
    const [payments, setPayments] = useState([]);
    const [completedRecords, setCompletedRecords] = useState([]);
    const [form, setForm] = useState({ parkingRecordId: '', amountPaid: '', paymentDate: '' });

    const fetchData = async () => {
        const paymentsRes = await api.get('/payments');
        const recordsRes = await api.get('/reports/completed-records');
        setPayments(paymentsRes.data);
        setCompletedRecords(recordsRes.data);
    };
    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/payments', form);
        setForm({ parkingRecordId: '', amountPaid: '', paymentDate: '' });
        fetchData();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Payment Records</h2>
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 flex gap-2 flex-wrap">
                <select required value={form.parkingRecordId} onChange={e => setForm({ ...form, parkingRecordId: e.target.value })} className="border p-2 rounded">
                    <option value="">Select Completed Parking Record</option>
                    {completedRecords.map(rec => (
                        <option key={rec.id} value={rec.id}>
                            {rec.plateNumber} (Entry: {new Date(rec.entryTime).toLocaleString()})
                        </option>
                    ))}
                </select>
                <input type="number" step="0.01" placeholder="Amount Paid (RWF)" value={form.amountPaid} onChange={e => setForm({ ...form, amountPaid: e.target.value })} className="border p-2 rounded" required />
                <input type="datetime-local" value={form.paymentDate} onChange={e => setForm({ ...form, paymentDate: e.target.value })} className="border p-2 rounded" required />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Record Payment</button>
            </form>
            <table className="w-full bg-white shadow rounded">
                <thead>
                    <tr className="bg-gray-200">
                        <th>Payment ID</th><th>Plate</th><th>Entry Time</th><th>Exit Time</th><th>Amount Paid</th><th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map(p => (
                        <tr key={p.id} className="border-t">
                            <td className="p-2">{p.id}</td>
                            <td>{p.plateNumber}</td>
                            <td>{new Date(p.entryTime).toLocaleString()}</td>
                            <td>{p.exitTime ? new Date(p.exitTime).toLocaleString() : '-'}</td>
                            <td>{p.amountPaid}</td>
                            <td>{new Date(p.paymentDate).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}