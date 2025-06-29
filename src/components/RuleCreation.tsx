'use client'

import { useState } from 'react'
import { FiPlus, FiTrash2, FiSave, FiDownload } from 'react-icons/fi'
import { DataEntity, Rule, RuleType } from '@/types'

interface RuleCreationProps {
  data: {
    clients: DataEntity[];
    workers: DataEntity[];
    tasks: DataEntity[];
  } | null;
  rules: Rule[];
  setRules: (rules: Rule[]) => void;
}

const RuleCreation = ({ data, rules, setRules }: RuleCreationProps) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'natural'>('visual')
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    type: 'coRun',
    description: '',
    parameters: {},
    priority: 1,
  })
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('')

  if (!data) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-gray-500">Please upload data files first to create rules.</p>
        </div>
      </div>
    )
  }

  const handleAddRule = () => {
    if (!newRule.description) return

    const rule: Rule = {
      id: `rule-${Date.now()}`,
      type: newRule.type as RuleType,
      description: newRule.description,
      parameters: newRule.parameters || {},
      priority: newRule.priority || 1,
    }

    setRules([...rules, rule])
    setNewRule({
      type: 'coRun',
      description: '',
      parameters: {},
      priority: 1,
    })
  }

  const handleRemoveRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id))
  }

  const handleNaturalLanguageSubmit = () => {
    if (!naturalLanguageInput.trim()) return

    // In a real implementation, this would call an AI service to parse the natural language
    // For now, we'll just create a simple rule based on the input
    const rule: Rule = {
      id: `rule-${Date.now()}`,
      type: 'coRun', // Default type
      description: naturalLanguageInput,
      parameters: {},
      priority: 1,
    }

    setRules([...rules, rule])
    setNaturalLanguageInput('')
  }

  const handleExportRules = () => {
    const rulesJson = JSON.stringify(rules, null, 2)
    const blob = new Blob([rulesJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rules.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderVisualRuleCreator = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-medium mb-4">Create New Rule</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rule Type</label>
            <select
              className="input-field"
              value={newRule.type}
              onChange={(e) => setNewRule({ ...newRule, type: e.target.value as RuleType })}
            >
              <option value="coRun">Co-run Tasks</option>
              <option value="slotRestriction">Slot Restriction</option>
              <option value="loadLimit">Load Limit</option>
              <option value="phaseWindow">Phase Window</option>
              <option value="patternMatch">Pattern Match</option>
              <option value="priorityOverride">Priority Override</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <input
              type="number"
              min="1"
              max="10"
              className="input-field"
              value={newRule.priority}
              onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            className="input-field"
            placeholder="Describe the rule..."
            value={newRule.description}
            onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
          />
        </div>
        
        {newRule.type === 'coRun' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Tasks</label>
            <select
              multiple
              className="input-field h-32"
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
                setNewRule({
                  ...newRule,
                  parameters: { ...newRule.parameters, taskIds: selectedOptions },
                })
              }}
            >
              {data.tasks.map((task) => (
                <option key={task.TaskID} value={task.TaskID}>
                  {task.TaskID}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple tasks</p>
          </div>
        )}
        
        {newRule.type === 'slotRestriction' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Worker Group</label>
            <select
              className="input-field mb-2"
              onChange={(e) => {
                setNewRule({
                  ...newRule,
                  parameters: { ...newRule.parameters, workerGroup: e.target.value },
                })
              }}
            >
              <option value="">Select a worker group</option>
              {Array.from(new Set(data.workers.map(worker => worker.WorkerGroup))).map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            
            <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Minimum Common Slots</label>
            <input
              type="number"
              min="1"
              className="input-field"
              onChange={(e) => {
                setNewRule({
                  ...newRule,
                  parameters: { ...newRule.parameters, minCommonSlots: parseInt(e.target.value) },
                })
              }}
            />
          </div>
        )}
        
        {/* Add more rule type specific inputs here */}
        
        <button onClick={handleAddRule} className="btn-primary flex items-center">
          <FiPlus className="mr-2" /> Add Rule
        </button>
      </div>
      
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Current Rules</h3>
          <button onClick={handleExportRules} className="btn-outline flex items-center">
            <FiDownload className="mr-2" /> Export Rules
          </button>
        </div>
        
        {rules.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No rules created yet</p>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded mr-2">
                        {rule.type}
                      </span>
                      <span className="text-xs font-medium bg-primary-100 text-primary-800 px-2 py-1 rounded">
                        Priority: {rule.priority}
                      </span>
                    </div>
                    <p className="font-medium mt-2">{rule.description}</p>
                    <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-x-auto">
                      {JSON.stringify(rule.parameters, null, 2)}
                    </pre>
                  </div>
                  <button
                    onClick={() => handleRemoveRule(rule.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderNaturalLanguageInput = () => (
    <div className="card">
      <h3 className="text-lg font-medium mb-4">Create Rules with Natural Language</h3>
      <p className="text-gray-600 mb-4">
        Describe your rules in plain English, and our AI will convert them into formal rules.
      </p>
      
      <div className="mb-4">
        <textarea
          className="input-field min-h-[150px]"
          placeholder="E.g., Task T1 must run with Task T2, or Workers in Sales team can only work in phases 1 and 2..."
          value={naturalLanguageInput}
          onChange={(e) => setNaturalLanguageInput(e.target.value)}
        />
      </div>
      
      <button onClick={handleNaturalLanguageSubmit} className="btn-primary flex items-center">
        <FiSave className="mr-2" /> Generate Rule
      </button>
      
      <div className="mt-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Example Phrases:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• "Task T1 must run with Task T2"</li>
          <li>• "Workers in Sales team can only work in phases 1 and 2"</li>
          <li>• "Limit each worker to maximum 3 tasks per phase"</li>
          <li>• "Tasks requiring Skill X cannot run in Phase 1"</li>
        </ul>
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-6 border-b">
        <div className="flex">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'visual'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('visual')}
          >
            Visual Rule Builder
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'natural'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('natural')}
          >
            Natural Language
          </button>
        </div>
      </div>

      {activeTab === 'visual' ? renderVisualRuleCreator() : renderNaturalLanguageInput()}
    </div>
  )
}

export default RuleCreation