"use client"
import type { Tool } from "../types/chat"

interface ToolSelectorProps {
  selectedTool: string
  tools: Tool[]
  onToolChange: (toolId: string) => void
}

export function ToolSelector({ selectedTool, tools, onToolChange }: ToolSelectorProps) {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tools</label>
      <select
        value={selectedTool}
        onChange={(e) => onToolChange(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      >
        {tools.map((tool) => (
          <option key={tool.id} value={tool.id}>
            {tool.name}
          </option>
        ))}
      </select>
    </div>
  )
}
