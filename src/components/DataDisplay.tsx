'use client'

import { useState } from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { DataEntity } from '@/types'
import { FiSearch, FiEdit2, FiSave, FiX } from 'react-icons/fi'

interface DataDisplayProps {
  data: {
    clients: DataEntity[]
    workers: DataEntity[]
    tasks: DataEntity[]
  } | null
  setData: (data: {
    clients: DataEntity[]
    workers: DataEntity[]
    tasks: DataEntity[]
  } | null) => void
}

const DataDisplay = ({ data, setData }: DataDisplayProps) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'workers' | 'tasks'>('clients')
  const [searchQuery, setSearchQuery] = useState('')
  const [editMode, setEditMode] = useState(false)

  if (!data) return null

  const generateColumns = (entityType: 'clients' | 'workers' | 'tasks'): GridColDef[] => {
    if (!data || !data[entityType] || data[entityType].length === 0) return []

    const firstRow = data[entityType][0]
    return Object.keys(firstRow).map((key) => ({
      field: key,
      headerName: key,
      flex: 1,
      minWidth: 150,
      editable: editMode,
      renderCell: (params) => {
        const value = params.value
        if (Array.isArray(value)) {
          return (
            <div className="truncate w-full" title={value.join(', ')}>
              {value.join(', ')}
            </div>
          )
        } else if (typeof value === 'object' && value !== null) {
          return (
            <div className="truncate w-full" title={JSON.stringify(value)}>
              {JSON.stringify(value)}
            </div>
          )
        }
        return (
          <div className="truncate w-full" title={String(value)}>
            {String(value)}
          </div>
        )
      },
    }))
  }

  const getRowsForActiveTab = () => {
    if (!data || !data[activeTab]) return []

    if (searchQuery.trim() === '') {
      return data[activeTab].map((row, index) => ({ ...row, id: index }))
    }

    const query = searchQuery.toLowerCase()
    return data[activeTab]
      .filter((row) =>
        Object.values(row).some((value) => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query)
          } else if (Array.isArray(value)) {
            return value.some((v) => String(v).toLowerCase().includes(query))
          } else if (value !== null && typeof value === 'object') {
            return JSON.stringify(value).toLowerCase().includes(query)
          }
          return String(value).toLowerCase().includes(query)
        })
      )
      .map((row, index) => ({ ...row, id: index }))
  }

  const handleSaveChanges = () => {
    setEditMode(false)
    // Implement save logic here if needed
  }

  const handleCancelChanges = () => {
    setEditMode(false)
    // Optionally revert changes here
  }

  return (
    <div className="card overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Data Preview</h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search..."
              className="input-field pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {editMode ? (
            <div className="flex gap-2">
              <button onClick={handleSaveChanges} className="btn-primary flex items-center">
                <FiSave className="mr-1" /> Save
              </button>
              <button onClick={handleCancelChanges} className="btn-outline flex items-center">
                <FiX className="mr-1" /> Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setEditMode(true)} className="btn-outline flex items-center">
              <FiEdit2 className="mr-1" /> Edit
            </button>
          )}
        </div>
      </div>

      <div className="border-b mb-3 overflow-x-auto">
        <div className="flex gap-3 flex-wrap">
          {(['clients', 'workers', 'tasks'] as const).map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === tab
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {data[tab] && (
                <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">{data[tab].length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-auto">
        <div style={{ minWidth: '800px' }}>
          <DataGrid
            rows={getRowsForActiveTab()}
            columns={generateColumns(activeTab)}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            disableRowSelectionOnClick
            autoHeight
            className="bg-white rounded shadow"
          />
        </div>
      </div>
    </div>
  )
}

export default DataDisplay
