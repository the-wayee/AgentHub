"use client"
import type { Tool } from "../types/chat"
import { Select } from 'antd'

interface ToolSelectorProps {
  selectedTool: string
  tools: Tool[]
  onToolChange: (toolId: string) => void
}

export function ToolSelector({ selectedTool, tools, onToolChange }: ToolSelectorProps) {
  return (
    <Select
      value={selectedTool}
      onChange={onToolChange}
      style={{ minWidth: 140, borderRadius: 12, background: 'linear-gradient(90deg, #e0f2fe 0%, #f0fdf4 100%)' }}
      styles={{ popup: { root: { borderRadius: 12 } } }}
      optionLabelProp="label"
    >
      {tools.map(tool => (
        <Select.Option key={tool.id} value={tool.id} label={tool.name}>
          <div className="flex flex-col">
            <span className="font-bold text-green-700">{tool.name}</span>
            <span className="text-xs text-gray-500">{tool.description}</span>
          </div>
        </Select.Option>
      ))}
    </Select>
  )
}
