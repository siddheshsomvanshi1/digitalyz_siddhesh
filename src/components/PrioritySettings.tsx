'use client'

import { useState } from 'react'
import { FiDownload, FiSave } from 'react-icons/fi'
import { DataEntity, PrioritySettings as PrioritySettingsType } from '@/types'

interface PrioritySettingsProps {
  data: {
    clients: DataEntity[];
    workers: DataEntity[];
    tasks: DataEntity[];
  } | null;
  prioritySettings: any;
  setPrioritySettings: (settings: any) => void;
  rules: any[];
}

const PrioritySettings = ({
  data,
  prioritySettings,
  setPrioritySettings,
  rules,
}: PrioritySettingsProps) => {
  const [activeTab, setActiveTab] = useState<'sliders' | 'ranking' | 'presets'>('sliders')
  const [weights, setWeights] = useState<{
    clientPriority: number;
    workerUtilization: number;
    taskCompletion: number;
    fairnessScore: number;
  }>(prioritySettings.weights || {
    clientPriority: 5,
    workerUtilization: 3,
    taskCompletion: 4,
    fairnessScore: 3,
  })
  const [rankings, setRankings] = useState<string[]>(
    prioritySettings.rankings || ['clientPriority', 'taskCompletion', 'workerUtilization', 'fairnessScore']
  )
  const [selectedPreset, setSelectedPreset] = useState<'maxFulfillment' | 'fairness' | 'minWorkload' | 'custom'>(
    prioritySettings.selectedPreset || 'custom'
  )

  if (!data) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-gray-500">Please upload data files first to set priorities.</p>
        </div>
      </div>
    )
  }

  const handleSaveSettings = () => {
    const settings: PrioritySettingsType = {
      weights,
      rankings,
      selectedPreset,
    }
    setPrioritySettings(settings)
  }

  const handleExportData = () => {
    // Prepare the export data
    const exportData = {
      clients: data.clients,
      workers: data.workers,
      tasks: data.tasks,
      rules,
      prioritySettings: {
        weights,
        rankings,
        selectedPreset,
      },
    }

    // Convert to JSON and download
    const jsonData = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data_export.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const applyPreset = (preset: 'maxFulfillment' | 'fairness' | 'minWorkload') => {
    setSelectedPreset(preset)

    switch (preset) {
      case 'maxFulfillment':
        setWeights({
          clientPriority: 8,
          workerUtilization: 4,
          taskCompletion: 7,
          fairnessScore: 2,
        })
        setRankings(['clientPriority', 'taskCompletion', 'workerUtilization', 'fairnessScore'])
        break
      case 'fairness':
        setWeights({
          clientPriority: 5,
          workerUtilization: 5,
          taskCompletion: 5,
          fairnessScore: 8,
        })
        setRankings(['fairnessScore', 'clientPriority', 'workerUtilization', 'taskCompletion'])
        break
      case 'minWorkload':
        setWeights({
          clientPriority: 3,
          workerUtilization: 8,
          taskCompletion: 4,
          fairnessScore: 6,
        })
        setRankings(['workerUtilization', 'fairnessScore', 'taskCompletion', 'clientPriority'])
        break
    }
  }

  const renderSliders = () => (
    <div className="card">
      <h3 className="text-lg font-medium mb-6">Priority Weights</h3>
      <p className="text-gray-600 mb-6">
        Adjust the sliders to set the relative importance of each factor in resource allocation.
      </p>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Client Priority</label>
            <span className="text-sm font-medium">{weights.clientPriority}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={weights.clientPriority}
            onChange={(e) => setWeights({ ...weights, clientPriority: parseInt(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Higher values prioritize clients with higher priority levels
          </p>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Worker Utilization</label>
            <span className="text-sm font-medium">{weights.workerUtilization}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={weights.workerUtilization}
            onChange={(e) => setWeights({ ...weights, workerUtilization: parseInt(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Higher values prioritize balanced workload across workers
          </p>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Task Completion</label>
            <span className="text-sm font-medium">{weights.taskCompletion}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={weights.taskCompletion}
            onChange={(e) => setWeights({ ...weights, taskCompletion: parseInt(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Higher values prioritize completing more tasks
          </p>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Fairness Score</label>
            <span className="text-sm font-medium">{weights.fairnessScore}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={weights.fairnessScore}
            onChange={(e) => setWeights({ ...weights, fairnessScore: parseInt(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Higher values ensure fair distribution of resources
          </p>
        </div>
      </div>
    </div>
  )

  const renderRanking = () => {
    const factors = [
      { id: 'clientPriority', label: 'Client Priority' },
      { id: 'workerUtilization', label: 'Worker Utilization' },
      { id: 'taskCompletion', label: 'Task Completion' },
      { id: 'fairnessScore', label: 'Fairness Score' },
    ]

    const moveItem = (id: string, direction: 'up' | 'down') => {
      const currentIndex = rankings.indexOf(id)
      if (direction === 'up' && currentIndex > 0) {
        const newRankings = [...rankings]
        const temp = newRankings[currentIndex - 1]
        newRankings[currentIndex - 1] = newRankings[currentIndex]
        newRankings[currentIndex] = temp
        setRankings(newRankings)
        setSelectedPreset('custom')
      } else if (direction === 'down' && currentIndex < rankings.length - 1) {
        const newRankings = [...rankings]
        const temp = newRankings[currentIndex + 1]
        newRankings[currentIndex + 1] = newRankings[currentIndex]
        newRankings[currentIndex] = temp
        setRankings(newRankings)
        setSelectedPreset('custom')
      }
    }

    return (
      <div className="card">
        <h3 className="text-lg font-medium mb-6">Priority Ranking</h3>
        <p className="text-gray-600 mb-6">
          Drag and drop to rank factors in order of importance (most important at the top).
        </p>

        <div className="space-y-2">
          {rankings.map((id, index) => {
            const factor = factors.find((f) => f.id === id)
            if (!factor) return null

            return (
              <div
                key={id}
                className="flex items-center p-3 bg-white border rounded-lg shadow-sm"
              >
                <span className="font-bold mr-3">{index + 1}</span>
                <span className="flex-grow font-medium">{factor.label}</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => moveItem(id, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveItem(id, 'down')}
                    disabled={index === rankings.length - 1}
                    className={`p-1 rounded ${index === rankings.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    ↓
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderPresets = () => (
    <div className="card">
      <h3 className="text-lg font-medium mb-6">Priority Presets</h3>
      <p className="text-gray-600 mb-6">
        Choose a preset configuration or customize your own settings.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedPreset === 'maxFulfillment' ? 'border-primary-500 bg-primary-50' : 'hover:bg-gray-50'}`}
          onClick={() => applyPreset('maxFulfillment')}
        >
          <h4 className="font-medium mb-2">Maximum Fulfillment</h4>
          <p className="text-sm text-gray-600">
            Prioritizes client satisfaction and task completion over worker balance.
          </p>
          <div className="mt-3 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Client Priority:</span>
              <span className="font-medium">8/10</span>
            </div>
            <div className="flex justify-between">
              <span>Task Completion:</span>
              <span className="font-medium">7/10</span>
            </div>
            <div className="flex justify-between">
              <span>Worker Utilization:</span>
              <span className="font-medium">4/10</span>
            </div>
            <div className="flex justify-between">
              <span>Fairness:</span>
              <span className="font-medium">2/10</span>
            </div>
          </div>
        </div>

        <div
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedPreset === 'fairness' ? 'border-primary-500 bg-primary-50' : 'hover:bg-gray-50'}`}
          onClick={() => applyPreset('fairness')}
        >
          <h4 className="font-medium mb-2">Fairness</h4>
          <p className="text-sm text-gray-600">
            Balances all factors with emphasis on fair distribution of resources.
          </p>
          <div className="mt-3 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Client Priority:</span>
              <span className="font-medium">5/10</span>
            </div>
            <div className="flex justify-between">
              <span>Task Completion:</span>
              <span className="font-medium">5/10</span>
            </div>
            <div className="flex justify-between">
              <span>Worker Utilization:</span>
              <span className="font-medium">5/10</span>
            </div>
            <div className="flex justify-between">
              <span>Fairness:</span>
              <span className="font-medium">8/10</span>
            </div>
          </div>
        </div>

        <div
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedPreset === 'minWorkload' ? 'border-primary-500 bg-primary-50' : 'hover:bg-gray-50'}`}
          onClick={() => applyPreset('minWorkload')}
        >
          <h4 className="font-medium mb-2">Minimum Workload</h4>
          <p className="text-sm text-gray-600">
            Focuses on optimizing worker utilization and reducing overload.
          </p>
          <div className="mt-3 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Client Priority:</span>
              <span className="font-medium">3/10</span>
            </div>
            <div className="flex justify-between">
              <span>Task Completion:</span>
              <span className="font-medium">4/10</span>
            </div>
            <div className="flex justify-between">
              <span>Worker Utilization:</span>
              <span className="font-medium">8/10</span>
            </div>
            <div className="flex justify-between">
              <span>Fairness:</span>
              <span className="font-medium">6/10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="border-b">
          <div className="flex">
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'sliders'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('sliders')}
            >
              Weight Sliders
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'ranking'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('ranking')}
            >
              Priority Ranking
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'presets'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('presets')}
            >
              Presets
            </button>
          </div>
        </div>

        <div className="flex space-x-2">
          <button onClick={handleSaveSettings} className="btn-primary flex items-center">
            <FiSave className="mr-2" /> Save Settings
          </button>
          <button onClick={handleExportData} className="btn-outline flex items-center">
            <FiDownload className="mr-2" /> Export All
          </button>
        </div>
      </div>

      {activeTab === 'sliders' && renderSliders()}
      {activeTab === 'ranking' && renderRanking()}
      {activeTab === 'presets' && renderPresets()}
    </div>
  )
}

export default PrioritySettings