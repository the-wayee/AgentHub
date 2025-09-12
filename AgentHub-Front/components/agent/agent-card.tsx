import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Agent } from "@/lib/types"

export function AgentCard({ agent }: { agent: Agent }) {
  const typeLabel = agent.type === "function" ? "功能" : "聊天"
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{agent.name}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{typeLabel}</Badge>
            <Badge variant="secondary">v{agent.version}</Badge>
          </div>
        </CardTitle>
        <div className="text-xs text-muted-foreground truncate">{agent.description}</div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground line-clamp-3">
        {agent.tags?.map((t) => (
          <Badge key={t} className="mr-1 mb-1" variant="outline">
            {t}
          </Badge>
        ))}
      </CardContent>
      <CardFooter className="mt-auto flex gap-2">
        <Button asChild variant="secondary" className="flex-1">
          <Link href={`/chat/${agent.id}`} prefetch={false}>试用</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/studio" prefetch={false}>克隆编辑</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
