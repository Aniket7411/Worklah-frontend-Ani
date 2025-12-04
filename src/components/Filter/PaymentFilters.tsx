'use client'

import { useState } from 'react'

export default function PaymentFilters() {
  const [isStatusOpen, setIsStatusOpen] = useState(true)
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(true)
  const [isRateTypeOpen, setIsRateTypeOpen] = useState(true)

  const [filters, setFilters] = useState({
    status: {
      rejected: false,
      pending: false,
      approved: false
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
            {['rejected', 'pending', 'approved'].map((status) => (
              <label key={status} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.status[status]}
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

      <button
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
      >
        Search
      </button>
    </div>
  )
}
