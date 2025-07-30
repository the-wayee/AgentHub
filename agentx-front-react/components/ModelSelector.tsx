"use client"
import type { Model } from "../types/chat"
import { Select, Tag } from 'antd'

interface ModelSelectorProps {
  selectedModel: string
  models: Model[]
  onModelChange: (modelId: string) => void
}

export function ModelSelector({ selectedModel, models, onModelChange }: ModelSelectorProps) {
  return (
    <Select
      value={selectedModel}
      onChange={onModelChange}
      style={{ minWidth: 140, borderRadius: 12, background: 'linear-gradient(90deg, #e0e7ff 0%, #fce7f3 100%)' }}
      styles={{ popup: { root: { borderRadius: 12 } } }}
      optionLabelProp="label"
    >
      {models.map(model => (
        <Select.Option key={model.id} value={model.id} label={model.name}>
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-700">{model.name}</span>
            <Tag color="blue" className="ml-2">{model.provider}</Tag>
          </div>
        </Select.Option>
      ))}
    </Select>
  )
}
