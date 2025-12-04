import { ChevronLeft, ChevronRight, Clock, Plus, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

interface Shift {
    id: number
    startTime: string
    endTime: string
    availableVacancy: number
    standbyVacancy: number
    totalHours: number
    breakHours: number
    breakType: 'Paid' | 'Unpaid'
    totalWage: number
  }
  
  const initialShifts: Shift[] = [
    {
      id: 1,
      startTime: '11:00 AM',
      endTime: '03:00 PM',
      availableVacancy: 10,
      standbyVacancy: 2,
      totalHours: 4,
      breakHours: 1,
      breakType: 'Paid',
      totalWage: 15,
    },
    {
      id: 2,
      startTime: '04:00 PM',
      endTime: '08:00 PM',
      availableVacancy: 10,
      standbyVacancy: 2,
      totalHours: 4,
      breakHours: 1,
      breakType: 'Unpaid',
      totalWage: 15,
    },
    {
      id: 3,
      startTime: '07:00 PM',
      endTime: '11:00 PM',
      availableVacancy: 10,
      standbyVacancy: 2,
      totalHours: 4,
      breakHours: 1,
      breakType: 'Unpaid',
      totalWage: 15,
    },
  ]

const ShiftsInfo = () => {

  const [shifts, setShifts] = useState<Shift[]>(initialShifts)
  const [selectedShifts, setSelectedShifts] = useState<number[]>([])

  const handleIncrement = (id: number, field: keyof Shift) => {
    setShifts(shifts.map(shift => 
      shift.id === id ? { ...shift, [field]: (shift[field] as number) + 1 } : shift
    ))
  }

  const handleDecrement = (id: number, field: keyof Shift) => {
    setShifts(shifts.map(shift => 
      shift.id === id && (shift[field] as number) > 0 ? { ...shift, [field]: (shift[field] as number) - 1 } : shift
    ))
  }

  const handleBreakTypeChange = (id: number, value: 'Paid' | 'Unpaid') => {
    setShifts(shifts.map(shift => 
      shift.id === id ? { ...shift, breakType: value } : shift
    ))
  }

  const handleCheckboxChange = (id: number) => {
    setSelectedShifts(prevSelected => 
      prevSelected.includes(id)
        ? prevSelected.filter(shiftId => shiftId !== id)
        : [...prevSelected, id]
    )
  }

  const handleDeleteSelected = () => {
    setShifts(shifts.filter(shift => !selectedShifts.includes(shift.id)))
    setSelectedShifts([])
  }

  const handleAddNewShift = () => {
    const newShift: Shift = {
      id: shifts.length + 1,
      startTime: '12:00 PM',
      endTime: '04:00 PM',
      availableVacancy: 0,
      standbyVacancy: 0,
      totalHours: 4,
      breakHours: 0,
      breakType: 'Unpaid',
      totalWage: 0,
    }
    setShifts([...shifts, newShift])
  }

  return (
    <div>
      {selectedShifts.length > 0 && (
        <div className="mb-4">
          <button
            onClick={handleDeleteSelected}
            className="flex items-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <Trash2 size={16} className="mr-2" />
            Delete Selected
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border"></th>
              <th className="p-2 border text-left">Start Time</th>
              <th className="p-2 border text-left">End Time</th>
              <th className="p-2 border text-left">Available vacancy</th>
              <th className="p-2 border text-left">Standby vacancy</th>
              <th className="p-2 border text-left">Total Hours</th>
              <th className="p-2 border text-left">Break hours</th>
              <th className="p-2 border text-left">Paid/Unpaid break</th>
              <th className="p-2 border text-left">Total Wage</th>
              <th className="p-2 border"></th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift.id} className="border-b">
                <td className="p-2 border">
                  <input
                    type="checkbox"
                    checked={selectedShifts.includes(shift.id)}
                    onChange={() => handleCheckboxChange(shift.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="p-2 border">
                  <button className="flex items-center px-2 py-1 border rounded">
                    <Clock size={16} className="mr-2" />
                    {shift.startTime}
                  </button>
                </td>
                <td className="p-2 border">
                  <button className="flex items-center px-2 py-1 border rounded">
                    <Clock size={16} className="mr-2" />
                    {shift.endTime}
                  </button>
                </td>
                <td className="p-2 border">
                  <div className="flex items-center">
                    <button onClick={() => handleDecrement(shift.id, 'availableVacancy')} className="px-2 py-1 border rounded-l">-</button>
                    <span className="px-2 py-1 border-t border-b">{shift.availableVacancy}</span>
                    <button onClick={() => handleIncrement(shift.id, 'availableVacancy')} className="px-2 py-1 border rounded-r">+</button>
                  </div>
                </td>
                <td className="p-2 border">
                  <div className="flex items-center">
                    <button onClick={() => handleDecrement(shift.id, 'standbyVacancy')} className="px-2 py-1 border rounded-l">-</button>
                    <span className="px-2 py-1 border-t border-b">{shift.standbyVacancy}</span>
                    <button onClick={() => handleIncrement(shift.id, 'standbyVacancy')} className="px-2 py-1 border rounded-r">+</button>
                  </div>
                </td>
                <td className="p-2 border">{shift.totalHours} Hrs</td>
                <td className="p-2 border">
                  <div className="flex items-center">
                    <button onClick={() => handleDecrement(shift.id, 'breakHours')} className="px-2 py-1 border rounded-l">-</button>
                    <span className="px-2 py-1 border-t border-b">{shift.breakHours}</span>
                    <button onClick={() => handleIncrement(shift.id, 'breakHours')} className="px-2 py-1 border rounded-r">+</button>
                  </div>
                </td>
                <td className="p-2 border">
                  <select
                    value={shift.breakType}
                    onChange={(e) => handleBreakTypeChange(shift.id, e.target.value as 'Paid' | 'Unpaid')}
                    className="px-2 py-1 border rounded"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </td>
                <td className="p-2 border">
                  <div className="flex items-center">
                    <span>$</span>
                    <span>{shift.totalWage}</span>
                    <button className="ml-2 p-1 hover:bg-gray-200 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
                <td className="p-2 border">
                  <button className="p-1 text-red-500 hover:bg-red-100 rounded">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={handleAddNewShift}
          className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Plus size={16} className="mr-2" />
          Add Shift
        </button>
        <div className="flex items-center">
          <button className="p-1 border rounded-l">
            <ChevronLeft size={20} />
          </button>
          <div className="w-48 h-2 bg-gray-200 mx-2">
            <div className="w-1/3 h-full bg-blue-500"></div>
          </div>
          <button className="p-1 border rounded-r">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <button className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save</button>
      </div>
    </div>
  )
}

export default ShiftsInfo
