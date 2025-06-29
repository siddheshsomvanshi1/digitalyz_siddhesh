'use client'

import { useEffect, useState } from 'react'
import { FiAlertCircle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi'
import { DataEntity, ValidationError } from '@/types'
import { validateData } from '@/utils/dataValidator'

interface ValidationPanelProps {
  data: {
    clients: DataEntity[];
    workers: DataEntity[];
    tasks: DataEntity[];
  } | null;
  validationErrors: ValidationError[];
  setValidationErrors: (errors: ValidationError[]) => void;
}

const ValidationPanel = ({ data, validationErrors, setValidationErrors }: ValidationPanelProps) => {
  const [isValidating, setIsValidating] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'clients' | 'workers' | 'tasks'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (data) {
      runValidation()
    }
  }, [data])

  const runValidation = async () => {
    if (!data) return

    setIsValidating(true)
    try {
      const errors = await validateData(data)
      setValidationErrors(errors)
    } catch (error) {
      console.error('Validation error:', error)
    } finally {
      setIsValidating(false)
    }
  }

  const getFilteredErrors = () => {
    if (validationErrors.length === 0) return []

    let filtered = validationErrors

    // Apply entity type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter((error) => error.entityType === activeFilter)
    }

    // Apply search filter if provided
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (error) =>
          error.message.toLowerCase().includes(query) ||
          error.field.toLowerCase().includes(query) ||
          error.errorType.toLowerCase().includes(query)
      )
    }

    return filtered
  }

  const getErrorTypeCount = (errorType: string) => {
    return validationErrors.filter((error) => error.errorType === errorType).length
  }

  const getEntityErrorCount = (entityType: 'clients' | 'workers' | 'tasks') => {
    return validationErrors.filter((error) => error.entityType === entityType).length
  }

  const errorTypes = [
    { type: 'missingColumn', label: 'Missing Columns' },
    { type: 'duplicateId', label: 'Duplicate IDs' },
    { type: 'malformedList', label: 'Malformed Lists' },
    { type: 'outOfRange', label: 'Out of Range Values' },
    { type: 'brokenJson', label: 'Broken JSON' },
    { type: 'unknownReference', label: 'Unknown References' },
    { type: 'circularDependency', label: 'Circular Dependencies' },
    { type: 'conflictingRules', label: 'Conflicting Rules' },
  ]

  if (!data) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-gray-500">Please upload data files first to validate.</p>
        </div>
      </div>
    )
  }

  const filteredErrors = getFilteredErrors()

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-semibold">Data Validation</h2>
          
          <button
            onClick={runValidation}
            disabled={isValidating}
            className="btn-primary flex items-center mt-4 sm:mt-0"
          >
            {isValidating ? (
              <>
                <FiRefreshCw className="mr-2 animate-spin" /> Validating...
              </>
            ) : (
              <>
                <FiRefreshCw className="mr-2" /> Run Validation
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div
            className={`p-4 rounded-lg border ${validationErrors.length === 0
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'}`}
          >
            <div className="flex items-center">
              {validationErrors.length === 0 ? (
                <FiCheckCircle className="text-green-500 mr-2" />
              ) : (
                <FiAlertCircle className="text-red-500 mr-2" />
              )}
              <h3 className="font-medium">Total Issues</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{validationErrors.length}</p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-700">Clients</h3>
            <p className="text-2xl font-bold mt-2">{getEntityErrorCount('clients')}</p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-700">Workers</h3>
            <p className="text-2xl font-bold mt-2">{getEntityErrorCount('workers')}</p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-700">Tasks</h3>
            <p className="text-2xl font-bold mt-2">{getEntityErrorCount('tasks')}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-3">Validation Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {errorTypes.map((errorType) => (
              <div
                key={errorType.type}
                className="p-3 rounded-lg border border-gray-200 flex justify-between items-center"
              >
                <span className="text-sm">{errorType.label}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    getErrorTypeCount(errorType.type) > 0
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {getErrorTypeCount(errorType.type)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-semibold">Validation Results</h2>
          
          <div className="flex mt-4 sm:mt-0">
            <div className="relative mr-4">
              <input
                type="text"
                placeholder="Search errors..."
                className="input-field"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              className="input-field"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as any)}
            >
              <option value="all">All Entities</option>
              <option value="clients">Clients</option>
              <option value="workers">Workers</option>
              <option value="tasks">Tasks</option>
            </select>
          </div>
        </div>

        {filteredErrors.length === 0 ? (
          <div className="text-center py-8">
            {validationErrors.length === 0 ? (
              <div className="flex flex-col items-center">
                <FiCheckCircle className="text-green-500 w-12 h-12 mb-4" />
                <p className="text-gray-700 font-medium">All data is valid!</p>
                <p className="text-gray-500 mt-2">No validation errors were found.</p>
              </div>
            ) : (
              <p className="text-gray-500">
                No errors match your current filters. Try changing your search or filter criteria.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suggestion
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredErrors.map((error, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {error.entityType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {error.field}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          error.errorType === 'missingColumn' || error.errorType === 'duplicateId'
                            ? 'bg-red-100 text-red-800'
                            : error.errorType === 'malformedList' || error.errorType === 'outOfRange'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {error.errorType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {error.message}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {error.suggestion || 'No suggestion available'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ValidationPanel