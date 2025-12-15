'use client'

import { useState } from 'react'

interface FilterState {
  status: string[]
  city: string[]
  shifts: {
    min: number
    max: number
  }
  postedBy?: string
  search?: string
  date?: string
  location?: string
  rateType?: string
}

interface JobFilterProps {
  onApplyFilter: (filters: FilterState) => void
  onClose: () => void
}

export default function JobFilter({ onApplyFilter, onClose }: JobFilterProps) {
  const [isStatusOpen, setIsStatusOpen] = useState(true)
  const [isCityOpen, setIsCityOpen] = useState(true)
  const [isPostedByOpen, setIsPostedByOpen] = useState(false)
  const [isRateTypeOpen, setIsRateTypeOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    city: [],
    shifts: {
      min: 1,
      max: 30
    },
    postedBy: "",
    search: "",
    date: "",
    location: "",
    rateType: ""
  }) 

  const [sliderValue, setSliderValue] = useState([10, 20])

  const statusOptions = ['Active', 'Pending', 'Cancelled', 'Completed', 'Deactivated']
  const cityOptions = ['Jurong', 'Yishun', 'Tampines', 'Sengkang']
  const postedByOptions = ['admin', 'employer']
  const rateTypeOptions = ['Weekend', 'Weekday', 'Public Holiday']

  const handleCheckboxChange = (category: 'status' | 'city', value: string) => {
    setFilters(prev => {
      const currentValues = prev[category]
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      return { ...prev, [category]: newValues }
    })
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    const index = parseInt(e.target.dataset.index || '0')
    setSliderValue(prev => {
      const newValue = [...prev]
      newValue[index] = value
      return newValue.sort((a, b) => a - b)
    })
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm w-[300px]">
      <h2 className="text-xl font-semibold mb-4">Filter</h2>

      {/* Status Section */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full mb-4"
          onClick={() => setIsStatusOpen(!isStatusOpen)}
        >
          <span className="text-base font-medium">Status</span>
          <svg
            className={`w-5 h-5 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isStatusOpen && (
          <div className="space-y-3">
            {statusOptions.map(status => (
              <label key={status} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded"
                  checked={filters.status.includes(status)}
                  onChange={() => handleCheckboxChange('status', status)}
                />
                <span className="text-sm">{status}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* City Section */}
      {/* <div className="mb-6">
        <button
          className="flex items-center justify-between w-full mb-4"
          onClick={() => setIsCityOpen(!isCityOpen)}
        >
          <span className="text-base font-medium">City</span>
          <svg
            className={`w-5 h-5 transition-transform ${isCityOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isCityOpen && (
          <div className="space-y-3">
            {cityOptions.map(city => (
              <label key={city} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded"
                  checked={filters.city.includes(city)}
                  onChange={() => handleCheckboxChange('city', city)}
                />
                <span className="text-sm">{city}</span>
              </label>
            ))}
          </div>
        )}
      </div> */}

      {/* Search Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          value={filters.search || ""}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          placeholder="Search job title or description"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Posted By Section */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full mb-4"
          onClick={() => setIsPostedByOpen(!isPostedByOpen)}
        >
          <span className="text-base font-medium">Posted By</span>
          <svg
            className={`w-5 h-5 transition-transform ${isPostedByOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isPostedByOpen && (
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="postedBy"
                className="w-4 h-4 border-gray-300"
                checked={filters.postedBy === ""}
                onChange={() => setFilters(prev => ({ ...prev, postedBy: "" }))}
              />
              <span className="text-sm">All</span>
            </label>
            {postedByOptions.map(option => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="postedBy"
                  className="w-4 h-4 border-gray-300"
                  checked={filters.postedBy === option}
                  onChange={() => setFilters(prev => ({ ...prev, postedBy: option }))}
                />
                <span className="text-sm capitalize">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Date Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Date
        </label>
        <input
          type="date"
          value={filters.date || ""}
          onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Location Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location/Outlet
        </label>
        <input
          type="text"
          value={filters.location || ""}
          onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          placeholder="Enter location or outlet"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Rate Type Section */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full mb-4"
          onClick={() => setIsRateTypeOpen(!isRateTypeOpen)}
        >
          <span className="text-base font-medium">Rate Type</span>
          <svg
            className={`w-5 h-5 transition-transform ${isRateTypeOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isRateTypeOpen && (
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="rateType"
                className="w-4 h-4 border-gray-300"
                checked={filters.rateType === ""}
                onChange={() => setFilters(prev => ({ ...prev, rateType: "" }))}
              />
              <span className="text-sm">All</span>
            </label>
            {rateTypeOptions.map(option => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="rateType"
                  className="w-4 h-4 border-gray-300"
                  checked={filters.rateType === option}
                  onChange={() => setFilters(prev => ({ ...prev, rateType: option }))}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Number of Shifts Section */}
      {/* <div>
        <h3 className="text-base font-medium mb-4">Number of Shifts</h3>
        <div className="relative pt-6 pb-2">
          <div className="relative">
            <input
              type="range"
              min="1"
              max="30"
              value={sliderValue[0]}
              data-index="0"
              onChange={handleSliderChange}
              className="absolute pointer-events-none appearance-none z-20 h-2 w-full opacity-0 cursor-pointer"
            />
            <input
              type="range"
              min="1"
              max="30"
              value={sliderValue[1]}
              data-index="1"
              onChange={handleSliderChange}
              className="absolute pointer-events-none appearance-none z-20 h-2 w-full opacity-0 cursor-pointer"
            />
            <div className="relative z-10 h-2">
              <div className="absolute z-10 left-0 right-0 bottom-0 top-0 rounded-md bg-gray-200"></div>
              <div
                className="absolute z-20 top-0 bottom-0 rounded-md bg-blue-500"
                style={{
                  left: `${(sliderValue[0] / 30) * 100}%`,
                  right: `${100 - (sliderValue[1] / 30) * 100}%`
                }}
              ></div>
              <div
                className="absolute z-30 w-4 h-4 top-[-6px] bg-blue-500 rounded-full"
                style={{ left: `${(sliderValue[0] / 30) * 100}%` }}
              ></div>
              <div
                className="absolute z-30 w-4 h-4 top-[-6px] bg-blue-500 rounded-full"
                style={{ left: `${(sliderValue[1] / 30) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <span className="text-sm">{sliderValue[0]}</span>
            <span className="text-sm">{sliderValue[1]}</span>
          </div>
        </div>
      </div> */}
      <button
  className="mt-6 w-full px-4 py-2 bg-[#048be1] text-white text-sm font-medium rounded-lg"
  onClick={() => {
    onApplyFilter(filters)
    onClose() 
  }}
>
        Apply Filters
      </button>

    </div>
  )
}
