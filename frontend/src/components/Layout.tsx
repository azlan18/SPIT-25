import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900">Taskify</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {/* Remove Overview, Tasks, Companies navigation items */}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        <div className="max-w-7xl mx-auto py-6 px-8">{children}</div>
      </main>
    </div>
  )
} 