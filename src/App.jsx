import { useState } from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between">
        <h1 className="font-bold text-xl text-blue-600">FinSight</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </button>
      </nav>

      {/* Content */}
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Dashboard
        </h2>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600">
            Selamat datang di aplikasi kamu 🚀
          </p>
        </div>
      </div>
    </div>
  )
}

export default App