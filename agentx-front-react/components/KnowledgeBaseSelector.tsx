"use client"
import type { KnowledgeBase } from "../types/chat"
import { Select } from 'antd'

interface KnowledgeBaseSelectorProps {
  selectedKnowledgeBase: string
  knowledgeBases: KnowledgeBase[]
  onKnowledgeBaseChange: (kbId: string) => void
}

export function KnowledgeBaseSelector({ selectedKnowledgeBase, knowledgeBases, onKnowledgeBaseChange }: KnowledgeBaseSelectorProps) {
  return (
    <Select
      value={selectedKnowledgeBase}
      onChange={onKnowledgeBaseChange}
      style={{ minWidth: 160, borderRadius: 12, background: 'linear-gradient(90deg, #f0fdf4 0%, #f3e8ff 100%)' }}
      styles={{ popup: { root: { borderRadius: 12 } } }}
      optionLabelProp="label"
    >
      {knowledgeBases.map(kb => (
        <Select.Option key={kb.id} value={kb.id} label={kb.name}>
          <div className="flex flex-col">
            <span className="font-bold text-purple-700">{kb.name}</span>
            <span className="text-xs text-gray-500">{kb.description}</span>
          </div>
        </Select.Option>
      ))}
    </Select>
  )
}
