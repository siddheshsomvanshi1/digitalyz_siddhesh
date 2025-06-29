import React from 'react';
import { Client, Worker, Task } from '../types';

interface SearchResultsProps {
  entityType: string | null;
  results: any[];
  onClearResults: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ entityType, results, onClearResults }) => {
  if (!entityType || results.length === 0) {
    return null;
  }

  const renderClientResults = (clients: Client[]) => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Tasks</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Tag</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {clients.map((client) => (
          <tr key={client.ClientID}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.ClientID}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.ClientName}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.PriorityLevel}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {Array.isArray(client.RequestedTaskIDs) 
                ? client.RequestedTaskIDs.join(', ') 
                : client.RequestedTaskIDs}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.GroupTag}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderWorkerResults = (workers: Worker[]) => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker ID</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Slots</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Load</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker Group</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {workers.map((worker) => (
          <tr key={worker.WorkerID}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{worker.WorkerID}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {Array.isArray(worker.Skills) ? worker.Skills.join(', ') : worker.Skills}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {Array.isArray(worker.AvailableSlots) ? worker.AvailableSlots.join(', ') : worker.AvailableSlots}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{worker.MaxLoadPerPhase}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{worker.WorkerGroup}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{worker.QualificationLevel}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderTaskResults = (tasks: Task[]) => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task ID</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Skills</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferred Phases</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Concurrent</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {tasks.map((task) => (
          <tr key={task.TaskID}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.TaskID}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.Duration}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {Array.isArray(task.RequiredSkills) ? task.RequiredSkills.join(', ') : task.RequiredSkills}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {Array.isArray(task.PreferredPhases) ? task.PreferredPhases.join(', ') : task.PreferredPhases}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.MaxConcurrent}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="mt-4 bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Search Results ({results.length} {entityType})
        </h3>
        <button
          onClick={onClearResults}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          Clear Results
        </button>
      </div>
      <div className="border-t border-gray-200 overflow-x-auto">
        {entityType === 'clients' && renderClientResults(results as Client[])}
        {entityType === 'workers' && renderWorkerResults(results as Worker[])}
        {entityType === 'tasks' && renderTaskResults(results as Task[])}
      </div>
    </div>
  );
};

export default SearchResults;