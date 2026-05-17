import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="md:flex">
        <div className="md:sticky md:top-0 md:z-40 md:min-h-screen md:w-72">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col md:pl-72">
          <Topbar />
          <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
