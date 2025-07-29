"use client"
import type { KnowledgeBase } from "../types/chat"

interface KnowledgeBaseSelectorProps {
  selectedKnowledgeBase: string
  knowledgeBases: KnowledgeBase[]
  onKnowledgeBaseChange: (kbId: string) => void
}

export function KnowledgeBaseSelector({
  selectedKnowledgeBase,
  knowledgeBases,
  onKnowledgeBaseChange,
}: KnowledgeBaseSelectorProps) {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Knowledge Base</label>
      <select
        value={selectedKnowledgeBase}
        onChange={(e) => onKnowledgeBaseChange(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      >
        {knowledgeBases.map((kb) => (
          <option key={kb.id} value={kb.id}>
            {kb.name}
          </option>
        ))}
      </select>
    </div>
  )
}
