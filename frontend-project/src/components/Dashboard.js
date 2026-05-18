import { useState, useEffect } from 'react'

// Helper: get storage key for current user
function getStorageKey(username) {
  return `pssms_data_${username}`
}

function loadUserData(username) {
  const key = getStorageKey(username)
  const data = localStorage.getItem(key)
  if (data) return JSON.parse(data)
  return { cars: [], slots: [], records: [], payments: [] }
}

function saveUserData(username, data) {
  const key = getStorageKey(username)
  localStorage.setItem(key, JSON.stringify(data))
}

function calculateAmount(entryTime, exitTime) {
  const entry = new Date(entryTime)
  const exit = new Date(exitTime)
  const diffHours = Math.max(0, (exit - entry) / (1000 * 60 * 60))
  const startedHours = Math.ceil(diffHours)
  return { duration: diffHours.toFixed(2), amount: startedHours * 500 }
}

export default function Dashboard({ user, onLogout }) {
  const [data, setData] = useState(() => loadUserData(user.username))
  const [activeTab, setActiveTab] = useState('car')
  const [isDark, setIsDark] = useState(() => localStorage.getItem('pssms_theme') === 'dark')

  // Form states
  const [carForm, setCarForm] = useState({ plateNumber: '', driverName: '', phoneNumber: '' })
  const [slotForm, setSlotForm] = useState({ slotNumber: '', slotStatus: 'available' })
  const [entryForm, setEntryForm] = useState({ plateNumber: '', slotNumber: '', entryTime: '' })
  const [exitForm, setExitForm] = useState({ recordId: '', exitTime: '' })
  const [paymentForm, setPaymentForm] = useState({ recordId: '', amountPaid: '', paymentDate: '' })
  const [reportDate, setReportDate] = useState('')
  const [dailyReport, setDailyReport] = useState([])
  const [billRecordId, setBillRecordId] = useState('')
  const [billData, setBillData] = useState(null)

  // Save whenever data changes
  useEffect(() => {
    saveUserData(user.username, data)
  }, [data, user.username])

  // Theme
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [isDark])

  const toggleDark = () => {
    const newDark = !isDark
    setIsDark(newDark)
    localStorage.setItem('pssms_theme', newDark ? 'dark' : 'light')
  }

  // CRUD helpers
  const addCar = (e) => {
    e.preventDefault()
    if (data.cars.some(c => c.plateNumber === carForm.plateNumber)) {
      alert('Car already exists')
      return
    }
    setData(prev => ({
      ...prev,
      cars: [...prev.cars, { ...carForm }]
    }))
    setCarForm({ plateNumber: '', driverName: '', phoneNumber: '' })
  }

  const deleteCar = (plateNumber) => {
    setData(prev => ({
      ...prev,
      cars: prev.cars.filter(c => c.plateNumber !== plateNumber)
    }))
  }

  const addSlot = (e) => {
    e.preventDefault()
    if (data.slots.some(s => s.slotNumber === slotForm.slotNumber)) {
      alert('Slot already exists')
      return
    }
    setData(prev => ({
      ...prev,
      slots: [...prev.slots, { ...slotForm }]
    }))
    setSlotForm({ slotNumber: '', slotStatus: 'available' })
  }

  const addEntry = (e) => {
    e.preventDefault()
    const { plateNumber, slotNumber, entryTime } = entryForm
    const slot = data.slots.find(s => s.slotNumber === slotNumber)
    if (!slot || slot.slotStatus !== 'available') {
      alert('Slot not available')
      return
    }
    const newRecord = {
      id: Date.now(),
      plateNumber,
      slotNumber,
      entryTime,
      exitTime: null,
      duration: null,
      amount: null
    }
    setData(prev => ({
      ...prev,
      records: [...prev.records, newRecord],
      slots: prev.slots.map(s =>
        s.slotNumber === slotNumber ? { ...s, slotStatus: 'occupied' } : s
      )
    }))
    setEntryForm({ plateNumber: '', slotNumber: '', entryTime: '' })
  }

  const updateExit = (e) => {
    e.preventDefault()
    const { recordId, exitTime } = exitForm
    const record = data.records.find(r => r.id === parseInt(recordId))
    if (!record || record.exitTime) return
    const { duration, amount } = calculateAmount(record.entryTime, exitTime)
    setData(prev => ({
      ...prev,
      records: prev.records.map(r =>
        r.id === parseInt(recordId)
          ? { ...r, exitTime, duration, amount }
          : r
      ),
      slots: prev.slots.map(s =>
        s.slotNumber === record.slotNumber ? { ...s, slotStatus: 'available' } : s
      )
    }))
    setExitForm({ recordId: '', exitTime: '' })
  }

  const deleteRecord = (recordId) => {
    const record = data.records.find(r => r.id === recordId)
    if (!record) return
    setData(prev => ({
      ...prev,
      records: prev.records.filter(r => r.id !== recordId),
      slots: prev.slots.map(s =>
        s.slotNumber === record.slotNumber && !record.exitTime
          ? { ...s, slotStatus: 'available' }
          : s
      )
    }))
  }

  const addPayment = (e) => {
    e.preventDefault()
    const { recordId, amountPaid, paymentDate } = paymentForm
    const record = data.records.find(r => r.id === parseInt(recordId))
    if (!record || !record.exitTime) {
      alert('Record not completed')
      return
    }
    if (data.payments.some(p => p.recordId === parseInt(recordId))) {
      alert('Payment already recorded')
      return
    }
    setData(prev => ({
      ...prev,
      payments: [...prev.payments, { id: Date.now(), recordId: parseInt(recordId), amountPaid: parseFloat(amountPaid), paymentDate }]
    }))
    setPaymentForm({ recordId: '', amountPaid: '', paymentDate: '' })
  }

  const generateDailyReport = () => {
    if (!reportDate) return
    const start = new Date(reportDate)
    start.setHours(0,0,0,0)
    const end = new Date(reportDate)
    end.setHours(23,59,59,999)
    const report = data.payments.filter(p => {
      const pDate = new Date(p.paymentDate)
      return pDate >= start && pDate <= end
    }).map(p => {
      const rec = data.records.find(r => r.id === p.recordId)
      const car = data.cars.find(c => c.plateNumber === rec?.plateNumber)
      return {
        plateNumber: car ? car.plateNumber : rec?.plateNumber,
        entryTime: rec?.entryTime,
        exitTime: rec?.exitTime,
        duration: rec?.duration,
        amountPaid: p.amountPaid
      }
    })
    setDailyReport(report)
  }

  const viewBill = () => {
    if (!billRecordId) return
    const rec = data.records.find(r => r.id === parseInt(billRecordId))
    if (!rec) return
    const car = data.cars.find(c => c.plateNumber === rec.plateNumber)
    const payment = data.payments.find(p => p.recordId === rec.id)
    setBillData({ ...rec, carPlate: car?.plateNumber, payment })
  }

  // Derived data for dropdowns
  const availableSlots = data.slots.filter(s => s.slotStatus === 'available')
  const activeRecords = data.records.filter(r => !r.exitTime)
  const completedRecords = data.records.filter(r => r.exitTime && !data.payments.some(p => p.recordId === r.id))
  const allCompletedRecords = data.records.filter(r => r.exitTime)

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h1 className="text-2xl font-bold dark:text-white">PSSMS - Parking Space Sales Management System</h1>
        <div className="flex items-center space-x-4">
          <span className="dark:text-white">{user.username} ({user.role})</span>
          <label className="switch">
            <input type="checkbox" checked={isDark} onChange={toggleDark} />
            <span className="slider"></span>
          </label>
          <button onClick={onLogout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['car', 'slot', 'record', 'payment', 'report'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}
          >
            {tab === 'car' ? 'Car' : tab === 'slot' ? 'ParkingSlot' : tab === 'record' ? 'ParkingRecord' : tab === 'payment' ? 'Payment' : 'Reports'}
          </button>
        ))}
      </div>

      {/* Car Tab */}
      {activeTab === 'car' && (
        <div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Add New Car</h2>
            <form onSubmit={addCar} className="flex flex-wrap gap-2">
              <input type="text" placeholder="Plate Number" value={carForm.plateNumber} onChange={e => setCarForm({...carForm, plateNumber: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white" required />
              <input type="text" placeholder="Driver Name" value={carForm.driverName} onChange={e => setCarForm({...carForm, driverName: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white" required />
              <input type="text" placeholder="Phone Number" value={carForm.phoneNumber} onChange={e => setCarForm({...carForm, phoneNumber: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white" required />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Add Car</button>
            </form>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Cars List</h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700"><tr><th className="p-2">Plate</th><th>Driver</th><th>Phone</th><th>Action</th></tr></thead>
              <tbody>
                {data.cars.map(car => (
                  <tr key={car.plateNumber} className="border-t dark:border-gray-600">
                    <td className="p-2">{car.plateNumber}</td><td>{car.driverName}</td><td>{car.phoneNumber}</td>
                    <td><button onClick={() => deleteCar(car.plateNumber)} className="bg-red-600 text-white px-2 py-1 rounded text-xs">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slot Tab */}
      {activeTab === 'slot' && (
        <div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Add New Slot</h2>
            <form onSubmit={addSlot} className="flex flex-wrap gap-2">
              <input type="text" placeholder="Slot Number" value={slotForm.slotNumber} onChange={e => setSlotForm({...slotForm, slotNumber: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white" required />
              <select value={slotForm.slotStatus} onChange={e => setSlotForm({...slotForm, slotStatus: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white">
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
              </select>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Add Slot</button>
            </form>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Slots List</h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700"><tr><th>Slot</th><th>Status</th></tr></thead>
              <tbody>
                {data.slots.map(slot => (
                  <tr key={slot.slotNumber} className="border-t dark:border-gray-600"><td className="p-2">{slot.slotNumber}</td><td>{slot.slotStatus}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Tab */}
      {activeTab === 'record' && (
        <div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Register Entry</h2>
            <form onSubmit={addEntry} className="flex flex-wrap gap-2">
              <select value={entryForm.plateNumber} onChange={e => setEntryForm({...entryForm, plateNumber: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white" required>
                <option value="">Select Car</option>
                {data.cars.map(car => <option key={car.plateNumber} value={car.plateNumber}>{car.plateNumber} - {car.driverName}</option>)}
              </select>
              <select value={entryForm.slotNumber} onChange={e => setEntryForm({...entryForm, slotNumber: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white" required>
                <option value="">Select Slot</option>
                {availableSlots.map(slot => <option key={slot.slotNumber} value={slot.slotNumber}>{slot.slotNumber}</option>)}
              </select>
              <input type="datetime-local" value={entryForm.entryTime} onChange={e => setEntryForm({...entryForm, entryTime: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white" required />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Record Entry</button>
            </form>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Update Exit & Calculate Bill</h2>
            <form onSubmit={updateExit} className="flex flex-wrap gap-2">
              <select value={exitForm.recordId} onChange={e => setExitForm({...exitForm, recordId: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white" required>
                <option value="">Select active record</option>
                {activeRecords.map(rec => {
                  const car = data.cars.find(c => c.plateNumber === rec.plateNumber)
                  return <option key={rec.id} value={rec.id}>{car?.plateNumber} - Slot {rec.slotNumber} (Entry: {new Date(rec.entryTime).toLocaleString()})</option>
                })}
              </select>
              <input type="datetime-local" value={exitForm.exitTime} onChange={e => setExitForm({...exitForm, exitTime: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white" required />
              <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded">Set Exit</button>
            </form>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Parking Records</h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700"><tr><th>Plate</th><th>Slot</th><th>Entry</th><th>Exit</th><th>Duration(h)</th><th>Amount(RWF)</th><th>Action</th></tr></thead>
              <tbody>
                {data.records.map(rec => {
                  const car = data.cars.find(c => c.plateNumber === rec.plateNumber)
                  return (
                    <tr key={rec.id} className="border-t dark:border-gray-600">
                      <td className="p-2">{car?.plateNumber}</td><td>{rec.slotNumber}</td>
                      <td>{new Date(rec.entryTime).toLocaleString()}</td>
                      <td>{rec.exitTime ? new Date(rec.exitTime).toLocaleString() : '—'}</td>
                      <td>{rec.duration || '—'}</td><td>{rec.amount || '—'}</td>
                      <td><button onClick={() => deleteRecord(rec.id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs">Delete</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Record Payment</h2>
            <form onSubmit={addPayment} className="flex flex-wrap gap-2">
              <select value={paymentForm.recordId} onChange={e => setPaymentForm({...paymentForm, recordId: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white" required>
                <option value="">Select completed record</option>
                {completedRecords.map(rec => {
                  const car = data.cars.find(c => c.plateNumber === rec.plateNumber)
                  return <option key={rec.id} value={rec.id}>{car?.plateNumber} - Exit: {new Date(rec.exitTime).toLocaleString()} (Amount: {rec.amount} RWF)</option>
                })}
              </select>
              <input type="number" placeholder="Amount Paid" value={paymentForm.amountPaid} onChange={e => setPaymentForm({...paymentForm, amountPaid: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white" required />
              <input type="datetime-local" value={paymentForm.paymentDate} onChange={e => setPaymentForm({...paymentForm, paymentDate: e.target.value})} className="border p-2 rounded dark:bg-gray-700 dark:text-white" required />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Record Payment</button>
            </form>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Payment History</h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700"><tr><th>Record ID</th><th>Plate</th><th>Entry</th><th>Exit</th><th>Amount Paid</th><th>Payment Date</th></tr></thead>
              <tbody>
                {data.payments.map(pay => {
                  const rec = data.records.find(r => r.id === pay.recordId)
                  if (!rec) return null
                  const car = data.cars.find(c => c.plateNumber === rec.plateNumber)
                  return (
                    <tr key={pay.id} className="border-t dark:border-gray-600">
                      <td className="p-2">{pay.id}</td><td>{car?.plateNumber}</td>
                      <td>{new Date(rec.entryTime).toLocaleString()}</td>
                      <td>{rec.exitTime ? new Date(rec.exitTime).toLocaleString() : '-'}</td>
                      <td>{pay.amountPaid}</td><td>{new Date(pay.paymentDate).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'report' && (
        <div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Daily Payment Report</h2>
            <div className="flex gap-2 mb-4">
              <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} className="border p-2 rounded dark:bg-gray-700 dark:text-white" />
              <button onClick={generateDailyReport} className="bg-blue-600 text-white px-4 py-2 rounded">Generate</button>
            </div>
            {dailyReport.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700"><tr><th>Plate</th><th>Entry</th><th>Exit</th><th>Duration(h)</th><th>Amount Paid</th></tr></thead>
                <tbody>
                  {dailyReport.map((row, idx) => (
                    <tr key={idx} className="border-t dark:border-gray-600">
                      <td className="p-2">{row.plateNumber}</td>
                      <td>{new Date(row.entryTime).toLocaleString()}</td>
                      <td>{row.exitTime ? new Date(row.exitTime).toLocaleString() : '-'}</td>
                      <td>{row.duration}</td><td>{row.amountPaid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {dailyReport.length === 0 && reportDate && <p className="text-gray-500">No payments on this date.</p>}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Generate Bill</h2>
            <div className="flex gap-2">
              <select value={billRecordId} onChange={e => setBillRecordId(e.target.value)} className="border p-2 rounded dark:bg-gray-700 dark:text-white">
                <option value="">Select record</option>
                {allCompletedRecords.map(rec => {
                  const car = data.cars.find(c => c.plateNumber === rec.plateNumber)
                  return <option key={rec.id} value={rec.id}>{car?.plateNumber} (Entry: {new Date(rec.entryTime).toLocaleString()})</option>
                })}
              </select>
              <button onClick={viewBill} className="bg-green-600 text-white px-4 py-2 rounded">View Bill</button>
            </div>
            {billData && (
              <div className="mt-4 bg-gray-100 dark:bg-gray-700 p-4 rounded">
                <h3 className="font-bold">Parking Bill</h3>
                <p>Plate: {billData.carPlate}</p>
                <p>Entry: {new Date(billData.entryTime).toLocaleString()}</p>
                <p>Exit: {billData.exitTime ? new Date(billData.exitTime).toLocaleString() : '-'}</p>
                <p>Duration: {billData.duration} hours</p>
                <p>Calculated Amount: {billData.amount} RWF</p>
                <p>Amount Paid: {billData.payment ? billData.payment.amountPaid : 'Not paid'}</p>
                <p>Payment Date: {billData.payment ? new Date(billData.payment.paymentDate).toLocaleString() : '-'}</p>
                <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-1 rounded mt-2">Print Bill</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}