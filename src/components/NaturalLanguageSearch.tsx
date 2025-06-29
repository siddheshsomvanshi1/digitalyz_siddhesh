import React, { useState } from 'react';
import { Client, Worker, Task } from '../types';
import { naturalLanguageSearch, simpleTextSearch } from '../utils/searchUtils';

interface NaturalLanguageSearchProps {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  onSearchResults: (entityType: string | null, results: any[]) => void;
}

const NaturalLanguageSearch: React.FC<NaturalLanguageSearchProps> = ({
  clients,
  workers,
  tasks,
  onSearchResults,
}) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'simple' | 'ai'>('simple');

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setError(null);

    if (searchMode === 'simple') {
      // Perform simple text search on all entities
      const clientResults = simpleTextSearch(query, clients);
      const workerResults = simpleTextSearch(query, workers);
      const taskResults = simpleTextSearch(query, tasks);

      // Determine which entity has the most matches
      const resultCounts = [
        { type: 'clients', count: clientResults.length },
        { type: 'workers', count: workerResults.length },
        { type: 'tasks', count: taskResults.length },
      ];

      resultCounts.sort((a, b) => b.count - a.count);

      // Return the entity with the most matches
      if (resultCounts[0].count > 0) {
        const entityType = resultCounts[0].type;
        let results;

        switch (entityType) {
          case 'clients':
            results = clientResults;
            break;
          case 'workers':
            results = workerResults;
            break;
          case 'tasks':
            results = taskResults;
            break;
          default:
            results = [];
        }

        onSearchResults(entityType, results);
      } else {
        onSearchResults(null, []);
        setError('No results found');
      }
    } else {
      // Perform AI-powered natural language search
      setIsProcessing(true);

      try {
        const result = await naturalLanguageSearch(query, clients, workers, tasks);

        if (result.error) {
          setError(result.error);
          onSearchResults(null, []);
        } else {
          onSearchResults(result.entityType, result.results);

          if (result.results.length === 0) {
            setError('No results found');
          }
        }
      } catch (err) {
        console.error('Error in natural language search:', err);
        setError('An error occurred while processing your search');
        onSearchResults(null, []);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full mb-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={searchMode === 'simple' ? 'Search...' : 'Try "Tasks with duration > 3 in Phase 2"...'}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isProcessing}
            />
            {isProcessing && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={isProcessing}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            Search
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="simple-search"
              name="search-mode"
              checked={searchMode === 'simple'}
              onChange={() => setSearchMode('simple')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="simple-search" className="text-sm text-gray-700">
              Simple Search
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="ai-search"
              name="search-mode"
              checked={searchMode === 'ai'}
              onChange={() => setSearchMode('ai')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="ai-search" className="text-sm text-gray-700">
              AI-Powered Natural Language Search
            </label>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {searchMode === 'ai' && (
          <div className="text-sm text-gray-600 mt-1">
            <p>
              <strong>Examples:</strong> "Clients with priority level greater than 3", "Workers with Python skills",
              "Tasks in phase 2 with duration less than 4"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NaturalLanguageSearch;