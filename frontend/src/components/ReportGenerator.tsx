import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { jsPDF } from 'jspdf'
import { api } from '../api'
import type { Task } from '../types'

interface ReportGeneratorProps {
  companyName: string
  tasks: Task[]
  selectedDate: string
  onClose: () => void
}

export function ReportGenerator({
  companyName,
  tasks,
  selectedDate,
  onClose,
}: ReportGeneratorProps) {
  const [report, setReport] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const generateReport = async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (!tasks.length) {
        throw new Error('No tasks available for report generation')
      }

      const taskSummaries = tasks
        .map(task => {
          const updates = task.updates
            ?.filter(update => update.date === selectedDate)
            .map(update => 
              `- ${update.status}: ${update.notes} (${new Date(update.timeStamp).toLocaleTimeString()})`
            )
            .join('\n')

          return `
### ${task.title}
**Status:** ${task.status}
**Description:** ${task.description}

#### Updates:
${updates || '*No updates for today*'}
`
        })
        .join('\n---\n')

      const prompt = `Generate a professional daily progress report for ${companyName} on ${selectedDate}. 
      Here are the tasks and their updates:

      ${taskSummaries}

      Please create a concise report that includes:
      1. Overall progress summary
      2. Key achievements
      3. Challenges faced (if any)
      4. Next steps
      5. Recommendations

      Format the report in markdown with proper headings and bullet points.
      Keep the tone formal and constructive.
      Include specific details from the task updates.`

      const response = await api.generateReport(prompt)
      setReport(response.report)
      setRetryCount(0)
    } catch (error: any) {
      console.error('Report generation error:', error)
      setError(error.message || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkdownDownload = () => {
    if (!report) return

    const fileName = `${companyName.toLowerCase().replace(/\s+/g, '-')}-report-${selectedDate}.md`
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handlePdfDownload = () => {
    if (!report) return

    const doc = new jsPDF()
    const fileName = `${companyName.toLowerCase().replace(/\s+/g, '-')}-report-${selectedDate}.pdf`
    
    // Add title
    doc.setFontSize(16)
    doc.text('Daily Progress Report', 20, 20)
    
    // Add company and date
    doc.setFontSize(12)
    doc.text(`${companyName} - ${selectedDate}`, 20, 30)
    
    // Add report content
    doc.setFontSize(11)
    const splitText = doc.splitTextToSize(report.replace(/[#*`]/g, ''), 170) // Remove markdown symbols
    doc.text(splitText, 20, 40)
    
    // Save the PDF
    doc.save(fileName)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col transform transition-all">
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Daily Progress Report</h2>
              <p className="mt-1 text-sm text-gray-500">
                {companyName} - {selectedDate}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {!report ? (
            <button
              onClick={generateReport}
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-medium
                ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
                transition-colors`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Report...
                </div>
              ) : (
                'Generate Report'
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {report && (
          <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex justify-end gap-3">
              <button
                onClick={handlePdfDownload}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                         transition-colors flex items-center gap-2 text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Download PDF
              </button>
              <button
                onClick={handleMarkdownDownload}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                         transition-colors flex items-center gap-2 text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Markdown
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg 
                         hover:bg-gray-200 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 