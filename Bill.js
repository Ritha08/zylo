import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './frontend-project/src/api';

export default function Bill() {
    const { recordId } = useParams();
    const [bill, setBill] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBill = async () => {
            try {
                const res = await api.get(`/reports/bill/${recordId}`);
                setBill(res.data);
            } catch (err) {
                alert('Bill not found');
                navigate('/reports');
            }
        };
        fetchBill();
    }, [recordId, navigate]);

    if (!bill) return <div className="p-4 text-center">Loading bill...</div>;

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4 text-center">Parking Bill</h2>
            <div className="border-t pt-4">
                <p><strong>Plate Number:</strong> {bill.plateNumber}</p>
                <p><strong>Entry Time:</strong> {new Date(bill.entryTime).toLocaleString()}</p>
                <p><strong>Exit Time:</strong> {bill.exitTime ? new Date(bill.exitTime).toLocaleString() : '-'}</p>
                <p><strong>Duration (hours):</strong> {bill.duration}</p>
                <p><strong>Calculated Amount:</strong> {bill.amount} RWF</p>
                <p><strong>Amount Paid:</strong> {bill.amountPaid} RWF</p>
                <p><strong>Payment Date:</strong> {bill.paymentDate ? new Date(bill.paymentDate).toLocaleString() : 'Not paid'}</p>
            </div>
            <button onClick={() => window.print()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full">Print Bill</button>
            <button onClick={() => navigate('/reports')} className="mt-2 bg-gray-500 text-white px-4 py-2 rounded w-full">Back</button>
        </div>
    );
}