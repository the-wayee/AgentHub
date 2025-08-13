"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProviderStore, type ProviderConfig } from "@/lib/stores"
import { useToast } from "@/hooks/use-toast"
// no extra tag badges

export function ProviderSettings() {
  const { providers, upsertProvider, setAllProviders } = useProviderStore()
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>(providers[0]?.id || "openai")
  const [protocols, setProtocols] = useState<string[]>([])
  const { toast } = useToast()
  const [errors, setErrors] = useState<{ name?: boolean; apiKey?: boolean; baseUrl?: boolean }>({})

  useEffect(() => {
    const onOpen = async () => {
      setOpen(true)
      try {
        const r = await fetch('/api/llm/providers/user', { cache: 'no-store' })
        const list = await r.json()
        if (Array.isArray(list)) {
          const mapped = list.map((srv: any) => ({
            id: String(srv.protocol || srv.id || srv.name),
            name: String(srv.name || srv.protocol || ''),
            kind: 'custom' as any,
            enabled: !!(srv.status ?? true),
            models: [],
            apiKey: srv.config?.apiKey || '',
            baseUrl: srv.config?.baseUrl || '',
            ...(srv.description ? { description: srv.description } : {}),
          }))
          setAllProviders(mapped as any)
        } else {
          setAllProviders([])
        }
      } catch {
        setAllProviders([])
      }
    }
    window.addEventListener("open-provider-settings", onOpen as any)
    return () => window.removeEventListener("open-provider-settings", onOpen as any)
  }, [upsertProvider])

  // load provider protocols when dialog opens
  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/llm/providers/protocols', { cache: 'no-store' })
        const list = await r.json()
        if (!cancelled && Array.isArray(list)) setProtocols(list)
      } catch {}
    })()
    return () => { cancelled = true }
  }, [open])

  // Build tab providers purely from backend protocols to reflect real data order
  const tabProviders = useMemo(() => {
    // Build purely from backend protocols. No mapping or seeded list.
    return protocols.map((proto) => {
      const id = String(proto)
      const existing = providers.find((p) => p.id.toLowerCase() === id.toLowerCase())
      return existing || { id, name: id, kind: "custom" as any, enabled: true, models: [], apiKey: "", baseUrl: "" }
    })
  }, [protocols, providers])

  // ensure active tab is valid when protocols change
  useEffect(() => {
    const list = tabProviders
    if (!list.length) return
    if (!list.some((p) => p.id === activeId)) {
      setActiveId(list[0].id)
    }
  }, [tabProviders, activeId])

  const active = useMemo(() => (tabProviders.length ? tabProviders : providers).find((p) => p.id === activeId) || (tabProviders[0] || providers[0]), [activeId, tabProviders, providers])

  function saveProvider(next: Partial<ProviderConfig>) {
    if (!active) return
    upsertProvider({ ...active, ...next })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>设置服务商</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Tabs value={active?.id} onValueChange={setActiveId}>
            <TabsList className="flex flex-wrap gap-2 cursor-pointer">
              {tabProviders.map((p) => (
                <TabsTrigger key={p.id} value={p.id} className="whitespace-nowrap cursor-pointer">
                  {p.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabProviders.map((p) => (
              <TabsContent key={p.id} value={p.id} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>显示名称</Label>
                    <Input
                      value={p.name || ""}
                      onChange={(e) => {
                        setErrors((er) => ({ ...er, name: false }))
                        saveProvider({ name: e.target.value })
                      }}
                      placeholder="必填，例如 aliyun"
                      aria-invalid={errors.name ? true : undefined}
                      className={errors.name ? "border-destructive focus-visible:ring-destructive" : undefined}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      value={p.apiKey || ""}
                      onChange={(e) => {
                        setErrors((er) => ({ ...er, apiKey: false }))
                        saveProvider({ apiKey: e.target.value })
                      }}
                      placeholder="sk-..."
                      aria-invalid={errors.apiKey ? true : undefined}
                      className={errors.apiKey ? "border-destructive focus-visible:ring-destructive" : undefined}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Base URL</Label>
                    <Input
                      value={p.baseUrl || ""}
                      onChange={(e) => {
                        setErrors((er) => ({ ...er, baseUrl: false }))
                        saveProvider({ baseUrl: e.target.value })
                      }}
                      placeholder="https://api.example.com"
                      aria-invalid={errors.baseUrl ? true : undefined}
                      className={errors.baseUrl ? "border-destructive focus-visible:ring-destructive" : undefined}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>描述</Label>
                  <Textarea rows={5} value={(p as any).description || ""} onChange={(e) => saveProvider({ description: e.target.value } as any)} placeholder="选填，例如 阿里云达摩盘" />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    className="cursor-pointer"
                    checked={(p.enabled ?? true)}
                    onCheckedChange={(v) => {
                      saveProvider({ enabled: v })
                      toast({ title: v ? "启用服务商" : "禁用服务商" })
                    }}
                  />
                  <span className="text-sm text-muted-foreground">{(p.enabled ?? true) ? "启用服务商" : "禁用服务商"}</span>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" className="cursor-pointer" onClick={() => setOpen(false)}>关闭</Button>
            <Button
              className="cursor-pointer"
              onClick={async () => {
                const p = active
                if (!p) return
                const missing = {
                  name: !p.name || !p.name.trim(),
                  apiKey: !p.apiKey || !p.apiKey.trim(),
                  baseUrl: !p.baseUrl || !p.baseUrl.trim(),
                }
                if (missing.name || missing.apiKey || missing.baseUrl) {
                  setErrors(missing)
                  toast({ title: "请完善必填项", description: `${missing.name ? "名称、" : ""}${missing.apiKey ? "API Key、" : ""}${missing.baseUrl ? "Base URL" : ""}`.replace(/、$/, "") })
                  return
                }
                const payload = {
                  protocol: p.id,
                  name: p.name.trim(),
                  description: (p as any).description || "",
                  config: { apiKey: p.apiKey || "", baseUrl: p.baseUrl || "" },
                  status: p.enabled ?? true,
                }
                const r = await fetch('/api/llm/providers', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                })
                if (r.ok) {
                  toast({ title: "已保存服务商" })
                  setOpen(false)
                } else {
                  toast({ title: "保存失败", description: "请稍后再试" })
                }
              }}
            >
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


