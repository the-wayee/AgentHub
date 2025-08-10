"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWorkspaceStore } from "@/lib/stores"
import { Briefcase } from "lucide-react"

export function WorkspaceSwitcher() {
  const { workspaces, selectedId, setSelected } = useWorkspaceStore()
  return (
    <div className="flex items-center gap-2">
      <Briefcase className="w-4 h-4 text-muted-foreground" />
      <Select value={selectedId} onValueChange={(v) => setSelected(v)}>
        <SelectTrigger className="h-8 w-full">
          <SelectValue placeholder="选择工作区" />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((w) => (
            <SelectItem key={w.id} value={w.id}>
              {w.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
