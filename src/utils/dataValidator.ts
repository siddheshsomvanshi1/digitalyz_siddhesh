import { DataEntity, ValidationError, ValidationErrorType } from '@/types'

// Required columns for each entity type
const requiredColumns = {
  clients: ['ClientID', 'ClientName', 'PriorityLevel', 'RequestedTaskIDs', 'GroupTag', 'AttributesJSON'],
  workers: ['WorkerID', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase', 'WorkerGroup', 'QualificationLevel'],
  tasks: ['TaskID', 'Duration', 'RequiredSkills', 'PreferredPhases', 'MaxConcurrent'],
}

// Main validation function
export const validateData = async (data: {
  clients: DataEntity[];
  workers: DataEntity[];
  tasks: DataEntity[];
}): Promise<ValidationError[]> => {
  const errors: ValidationError[] = []

  // Validate each entity type
  errors.push(...validateClients(data.clients, data.tasks))
  errors.push(...validateWorkers(data.workers))
  errors.push(...validateTasks(data.tasks))

  // Cross-entity validations
  errors.push(...validateCrossEntityReferences(data))
  errors.push(...validateCircularDependencies(data))

  return errors
}

// Validate clients data
const validateClients = (clients: DataEntity[], tasks: DataEntity[]): ValidationError[] => {
  const errors: ValidationError[] = []
  const clientIds = new Set<string>()
  const taskIds = new Set<string>(tasks.map(task => task.TaskID))

  // Check for required columns
  const missingColumns = checkMissingColumns(clients[0] || {}, requiredColumns.clients)
  if (missingColumns.length > 0) {
    errors.push({
      entityType: 'clients',
      rowIndex: -1, // Applies to all rows
      field: missingColumns.join(', '),
      errorType: 'missingColumn',
      message: `Missing required columns: ${missingColumns.join(', ')}`,
      suggestion: 'Add the missing columns to your clients data',
    })
  }

  // Validate each client
  clients.forEach((client, index) => {
    // Check for duplicate IDs
    if (client.ClientID) {
      if (clientIds.has(client.ClientID)) {
        errors.push({
          entityType: 'clients',
          rowIndex: index,
          field: 'ClientID',
          errorType: 'duplicateId',
          message: `Duplicate ClientID: ${client.ClientID}`,
          suggestion: 'Ensure each client has a unique ID',
        })
      } else {
        clientIds.add(client.ClientID)
      }
    }

    // Check PriorityLevel range (1-5)
    if (client.PriorityLevel !== undefined) {
      if (isNaN(client.PriorityLevel) || client.PriorityLevel < 1 || client.PriorityLevel > 5) {
        errors.push({
          entityType: 'clients',
          rowIndex: index,
          field: 'PriorityLevel',
          errorType: 'outOfRange',
          message: `PriorityLevel must be between 1 and 5, got: ${client.PriorityLevel}`,
          suggestion: 'Set PriorityLevel to a value between 1 and 5',
        })
      }
    }

    // Check RequestedTaskIDs
    if (client.RequestedTaskIDs) {
      if (!Array.isArray(client.RequestedTaskIDs)) {
        errors.push({
          entityType: 'clients',
          rowIndex: index,
          field: 'RequestedTaskIDs',
          errorType: 'malformedList',
          message: 'RequestedTaskIDs is not a valid array',
          suggestion: 'Format RequestedTaskIDs as a comma-separated list or JSON array',
        })
      } else {
        // Check if all requested task IDs exist
        client.RequestedTaskIDs.forEach(taskId => {
          if (!taskIds.has(taskId)) {
            errors.push({
              entityType: 'clients',
              rowIndex: index,
              field: 'RequestedTaskIDs',
              errorType: 'unknownReference',
              message: `Unknown TaskID referenced: ${taskId}`,
              suggestion: 'Ensure all referenced TaskIDs exist in the tasks data',
            })
          }
        })
      }
    }

    // Check AttributesJSON
    if (client.AttributesJSON) {
      try {
        if (typeof client.AttributesJSON === 'string') {
          JSON.parse(client.AttributesJSON)
        }
      } catch (error) {
        errors.push({
          entityType: 'clients',
          rowIndex: index,
          field: 'AttributesJSON',
          errorType: 'brokenJson',
          message: 'AttributesJSON contains invalid JSON',
          suggestion: 'Fix the JSON format in AttributesJSON',
        })
      }
    }
  })

  return errors
}

// Validate workers data
const validateWorkers = (workers: DataEntity[]): ValidationError[] => {
  const errors: ValidationError[] = []
  const workerIds = new Set<string>()

  // Check for required columns
  const missingColumns = checkMissingColumns(workers[0] || {}, requiredColumns.workers)
  if (missingColumns.length > 0) {
    errors.push({
      entityType: 'workers',
      rowIndex: -1, // Applies to all rows
      field: missingColumns.join(', '),
      errorType: 'missingColumn',
      message: `Missing required columns: ${missingColumns.join(', ')}`,
      suggestion: 'Add the missing columns to your workers data',
    })
  }

  // Validate each worker
  workers.forEach((worker, index) => {
    // Check for duplicate IDs
    if (worker.WorkerID) {
      if (workerIds.has(worker.WorkerID)) {
        errors.push({
          entityType: 'workers',
          rowIndex: index,
          field: 'WorkerID',
          errorType: 'duplicateId',
          message: `Duplicate WorkerID: ${worker.WorkerID}`,
          suggestion: 'Ensure each worker has a unique ID',
        })
      } else {
        workerIds.add(worker.WorkerID)
      }
    }

    // Check AvailableSlots
    if (worker.AvailableSlots) {
      if (!Array.isArray(worker.AvailableSlots)) {
        errors.push({
          entityType: 'workers',
          rowIndex: index,
          field: 'AvailableSlots',
          errorType: 'malformedList',
          message: 'AvailableSlots is not a valid array',
          suggestion: 'Format AvailableSlots as a comma-separated list or JSON array',
        })
      } else {
        // Check if all slots are numeric
        const nonNumericSlots = worker.AvailableSlots.filter(slot => typeof slot !== 'number' || isNaN(slot))
        if (nonNumericSlots.length > 0) {
          errors.push({
            entityType: 'workers',
            rowIndex: index,
            field: 'AvailableSlots',
            errorType: 'malformedList',
            message: `AvailableSlots contains non-numeric values: ${nonNumericSlots.join(', ')}`,
            suggestion: 'Ensure all slots are numeric values',
          })
        }
      }
    }

    // Check Skills
    if (worker.Skills && !Array.isArray(worker.Skills)) {
      errors.push({
        entityType: 'workers',
        rowIndex: index,
        field: 'Skills',
        errorType: 'malformedList',
        message: 'Skills is not a valid array',
        suggestion: 'Format Skills as a comma-separated list or JSON array',
      })
    }

    // Check MaxLoadPerPhase
    if (worker.MaxLoadPerPhase !== undefined) {
      if (isNaN(worker.MaxLoadPerPhase) || worker.MaxLoadPerPhase < 0) {
        errors.push({
          entityType: 'workers',
          rowIndex: index,
          field: 'MaxLoadPerPhase',
          errorType: 'outOfRange',
          message: `MaxLoadPerPhase must be a non-negative number, got: ${worker.MaxLoadPerPhase}`,
          suggestion: 'Set MaxLoadPerPhase to a non-negative number',
        })
      }
    }

    // Check QualificationLevel
    if (worker.QualificationLevel !== undefined) {
      if (isNaN(worker.QualificationLevel) || worker.QualificationLevel < 0) {
        errors.push({
          entityType: 'workers',
          rowIndex: index,
          field: 'QualificationLevel',
          errorType: 'outOfRange',
          message: `QualificationLevel must be a non-negative number, got: ${worker.QualificationLevel}`,
          suggestion: 'Set QualificationLevel to a non-negative number',
        })
      }
    }
  })

  return errors
}

// Validate tasks data
const validateTasks = (tasks: DataEntity[]): ValidationError[] => {
  const errors: ValidationError[] = []
  const taskIds = new Set<string>()

  // Check for required columns
  const missingColumns = checkMissingColumns(tasks[0] || {}, requiredColumns.tasks)
  if (missingColumns.length > 0) {
    errors.push({
      entityType: 'tasks',
      rowIndex: -1, // Applies to all rows
      field: missingColumns.join(', '),
      errorType: 'missingColumn',
      message: `Missing required columns: ${missingColumns.join(', ')}`,
      suggestion: 'Add the missing columns to your tasks data',
    })
  }

  // Validate each task
  tasks.forEach((task, index) => {
    // Check for duplicate IDs
    if (task.TaskID) {
      if (taskIds.has(task.TaskID)) {
        errors.push({
          entityType: 'tasks',
          rowIndex: index,
          field: 'TaskID',
          errorType: 'duplicateId',
          message: `Duplicate TaskID: ${task.TaskID}`,
          suggestion: 'Ensure each task has a unique ID',
        })
      } else {
        taskIds.add(task.TaskID)
      }
    }

    // Check Duration
    if (task.Duration !== undefined) {
      if (isNaN(task.Duration) || task.Duration <= 0) {
        errors.push({
          entityType: 'tasks',
          rowIndex: index,
          field: 'Duration',
          errorType: 'outOfRange',
          message: `Duration must be a positive number, got: ${task.Duration}`,
          suggestion: 'Set Duration to a positive number',
        })
      }
    }

    // Check RequiredSkills
    if (task.RequiredSkills && !Array.isArray(task.RequiredSkills)) {
      errors.push({
        entityType: 'tasks',
        rowIndex: index,
        field: 'RequiredSkills',
        errorType: 'malformedList',
        message: 'RequiredSkills is not a valid array',
        suggestion: 'Format RequiredSkills as a comma-separated list or JSON array',
      })
    }

    // Check PreferredPhases
    if (task.PreferredPhases) {
      if (!Array.isArray(task.PreferredPhases)) {
        errors.push({
          entityType: 'tasks',
          rowIndex: index,
          field: 'PreferredPhases',
          errorType: 'malformedList',
          message: 'PreferredPhases is not a valid array',
          suggestion: 'Format PreferredPhases as a comma-separated list or JSON array',
        })
      } else {
        // Check if all phases are numeric
        const nonNumericPhases = task.PreferredPhases.filter(phase => typeof phase !== 'number' || isNaN(phase))
        if (nonNumericPhases.length > 0) {
          errors.push({
            entityType: 'tasks',
            rowIndex: index,
            field: 'PreferredPhases',
            errorType: 'malformedList',
            message: `PreferredPhases contains non-numeric values: ${nonNumericPhases.join(', ')}`,
            suggestion: 'Ensure all phases are numeric values',
          })
        }
      }
    }

    // Check MaxConcurrent
    if (task.MaxConcurrent !== undefined) {
      if (isNaN(task.MaxConcurrent) || task.MaxConcurrent < 0) {
        errors.push({
          entityType: 'tasks',
          rowIndex: index,
          field: 'MaxConcurrent',
          errorType: 'outOfRange',
          message: `MaxConcurrent must be a non-negative number, got: ${task.MaxConcurrent}`,
          suggestion: 'Set MaxConcurrent to a non-negative number',
        })
      }
    }
  })

  return errors
}

// Validate cross-entity references
const validateCrossEntityReferences = (data: {
  clients: DataEntity[];
  workers: DataEntity[];
  tasks: DataEntity[];
}): ValidationError[] => {
  const errors: ValidationError[] = []
  const taskIds = new Set<string>(data.tasks.map(task => task.TaskID))
  const workerSkills = new Set<string>()

  // Collect all worker skills
  data.workers.forEach(worker => {
    if (Array.isArray(worker.Skills)) {
      worker.Skills.forEach(skill => workerSkills.add(skill))
    }
  })

  // Check if all required skills for tasks are available in workers
  data.tasks.forEach((task, index) => {
    if (Array.isArray(task.RequiredSkills)) {
      task.RequiredSkills.forEach(skill => {
        if (!workerSkills.has(skill)) {
          errors.push({
            entityType: 'tasks',
            rowIndex: index,
            field: 'RequiredSkills',
            errorType: 'skillCoverage',
            message: `No worker has the required skill: ${skill}`,
            suggestion: 'Add workers with this skill or update the required skills',
          })
        }
      })
    }
  })

  return errors
}

// Validate circular dependencies
const validateCircularDependencies = (data: {
  clients: DataEntity[];
  workers: DataEntity[];
  tasks: DataEntity[];
}): ValidationError[] => {
  // This is a placeholder for circular dependency validation
  // In a real implementation, you would check for circular references in task dependencies
  return []
}

// Helper function to check for missing columns
const checkMissingColumns = (entity: DataEntity, requiredCols: string[]): string[] => {
  if (!entity) return requiredCols
  return requiredCols.filter(col => !(col in entity))
}