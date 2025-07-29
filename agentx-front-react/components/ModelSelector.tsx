"use client"
import type { Model } from "../types/chat"

interface ModelSelectorProps {
  selectedModel: string
  models: Model[]
  onModelChange: (modelId: string) => void
}

export function ModelSelector({ selectedModel, models, onModelChange }: ModelSelectorProps) {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} ({model.provider})
          </option>
        ))}
      </select>
    </div>
  )
}
