// Data entity types
export interface DataEntity {
  [key: string]: any;
}

export interface Client extends DataEntity {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number;
  RequestedTaskIDs: string[];
  GroupTag: string;
  AttributesJSON: string;
}

export interface Worker extends DataEntity {
  WorkerID: string;
  Skills: string[];
  AvailableSlots: number[];
  MaxLoadPerPhase: number;
  WorkerGroup: string;
  QualificationLevel: number;
}

export interface Task extends DataEntity {
  TaskID: string;
  Duration: number;
  RequiredSkills: string[];
  PreferredPhases: number[];
  MaxConcurrent: number;
}

// Validation error types
export interface ValidationError {
  entityType: 'clients' | 'workers' | 'tasks';
  rowIndex: number;
  field: string;
  errorType: ValidationErrorType;
  message: string;
  suggestion?: string;
}

export type ValidationErrorType = 
  | 'missingColumn'
  | 'duplicateId'
  | 'malformedList'
  | 'outOfRange'
  | 'brokenJson'
  | 'unknownReference'
  | 'circularDependency'
  | 'conflictingRules'
  | 'phaseSaturation'
  | 'skillCoverage'
  | 'concurrencyIssue'
  | 'overloadedWorker';

// Rule types
export interface Rule {
  id: string;
  type: RuleType;
  description: string;
  parameters: any;
  priority: number;
}

export type RuleType = 
  | 'coRun'
  | 'slotRestriction'
  | 'loadLimit'
  | 'phaseWindow'
  | 'patternMatch'
  | 'priorityOverride';

// Priority settings
export interface PrioritySettings {
  weights: {
    clientPriority: number;
    workerUtilization: number;
    taskCompletion: number;
    fairnessScore: number;
  };
  rankings: string[];
  selectedPreset: 'maxFulfillment' | 'fairness' | 'minWorkload' | 'custom';
}