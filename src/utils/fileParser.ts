import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { DataEntity } from '@/types'

// Helper function to parse array-like strings into actual arrays
const parseArrayField = (value: string): any[] => {
  if (!value) return []
  
  try {
    // Try to parse as JSON first
    if (value.startsWith('[') && value.endsWith(']')) {
      return JSON.parse(value)
    }
    
    // Handle comma-separated values
    return value.split(',').map(item => {
      const trimmed = item.trim()
      // Try to convert to number if possible
      const num = Number(trimmed)
      return isNaN(num) ? trimmed : num
    })
  } catch (error) {
    console.error('Error parsing array field:', error)
    return [value] // Return as single-item array if parsing fails
  }
}

// Helper function to parse JSON fields
const parseJsonField = (value: string): any => {
  if (!value) return {}
  
  try {
    return JSON.parse(value)
  } catch (error) {
    console.error('Error parsing JSON field:', error)
    return value // Return original value if parsing fails
  }
}

// Process data based on column names
const processData = (data: any[]): DataEntity[] => {
  return data.map(row => {
    const processedRow: DataEntity = { ...row }
    
    // Process specific fields based on column names
    Object.keys(row).forEach(key => {
      // Handle array fields
      if (
        key === 'RequestedTaskIDs' ||
        key === 'Skills' ||
        key === 'AvailableSlots' ||
        key === 'PreferredPhases' ||
        key === 'RequiredSkills'
      ) {
        processedRow[key] = parseArrayField(row[key])
      }
      
      // Handle JSON fields
      else if (key === 'AttributesJSON') {
        processedRow[key] = typeof row[key] === 'string' ? row[key] : JSON.stringify(row[key])
      }
      
      // Handle numeric fields
      else if (
        key === 'PriorityLevel' ||
        key === 'MaxLoadPerPhase' ||
        key === 'QualificationLevel' ||
        key === 'Duration' ||
        key === 'MaxConcurrent'
      ) {
        processedRow[key] = Number(row[key])
      }
    })
    
    return processedRow
  })
}

// Parse CSV files
export const parseCSV = (file: File): Promise<DataEntity[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const processedData = processData(results.data as any[])
          resolve(processedData)
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

// Parse Excel files
export const parseExcel = async (file: File): Promise<DataEntity[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        const processedData = processData(jsonData as any[])
        resolve(processedData)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = (error) => {
      reject(error)
    }
    
    reader.readAsBinaryString(file)
  })
}

// AI-powered column mapping function (placeholder for now)
export const mapColumns = (data: any[], expectedColumns: string[]): any[] => {
  // This would be replaced with actual AI-powered mapping logic
  // For now, we'll just return the data as is
  return data
}