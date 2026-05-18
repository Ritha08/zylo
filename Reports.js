import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './frontend-project/src/api';

export default function Reports() {
    const [dailyDate, setDailyDate] = useState('');
    const [dailyReport, setDailyReport] = useState([]);
    const [recordId, setRecordId] = useState('');
    const navigate = useNavigate();

    const fetchDailyReport = async () => {
        if (!dailyDate) return;
        const res = await api.get(`/reports/daily-payments?date=${dailyDate}`);
        setDailyReport(res.data);
    };

    const viewBill = () => {
        if (recordId) navigate(`/bill/${recordId}`);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Reports & Billing</h2>

            {/* Daily Payment Report */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <h3 className="font-semibold mb-2">Daily Parking Payment Report</h3>
                <div className="flex gap-2 mb-4">
                    <input type="date" value={dailyDate} onChange={e => setDailyDate(e.target.value)} className="border p-2 rounded" />
                    <button onClick={fetchDailyReport} className="bg-blue-600 text-white px-4 py-2 rounded">Generate</button>
                </div>
                {dailyReport.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2">Plate Number</th>
                                    <th>Entry Time</th>
                                    <th>Exit Time</th>
                                    <th>Duration (h)</th>
                                    <th>Amount Paid</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyReport.map((row, idx) => (
                                    <tr key={idx} className="border-t">
                                        <td className="p-2">{row.plateNumber}</td>
                                        <td>{new Date(row.entryTime).toLocaleString()}</td>
                                        <td>{row.exitTime ? new Date(row.exitTime).toLocaleString() : '-'}</td>
                                        <td>{row.duration}</td>
                                        <td>{row.amountPaid}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {dailyReport.length === 0 && dailyDate && <p className="text-gray-500">No payments found for this date.</p>}
            </div>

            {/* Bill Generation */}
            <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-2">Generate Bill (by Parking Record ID)</h3>
                <div className="flex gap-2">
                    <input type="text" placeholder="Parking Record ID" value={recordId} onChange={e => setRecordId(e.target.value)} className="border p-2 rounded flex-1" />
                    <button onClick={viewBill} className="bg-green-600 text-white px-4 py-2 rounded">View Bill</button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Enter the MongoDB ObjectId (e.g., 64f8a1b2c3d4e5f6a7b8c9d0)</p>
            </div>
        </div>
    );
}