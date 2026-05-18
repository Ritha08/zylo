import React, { useState, useEffect } from 'react';
import api from './frontend-project/src/api';

function SlotIcon({ hasCar }) {
    // Simple inline “slot” graphic (so it stays graphical without external assets)
    return (
        <div className="psms-slot-icon" aria-hidden="true">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="g" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feColorMatrix
                            in="blur"
                            type="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -9"
                            result="glow"
                        />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <g filter="url(#g)">
                    <path
                        d="M22 20c3-7 17-7 20 0 2 4 2 8 0 12-2 4-4 6-10 6s-8-2-10-6c-2-4-2-8 0-12Z"
                        fill={hasCar ? '#2b7dff' : '#21d07a'}
                        fillOpacity="0.28"
                    />
                    <path
                        d="M28 18c2-3 6-3 8 0 1 2 1 4 0 6-1 2-2 3-4 3s-3-1-4-3c-1-2-1-4 0-6Z"
                        fill={hasCar ? '#2b7dff' : '#21d07a'}
                        fillOpacity="0.75"
                    />
                    <circle cx="26" cy="24" r="2.2" fill="#0b0f19" />
                    <circle cx="38" cy="24" r="2.2" fill="#0b0f19" />
                    <path d="M30 30c2 2 4 2 6 0" stroke="#0b0f19" strokeWidth="2" strokeLinecap="round" />
                    <path
                        d="M16 30c6-3 10-3 16-1s10 2 16 0c2-1 4 1 3 3-4 10-14 18-22 18S20 42 16 33c-1-2 1-4 3-3Z"
                        fill={hasCar ? '#2b7dff' : '#21d07a'}
                        fillOpacity="0.22"
                        stroke={hasCar ? '#2b7dff' : '#21d07a'}
                        strokeWidth="2"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M20 40c4 3 9 5 12 5s8-2 12-5"
                        stroke="#0b0f19"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </g>
            </svg>
        </div>
    );
}

export default function ParkingSlot() {
    const [slots, setSlots] = useState([]);
    const [form, setForm] = useState({ slotNumber: '', slotStatus: 'available' });


    const fetchSlots = async () => {
        const res = await api.get('/parking-slots');
        setSlots(res.data);
    };
    useEffect(() => {
        fetchSlots();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/parking-slots', form);
        setForm({ slotNumber: '', slotStatus: 'available' });
        fetchSlots();
    };

    return (
        <div className="psms-page">
            <h2 className="psms-title">Parking Slots</h2>

            <div className="psms-panel mb-6">
                <h3 className="psms-subtitle">Add Parking Slot</h3>
                <form onSubmit={handleSubmit} className="psms-form-inline">
                    <input
                        placeholder="Slot Number (e.g., A1)"
                        value={form.slotNumber}
                        onChange={(e) => setForm({ ...form, slotNumber: e.target.value })}
                        className="psms-input"
                        required
                    />
                    <select
                        value={form.slotStatus}
                        onChange={(e) => setForm({ ...form, slotStatus: e.target.value })}
                        className="psms-input"
                    >
                        <option value="available">Empty (available)</option>
                        <option value="occupied">Has Car (occupied)</option>
                    </select>
                    <button type="submit" className="psms-btn psms-btn-green">
                        Add Slot
                    </button>
                </form>
            </div>

            <div className="psms-slot-grid" role="list">
                {slots.map((slot) => {
                    const hasCar = slot.slotStatus === 'occupied';
                    return (
                        <div
                            key={slot.slotNumber}
                            role="listitem"
                            className={hasCar ? 'psms-slot-card is-occupied' : 'psms-slot-card is-available'}
                        >
                            <div className="psms-slot-top">
                                <div className="psms-slot-id">{slot.slotNumber}</div>
                                <div className={hasCar ? 'psms-pill is-blue' : 'psms-pill is-green'}>
                                    {hasCar ? 'Car inside' : 'Empty'}
                                </div>
                            </div>

                            <SlotIcon hasCar={hasCar} />

                            <div className="psms-slot-footer">
                                <div className="psms-neon-label">
                                    {hasCar ? 'BLUE NEON' : 'GREEN NEON'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

