import { Client, Worker, Task } from '../types';
import { processNaturalLanguageSearch } from './aiHelpers';

/**
 * Interface for search filter
 */
interface SearchFilter {
  entityType: 'clients' | 'workers' | 'tasks';
  criteria: Record<string, any>;
}

/**
 * Processes a natural language search query and returns filtered data
 * @param query The natural language query
 * @param clients The client data
 * @param workers The worker data
 * @param tasks The task data
 * @returns Promise with the filtered data
 */
export const naturalLanguageSearch = async (
  query: string,
  clients: Client[],
  workers: Worker[],
  tasks: Task[]
) => {
  try {
    // Process the query using AI
    const filter = await processNaturalLanguageSearch(query);
    
    if (!filter) {
      throw new Error('Could not process search query');
    }
    
    // Apply the filter to the data
    return applyFilter(filter, clients, workers, tasks);
  } catch (error) {
    console.error('Error in natural language search:', error);
    return {
      entityType: null,
      results: [],
      error: 'Failed to process search query'
    };
  }
};

/**
 * Applies a search filter to the data
 * @param filter The search filter
 * @param clients The client data
 * @param workers The worker data
 * @param tasks The task data
 * @returns Object with the filtered data
 */
export const applyFilter = (
  filter: SearchFilter,
  clients: Client[],
  workers: Worker[],
  tasks: Task[]
) => {
  const { entityType, criteria } = filter;
  
  let results: any[] = [];
  
  switch (entityType) {
    case 'clients':
      results = filterClients(clients, criteria);
      break;
    case 'workers':
      results = filterWorkers(workers, criteria);
      break;
    case 'tasks':
      results = filterTasks(tasks, criteria);
      break;
    default:
      return {
        entityType: null,
        results: [],
        error: 'Invalid entity type'
      };
  }
  
  return {
    entityType,
    results,
    error: null
  };
};

/**
 * Filters client data based on criteria
 * @param clients The client data
 * @param criteria The filter criteria
 * @returns Filtered client data
 */
const filterClients = (clients: Client[], criteria: Record<string, any>) => {
  return clients.filter(client => {
    return Object.entries(criteria).every(([key, value]) => {
      // Handle special cases
      if (key === 'PriorityLevel' && typeof value === 'object') {
        const { operator, value: priorityValue } = value;
        const clientPriority = client.PriorityLevel;
        
        switch (operator) {
          case '>':
            return clientPriority > priorityValue;
          case '<':
            return clientPriority < priorityValue;
          case '>=':
            return clientPriority >= priorityValue;
          case '<=':
            return clientPriority <= priorityValue;
          case '=':
          case '==':
            return clientPriority === priorityValue;
          default:
            return true;
        }
      }
      
      // Handle array fields
      if (key === 'RequestedTaskIDs' && Array.isArray(client.RequestedTaskIDs)) {
        if (typeof value === 'string') {
          return client.RequestedTaskIDs.includes(value);
        } else if (Array.isArray(value)) {
          return value.some(v => client.RequestedTaskIDs.includes(v));
        }
      }
      
      // Handle JSON fields
      if (key === 'AttributesJSON' && client.AttributesJSON) {
        const attributes = typeof client.AttributesJSON === 'string' 
          ? JSON.parse(client.AttributesJSON) 
          : client.AttributesJSON;
          
        if (typeof value === 'object') {
          return Object.entries(value).every(([attrKey, attrValue]) => {
            return attributes[attrKey] === attrValue;
          });
        }
      }
      
      // Default case: direct comparison
      return client[key as keyof Client] === value;
    });
  });
};

/**
 * Filters worker data based on criteria
 * @param workers The worker data
 * @param criteria The filter criteria
 * @returns Filtered worker data
 */
const filterWorkers = (workers: Worker[], criteria: Record<string, any>) => {
  return workers.filter(worker => {
    return Object.entries(criteria).every(([key, value]) => {
      // Handle array fields
      if (key === 'Skills' && Array.isArray(worker.Skills)) {
        if (typeof value === 'string') {
          return worker.Skills.includes(value);
        } else if (Array.isArray(value)) {
          return value.some(v => worker.Skills.includes(v));
        }
      }
      
      if (key === 'AvailableSlots' && Array.isArray(worker.AvailableSlots)) {
        if (typeof value === 'number') {
          return worker.AvailableSlots.includes(value);
        } else if (Array.isArray(value)) {
          return value.some(v => worker.AvailableSlots.includes(v));
        }
      }
      
      // Handle numeric comparisons
      if (key === 'MaxLoadPerPhase' && typeof value === 'object') {
        const { operator, value: loadValue } = value;
        const workerLoad = worker.MaxLoadPerPhase;
        
        switch (operator) {
          case '>':
            return workerLoad > loadValue;
          case '<':
            return workerLoad < loadValue;
          case '>=':
            return workerLoad >= loadValue;
          case '<=':
            return workerLoad <= loadValue;
          case '=':
          case '==':
            return workerLoad === loadValue;
          default:
            return true;
        }
      }
      
      // Default case: direct comparison
      return worker[key as keyof Worker] === value;
    });
  });
};

/**
 * Filters task data based on criteria
 * @param tasks The task data
 * @param criteria The filter criteria
 * @returns Filtered task data
 */
const filterTasks = (tasks: Task[], criteria: Record<string, any>) => {
  return tasks.filter(task => {
    return Object.entries(criteria).every(([key, value]) => {
      // Handle array fields
      if (key === 'RequiredSkills' && Array.isArray(task.RequiredSkills)) {
        if (typeof value === 'string') {
          return task.RequiredSkills.includes(value);
        } else if (Array.isArray(value)) {
          return value.some(v => task.RequiredSkills.includes(v));
        }
      }
      
      if (key === 'PreferredPhases' && Array.isArray(task.PreferredPhases)) {
        if (typeof value === 'number') {
          return task.PreferredPhases.includes(value);
        } else if (Array.isArray(value)) {
          return value.some(v => task.PreferredPhases.includes(v));
        } else if (typeof value === 'object') {
          const { operator, value: phaseValue } = value;
          
          switch (operator) {
            case 'includes':
              return task.PreferredPhases.includes(phaseValue);
            case 'count':
              return task.PreferredPhases.length === phaseValue;
            case 'count>':
              return task.PreferredPhases.length > phaseValue;
            case 'count<':
              return task.PreferredPhases.length < phaseValue;
            default:
              return true;
          }
        }
      }
      
      // Handle numeric comparisons
      if (key === 'Duration' && typeof value === 'object') {
        const { operator, value: durationValue } = value;
        const taskDuration = task.Duration;
        
        switch (operator) {
          case '>':
            return taskDuration > durationValue;
          case '<':
            return taskDuration < durationValue;
          case '>=':
            return taskDuration >= durationValue;
          case '<=':
            return taskDuration <= durationValue;
          case '=':
          case '==':
            return taskDuration === durationValue;
          default:
            return true;
        }
      }
      
      // Default case: direct comparison
      return task[key as keyof Task] === value;
    });
  });
};

/**
 * Performs a simple text search on data
 * @param query The search query
 * @param data The data to search
 * @returns Filtered data
 */
export const simpleTextSearch = <T>(query: string, data: T[]): T[] => {
  if (!query) return data;
  
  const lowerQuery = query.toLowerCase();
  
  return data.filter(item => {
    return Object.values(item).some(value => {
      if (value === null || value === undefined) return false;
      
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerQuery);
      }
      
      if (typeof value === 'number' || typeof value === 'boolean') {
        return value.toString().toLowerCase().includes(lowerQuery);
      }
      
      if (Array.isArray(value)) {
        return value.some(v => {
          if (typeof v === 'string') {
            return v.toLowerCase().includes(lowerQuery);
          }
          return v.toString().toLowerCase().includes(lowerQuery);
        });
      }
      
      if (typeof value === 'object') {
        return JSON.stringify(value).toLowerCase().includes(lowerQuery);
      }
      
      return false;
    });
  });
};