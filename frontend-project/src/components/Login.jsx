import { useState } from 'react'

const USERS = {
  admin: { username: 'admin', password: 'admin123', role: 'admin' },
  manager: { username: 'manager', password: 'manager123', role: 'manager' }
}

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isDark, setIsDark] = useState(() => localStorage.getItem('pssms_theme') === 'dark')

  const toggleDark = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('pssms_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('pssms_theme', 'light')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const user = USERS[username]
    if (user && user.password === password) {
      localStorage.setItem('pssms_current_user', JSON.stringify({ username: user.username, role: user.role }))
      onLogin(user)
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">PSSMS</h2>
          <label className="switch">
            <input type="checkbox" checked={isDark} onChange={toggleDark} />
            <span className="slider"></span>
          </label>
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Parking Space Sales Management System</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Login
          </button>
        </form>
        <div className="flex justify-center mt-4 text-sm text-gray-500 dark:text-gray-400 space-x-4">
          <span>admin / admin123</span>
          <span>manager / manager123</span>
        </div>
      </div>
    </div>
  )
}