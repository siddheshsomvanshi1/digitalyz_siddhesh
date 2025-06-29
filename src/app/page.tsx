'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import FileUpload from '@/components/FileUpload'
import DataDisplay from '@/components/DataDisplay'
import ValidationPanel from '@/components/ValidationPanel'
import RuleCreation from '@/components/RuleCreation'
import PrioritySettings from '@/components/PrioritySettings'
import NaturalLanguageSearch from '@/components/NaturalLanguageSearch'
import SearchResults from '@/components/SearchResults'
import { Client, Worker, Task, DataEntity, ValidationError } from '@/types'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'validate' | 'rules' | 'priority'>('upload')
  const [data, setData] = useState<{
    clients: Client[];
    workers: Worker[];
    tasks: Task[];
  } | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [rules, setRules] = useState<any[]>([])
  const [prioritySettings, setPrioritySettings] = useState<any>({})
  const [searchResults, setSearchResults] = useState<{entityType: string | null; results: any[]}>({entityType: null, results: []})

  const handleSearchResults = (entityType: string | null, results: any[]) => {
    setSearchResults({ entityType, results });
  };

  const clearSearchResults = () => {
    setSearchResults({ entityType: null, results: [] });
  };

  return (
    <div className="flex flex-col gap-8">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      {data && (
        <section className="rounded-xl bg-gradient-to-r from-blue-100 to-purple-50 p-6 shadow mb-4">
          <NaturalLanguageSearch 
            clients={data.clients} 
            workers={data.workers} 
            tasks={data.tasks} 
            onSearchResults={handleSearchResults} 
          />
          <SearchResults 
            entityType={searchResults.entityType} 
            results={searchResults.results} 
            onClearResults={clearSearchResults} 
          />
        </section>
      )}
      <section className="mt-4">
        {activeTab === 'upload' && (
          <div className="space-y-8">
            <FileUpload setData={setData} />
            {data && <DataDisplay data={data} setData={setData} />}
          </div>
        )}
        {activeTab === 'validate' && (
          <ValidationPanel 
            data={data} 
            validationErrors={validationErrors} 
            setValidationErrors={setValidationErrors} 
          />
        )}
        {activeTab === 'rules' && (
          <RuleCreation 
            data={data} 
            rules={rules} 
            setRules={setRules} 
          />
        )}
        {activeTab === 'priority' && (
          <PrioritySettings 
            data={data} 
            prioritySettings={prioritySettings} 
            setPrioritySettings={setPrioritySettings} 
            rules={rules}
          />
        )}
      </section>
    </div>
  )
}