import { Client, Worker, Task, Rule } from '../types';

/**
 * Validates if a rule is well-formed and has all required properties
 * @param rule The rule to validate
 * @returns Object with validation result and any error messages
 */
export const validateRule = (rule: Rule) => {
  const errors: string[] = [];
  
  // Check required fields
  if (!rule.type) errors.push('Rule type is required');
  if (!rule.description) errors.push('Rule description is required');
  if (!rule.parameters) errors.push('Rule parameters are required');
  
  // Validate based on rule type
  switch (rule.type) {
    case 'coRun':
      if (!rule.parameters.taskIds || !Array.isArray(rule.parameters.taskIds) || rule.parameters.taskIds.length < 2) {
        errors.push('Co-run rule requires at least two task IDs');
      }
      break;
      
    case 'slotRestriction':
      if (!rule.parameters.group) errors.push('Slot restriction rule requires a group');
      if (!rule.parameters.minCommonSlots || rule.parameters.minCommonSlots < 1) {
        errors.push('Slot restriction rule requires a positive number of minimum common slots');
      }
      break;
      
    case 'loadLimit':
      if (!rule.parameters.workerGroup) errors.push('Load limit rule requires a worker group');
      if (!rule.parameters.maxSlotsPerPhase || rule.parameters.maxSlotsPerPhase < 1) {
        errors.push('Load limit rule requires a positive number of maximum slots per phase');
      }
      break;
      
    case 'phaseWindow':
      if (!rule.parameters.taskId) errors.push('Phase window rule requires a task ID');
      if (!rule.parameters.allowedPhases || !Array.isArray(rule.parameters.allowedPhases) || rule.parameters.allowedPhases.length < 1) {
        errors.push('Phase window rule requires at least one allowed phase');
      }
      break;
      
    case 'patternMatch':
      if (!rule.parameters.pattern) errors.push('Pattern match rule requires a pattern');
      if (!rule.parameters.targetField) errors.push('Pattern match rule requires a target field');
      break;
      
    case 'priorityOverride':
      if (rule.parameters.priority === undefined || rule.parameters.priority < 1 || rule.parameters.priority > 10) {
        errors.push('Priority override rule requires a priority value between 1 and 10');
      }
      break;
      
    default:
      errors.push(`Unknown rule type: ${rule.type}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Checks for circular dependencies in co-run rules
 * @param rules The list of rules to check
 * @returns Object with validation result and any circular dependencies found
 */
export const checkCircularDependencies = (rules: Rule[]) => {
  const coRunRules = rules.filter(rule => rule.type === 'coRun');
  const dependencies: Record<string, string[]> = {};
  
  // Build dependency graph
  coRunRules.forEach(rule => {
    const taskIds = rule.parameters.taskIds as string[];
    taskIds.forEach(taskId => {
      if (!dependencies[taskId]) {
        dependencies[taskId] = [];
      }
      // Add all other tasks in the co-run group as dependencies
      taskIds.filter(id => id !== taskId).forEach(dependentId => {
        if (!dependencies[taskId].includes(dependentId)) {
          dependencies[taskId].push(dependentId);
        }
      });
    });
  });
  
  // Check for circular dependencies using DFS
  const circularDependencies: string[][] = [];
  
  Object.keys(dependencies).forEach(taskId => {
    const visited: Record<string, boolean> = {};
    const path: string[] = [];
    
    const dfs = (currentId: string) => {
      // Mark as visited and add to current path
      visited[currentId] = true;
      path.push(currentId);
      
      // Check all dependencies
      const deps = dependencies[currentId] || [];
      for (const depId of deps) {
        // If not visited, continue DFS
        if (!visited[depId]) {
          if (dfs(depId)) return true;
        } 
        // If already in path, we found a cycle
        else if (path.includes(depId)) {
          const cycleStart = path.indexOf(depId);
          const cycle = [...path.slice(cycleStart), depId];
          circularDependencies.push(cycle);
          return true;
        }
      }
      
      // Remove from path when backtracking
      path.pop();
      return false;
    };
    
    dfs(taskId);
  });
  
  return {
    hasCircularDependencies: circularDependencies.length > 0,
    circularDependencies
  };
};

/**
 * Checks for conflicting rules
 * @param rules The list of rules to check
 * @returns Object with validation result and any conflicts found
 */
export const checkConflictingRules = (rules: Rule[]) => {
  const conflicts: { rule1: Rule; rule2: Rule; reason: string }[] = [];
  
  // Check for phase window conflicts
  const phaseWindowRules = rules.filter(rule => rule.type === 'phaseWindow');
  
  // Group phase window rules by task ID
  const taskPhaseRules: Record<string, Rule[]> = {};
  phaseWindowRules.forEach(rule => {
    const taskId = rule.parameters.taskId as string;
    if (!taskPhaseRules[taskId]) {
      taskPhaseRules[taskId] = [];
    }
    taskPhaseRules[taskId].push(rule);
  });
  
  // Check for conflicts within each task's phase rules
  Object.entries(taskPhaseRules).forEach(([taskId, taskRules]) => {
    if (taskRules.length > 1) {
      // Multiple phase window rules for the same task
      for (let i = 0; i < taskRules.length; i++) {
        for (let j = i + 1; j < taskRules.length; j++) {
          const rule1 = taskRules[i];
          const rule2 = taskRules[j];
          
          const phases1 = rule1.parameters.allowedPhases as number[];
          const phases2 = rule2.parameters.allowedPhases as number[];
          
          // Check if there's any overlap in allowed phases
          const overlap = phases1.some(phase => phases2.includes(phase));
          
          if (!overlap) {
            conflicts.push({
              rule1,
              rule2,
              reason: `Conflicting phase windows for task ${taskId}: no common allowed phases`
            });
          }
        }
      }
    }
  });
  
  // Check for load limit conflicts
  const loadLimitRules = rules.filter(rule => rule.type === 'loadLimit');
  
  // Group load limit rules by worker group
  const groupLoadRules: Record<string, Rule[]> = {};
  loadLimitRules.forEach(rule => {
    const group = rule.parameters.workerGroup as string;
    if (!groupLoadRules[group]) {
      groupLoadRules[group] = [];
    }
    groupLoadRules[group].push(rule);
  });
  
  // Check for conflicts within each group's load limit rules
  Object.entries(groupLoadRules).forEach(([group, groupRules]) => {
    if (groupRules.length > 1) {
      // Multiple load limit rules for the same worker group
      for (let i = 0; i < groupRules.length; i++) {
        for (let j = i + 1; j < groupRules.length; j++) {
          conflicts.push({
            rule1: groupRules[i],
            rule2: groupRules[j],
            reason: `Multiple load limit rules for worker group ${group}`
          });
        }
      }
    }
  });
  
  return {
    hasConflicts: conflicts.length > 0,
    conflicts
  };
};

/**
 * Exports rules to a JSON format
 * @param rules The list of rules to export
 * @returns JSON string of the rules
 */
export const exportRulesToJson = (rules: Rule[]) => {
  return JSON.stringify(rules, null, 2);
};

/**
 * Imports rules from a JSON string
 * @param jsonString The JSON string to import
 * @returns Array of Rule objects
 */
export const importRulesFromJson = (jsonString: string): Rule[] => {
  try {
    const rules = JSON.parse(jsonString) as Rule[];
    return rules;
  } catch (error) {
    console.error('Error importing rules from JSON:', error);
    return [];
  }
};