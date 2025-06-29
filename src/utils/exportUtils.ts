import { Client, Worker, Task, Rule, PrioritySettings } from '../types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Interface for export data
 */
interface ExportData {
  clients?: Client[];
  workers?: Worker[];
  tasks?: Task[];
  rules?: Rule[];
  prioritySettings?: PrioritySettings;
}

/**
 * Exports data to CSV format
 * @param data The data to export
 * @param entityType The type of entity (clients, workers, tasks)
 * @returns CSV string
 */
export const exportToCsv = (data: any[], entityType: 'clients' | 'workers' | 'tasks'): string => {
  // Process data to handle arrays and objects
  const processedData = data.map(item => {
    const processed = { ...item };
    
    // Convert arrays and objects to strings
    Object.keys(processed).forEach(key => {
      if (Array.isArray(processed[key])) {
        processed[key] = JSON.stringify(processed[key]);
      } else if (typeof processed[key] === 'object' && processed[key] !== null) {
        processed[key] = JSON.stringify(processed[key]);
      }
    });
    
    return processed;
  });
  
  // Convert to CSV
  const csv = Papa.unparse(processedData);
  return csv;
};

/**
 * Exports data to Excel format
 * @param data The data to export
 * @param entityType The type of entity (clients, workers, tasks)
 * @returns Excel workbook
 */
export const exportToExcel = (data: any[], entityType: 'clients' | 'workers' | 'tasks'): XLSX.WorkBook => {
  // Process data to handle arrays and objects
  const processedData = data.map(item => {
    const processed = { ...item };
    
    // Convert arrays and objects to strings
    Object.keys(processed).forEach(key => {
      if (Array.isArray(processed[key])) {
        processed[key] = JSON.stringify(processed[key]);
      } else if (typeof processed[key] === 'object' && processed[key] !== null) {
        processed[key] = JSON.stringify(processed[key]);
      }
    });
    
    return processed;
  });
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(processedData);
  
  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, entityType);
  
  return workbook;
};

/**
 * Exports rules to JSON format
 * @param rules The rules to export
 * @returns JSON string
 */
export const exportRulesToJson = (rules: Rule[]): string => {
  return JSON.stringify(rules, null, 2);
};

/**
 * Exports priority settings to JSON format
 * @param settings The priority settings to export
 * @returns JSON string
 */
export const exportPrioritySettingsToJson = (settings: PrioritySettings): string => {
  return JSON.stringify(settings, null, 2);
};

/**
 * Exports all data to a single JSON file
 * @param data The data to export
 * @returns JSON string
 */
export const exportAllToJson = (data: ExportData): string => {
  return JSON.stringify(data, null, 2);
};

/**
 * Generates a download for a file
 * @param content The content of the file
 * @param fileName The name of the file
 * @param contentType The content type of the file
 */
export const downloadFile = (content: string, fileName: string, contentType: string): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  
  URL.revokeObjectURL(url);
};

/**
 * Downloads data as a CSV file
 * @param data The data to download
 * @param entityType The type of entity (clients, workers, tasks)
 */
export const downloadCsv = (data: any[], entityType: 'clients' | 'workers' | 'tasks'): void => {
  const csv = exportToCsv(data, entityType);
  downloadFile(csv, `${entityType}.csv`, 'text/csv');
};

/**
 * Downloads data as an Excel file
 * @param data The data to download
 * @param entityType The type of entity (clients, workers, tasks)
 */
export const downloadExcel = (data: any[], entityType: 'clients' | 'workers' | 'tasks'): void => {
  const workbook = exportToExcel(data, entityType);
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${entityType}.xlsx`;
  a.click();
  
  URL.revokeObjectURL(url);
};

/**
 * Downloads rules as a JSON file
 * @param rules The rules to download
 */
export const downloadRulesJson = (rules: Rule[]): void => {
  const json = exportRulesToJson(rules);
  downloadFile(json, 'rules.json', 'application/json');
};

/**
 * Downloads all data as a JSON file
 * @param data The data to download
 */
export const downloadAllJson = (data: ExportData): void => {
  const json = exportAllToJson(data);
  downloadFile(json, 'data_alchemist_export.json', 'application/json');
};