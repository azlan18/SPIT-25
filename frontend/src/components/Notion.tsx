import { Dashboard } from './Dashboard'
import { Layout } from './Layout'

export function Notion() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Notion Integration</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your tasks and updates with Notion integration
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <Dashboard />
          </div>
        </div>
      </div>
    </Layout>
  )
} 