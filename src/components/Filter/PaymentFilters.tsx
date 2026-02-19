import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface PaymentFiltersProps {
  onApply?: (filters: any) => void
  onClose?: () => void
  /** Base path for filter navigation (e.g. /payments or /employer-payments). Default: /payments */
  basePath?: string
}

export default function PaymentFilters({ onApply, onClose, basePath = '/payments' }: PaymentFiltersProps) {
  const navigate = useNavigate()
  const [isStatusOpen, setIsStatusOpen] = useState(true)
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(true)
  const [isRateTypeOpen, setIsRateTypeOpen] = useState(true)

  const [filters, setFilters] = useState({
    status: {
      rejected: false,
      pending: false,
      approved: false,
      refunded: false,
      processing: false,
      completed: false
    },
    dateRange: {
      startDate: '',
      endDate: ''
    },
    rateType: {
      flatRate: false,
      weekdayRate: false,
      weekendRate: false,
      publicHolidayRate: false
    }
  })

  const handleCheckboxChange = (category: string, field: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field]
      }
    }))
  }

  const handleDateChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }))
  }

  return (
    <div className="w-full  bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-medium mb-4">Filter</h2>

      {/* Status Section */}
      <div className="mb-4">
        <button
          className="w-full flex items-center justify-between text-left mb-2"
          onClick={() => setIsStatusOpen(!isStatusOpen)}
        >
          <span className="font-medium">Status</span>
          <svg
            className={`w-4 h-4 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isStatusOpen && (
          <div className="space-y-2">
            {['pending', 'approved', 'completed', 'rejected', 'refunded', 'processing'].map((status) => (
              <label key={status} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.status[status as keyof typeof filters.status]}
                  onChange={() => handleCheckboxChange('status', status)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="capitalize">{status}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Date Range Section */}
      <div className="mb-4">
        <button
          className="w-full flex items-center justify-between text-left mb-2"
          onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
        >
          <span className="font-medium">Date range</span>
          <svg
            className={`w-4 h-4 transition-transform ${isDateRangeOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isDateRangeOpen && (
          <div className="space-y-2">
            <div>
              <label className="block text-sm mb-1">Start date</label>
              <input
                type="date"
                value={filters.dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">End date</label>
              <input
                type="date"
                value={filters.dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Rate Type Section */}
      <div className="mb-4">
        <button
          className="w-full flex items-center justify-between text-left mb-2"
          onClick={() => setIsRateTypeOpen(!isRateTypeOpen)}
        >
          <span className="font-medium">Rate Type</span>
          <svg
            className={`w-4 h-4 transition-transform ${isRateTypeOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isRateTypeOpen && (
          <div className="space-y-2">
            {[
              { id: 'flatRate', label: 'Flat rate' },
              { id: 'weekdayRate', label: 'Weekday rate' },
              { id: 'weekendRate', label: 'Weekend rate' },
              { id: 'publicHolidayRate', label: 'Public Holiday rate' }
            ].map((rate) => (
              <label key={rate.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.rateType[rate.id]}
                  onChange={() => handleCheckboxChange('rateType', rate.id)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span>{rate.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            // Build query params
            const params = new URLSearchParams()
            
            // Add status filters (API: Pending | Approved | Rejected | Refunded | Processing | Completed)
            const selectedStatuses = Object.entries(filters.status)
              .filter(([_, checked]) => checked)
              .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
            if (selectedStatuses.length > 0) {
              params.append('status', selectedStatuses.join(','))
            }
            // Date range: API uses startDate, endDate
            if (filters.dateRange.startDate) {
              params.append('startDate', filters.dateRange.startDate)
              params.append('dateFrom', filters.dateRange.startDate)
            }
            if (filters.dateRange.endDate) {
              params.append('endDate', filters.dateRange.endDate)
              params.append('dateTo', filters.dateRange.endDate)
            }
            
            // Add rate type filters
            const selectedRateTypes = Object.entries(filters.rateType)
              .filter(([_, checked]) => checked)
              .map(([key, _]) => {
                const mapping: { [key: string]: string } = {
                  flatRate: 'Flat Rate',
                  weekdayRate: 'Weekday',
                  weekendRate: 'Weekend',
                  publicHolidayRate: 'Public Holiday'
                }
                return mapping[key] || key
              })
            if (selectedRateTypes.length > 0) {
              params.append('rateType', selectedRateTypes.join(','))
            }
            
            // Apply filters
            if (onApply) {
              onApply({
                status: selectedStatuses,
                dateRange: filters.dateRange,
                rateType: selectedRateTypes
              })
            }
            
            // Update URL
            const queryString = params.toString()
            if (queryString) {
              navigate(`${basePath}?${queryString}`)
            } else {
              navigate(basePath)
            }
            
            if (onClose) {
              onClose()
            }
          }}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={() => {
            // Reset filters
            setFilters({
              status: {
                rejected: false,
                pending: false,
                approved: false,
                refunded: false,
                processing: false,
                completed: false
              },
              dateRange: {
                startDate: '',
                endDate: ''
              },
              rateType: {
                flatRate: false,
                weekdayRate: false,
                weekendRate: false,
                publicHolidayRate: false
              }
            })
            navigate(basePath)
            if (onClose) {
              onClose()
            }
          }}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
