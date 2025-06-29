'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUpload, FiFile, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi'
import { parseCSV, parseExcel } from '@/utils/fileParser'
import { DataEntity } from '@/types'

interface FileUploadProps {
  setData: (data: {
    clients: DataEntity[]
    workers: DataEntity[]
    tasks: DataEntity[]
  } | null) => void
}

const FileUpload = ({ setData }: FileUploadProps) => {
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    clients: null,
    workers: null,
    tasks: null,
  })

  const [uploadStatus, setUploadStatus] = useState<{
    [key: string]: 'idle' | 'loading' | 'success' | 'error'
  }>({
    clients: 'idle',
    workers: 'idle',
    tasks: 'idle',
  })

  const [errorMessages, setErrorMessages] = useState<{ [key: string]: string }>({
    clients: '',
    workers: '',
    tasks: '',
  })

  const parseFile = async (file: File): Promise<DataEntity[]> => {
    if (file.name.endsWith('.csv')) {
      return await parseCSV(file)
    } else if (file.name.endsWith('.xlsx')) {
      return await parseExcel(file)
    } else {
      throw new Error('Unsupported file format')
    }
  }

  const handleFileDrop = useCallback(
    async (acceptedFiles: File[], fileType: 'clients' | 'workers' | 'tasks') => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setFiles((prev) => ({ ...prev, [fileType]: file }))
      setUploadStatus((prev) => ({ ...prev, [fileType]: 'loading' }))

      try {
        const parsedData = await parseFile(file)

        const updatedData = {
          clients: fileType === 'clients' ? parsedData : files.clients ? await parseFile(files.clients) : [],
          workers: fileType === 'workers' ? parsedData : files.workers ? await parseFile(files.workers) : [],
          tasks: fileType === 'tasks' ? parsedData : files.tasks ? await parseFile(files.tasks) : [],
        }

        setData(updatedData)

        setUploadStatus((prev) => ({ ...prev, [fileType]: 'success' }))
        setErrorMessages((prev) => ({ ...prev, [fileType]: '' }))
      } catch (error) {
        console.error(`Error parsing ${fileType} file:`, error)
        setUploadStatus((prev) => ({ ...prev, [fileType]: 'error' }))
        setErrorMessages((prev) => ({
          ...prev,
          [fileType]: error instanceof Error ? error.message : 'Unknown error occurred',
        }))
      }
    },
    [files, setData]
  )

  const getDropzone = (fileType: 'clients' | 'workers' | 'tasks') => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: {
        'text/csv': ['.csv'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      },
      maxFiles: 1,
      onDrop: (acceptedFiles) => handleFileDrop(acceptedFiles, fileType),
    })

    return (
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : uploadStatus[fileType] === 'error'
            ? 'border-red-500 bg-red-50'
            : uploadStatus[fileType] === 'success'
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-primary-500 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center space-y-2">
          {uploadStatus[fileType] === 'success' ? (
            <FiCheckCircle className="w-10 h-10 text-green-500" />
          ) : uploadStatus[fileType] === 'error' ? (
            <FiAlertTriangle className="w-10 h-10 text-red-500" />
          ) : (
            <FiUpload className="w-10 h-10 text-gray-400" />
          )}

          {files[fileType] ? (
            <div className="flex items-center">
              <FiFile className="mr-2" />
              <span className="text-sm font-medium">{files[fileType]?.name}</span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {isDragActive
                ? `Drop ${fileType} file here...`
                : `Drag & drop ${fileType} file, or click to select`}
            </p>
          )}

          {uploadStatus[fileType] === 'error' && (
            <p className="text-xs text-red-500 mt-2">{errorMessages[fileType]}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <section className="card bg-gradient-to-br from-purple-50 to-blue-50 border border-blue-100 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Upload Your Data Files</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['clients', 'workers', 'tasks'] as const).map((type) => (
          <div key={type} className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700 mb-1 capitalize">{type} File</label>
            {getDropzone(type)}
            {errorMessages[type] && (
              <div className="flex items-center text-red-600 text-sm mt-1">
                <FiAlertTriangle className="mr-1" />
                {errorMessages[type]}
              </div>
            )}
            {files[type] && (
              <div className="flex items-center text-gray-500 text-xs mt-1">
                <FiFile className="mr-1" />
                {files[type]?.name}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Accepted formats: <span className="font-medium">.csv</span>,{' '}
        <span className="font-medium">.xlsx</span>. Please upload one file for each entity type.
      </p>
    </section>
  )
}

export default FileUpload
