"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
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
  const [activeId, setActiveId] = useState<string>("openai")
  const [protocols, setProtocols] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [errors, setErrors] = useState<{ name?: boolean; apiKey?: boolean; baseUrl?: boolean }>({})

  // 默认协议列表，确保弹窗有内容显示
  const defaultProtocols = ["OPENAI", "DASHSCOPE", "ZHIPU", "CUSTOM"]

  useEffect(() => {
    const onOpen = async () => {
      console.log('ProviderSettings: onOpen event received')
      setOpen(true)
      console.log('ProviderSettings: setOpen(true) called')
      try {
        console.log('ProviderSettings: Loading user providers...')
        const r = await fetch('/api/llm/providers/user', { cache: 'no-store' })
        const response = await r.json()
        console.log('ProviderSettings: User providers response:', response)
        
        // 处理不同的数据格式
        let list = response
        if (response && typeof response === 'object' && response.data) {
          list = response.data
        } else if (Array.isArray(response)) {
          list = response
        } else {
          list = []
        }
        
        console.log('ProviderSettings: Processed list:', list)
        
        if (Array.isArray(list)) {
          const mapped = list.map((srv: any) => ({
            id: String(srv.protocol || srv.id || srv.name),
            name: String(srv.name || srv.protocol || ''),
            kind: 'custom' as any,
            enabled: !!(srv.status ?? true),
            models: [],
            apiKey: srv.config?.apiKey || '',
            baseUrl: srv.config?.baseUrl || '',
            description: srv.description || '',
          }))
          console.log('ProviderSettings: Mapped providers:', mapped)
          setAllProviders(mapped as any)
        } else {
          console.log('ProviderSettings: No providers found, setting empty array')
          setAllProviders([])
        }
      } catch (error) {
        console.error('ProviderSettings: Failed to load providers:', error)
        setAllProviders([])
      }
    }
    
    console.log('ProviderSettings: Adding event listener')
    window.addEventListener("open-provider-settings", onOpen as any)
    
    return () => {
      console.log('ProviderSettings: Removing event listener')
      window.removeEventListener("open-provider-settings", onOpen as any)
    }
  }, [setAllProviders])

  // load provider protocols when dialog opens
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        console.log('Loading protocols...')
        const r = await fetch('/api/llm/providers/protocols', { cache: 'no-store' })
        const response = await r.json()
        console.log('Protocols result:', response)
        
        // 处理不同的数据格式
        let result = response
        if (response && typeof response === 'object' && response.data) {
          result = response.data
        } else if (Array.isArray(response)) {
          result = response
        } else {
          result = []
        }
        
        if (!cancelled && Array.isArray(result)) {
          setProtocols(result)
          console.log('Set protocols:', result)
        } else {
          // 如果API调用失败，使用默认协议列表
          console.log('Using default protocols due to API failure')
          setProtocols(defaultProtocols)
        }
      } catch (error) {
        console.error('Failed to load protocols:', error)
        // 如果API调用失败，使用默认协议列表
        if (!cancelled) {
          setProtocols(defaultProtocols)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()
    return () => { cancelled = true }
  }, [open])

  // Build tab providers purely from backend protocols to reflect real data order
  const tabProviders = useMemo(() => {
    console.log('Building tabProviders with protocols:', protocols, 'providers:', providers)
    // 如果协议列表为空，使用默认协议列表
    const protocolsToUse = protocols.length > 0 ? protocols : defaultProtocols
    console.log('Using protocols:', protocolsToUse)
    
    // Build purely from backend protocols. No mapping or seeded list.
    const result = protocolsToUse.map((proto) => {
      const id = String(proto)
      const existing = providers.find((p) => p.id.toLowerCase() === id.toLowerCase())
      return existing || { 
        id, 
        name: id, 
        kind: "custom" as any, 
        enabled: true, 
        models: [], 
        apiKey: "", 
        baseUrl: "",
        description: ""
      }
    })
    console.log('Built tabProviders:', result)
    return result
  }, [protocols, providers])

  // ensure active tab is valid when protocols change
  useEffect(() => {
    const list = tabProviders
    if (!list.length) return
    if (!list.some((p) => p.id === activeId)) {
      setActiveId(list[0].id)
    }
  }, [tabProviders, activeId])

  const active = useMemo(() => {
    const availableProviders = tabProviders.length > 0 ? tabProviders : providers
    const found = availableProviders.find((p) => p.id === activeId)
    if (found) return found
    
    // 如果没有找到activeId对应的provider，使用第一个可用的
    if (availableProviders.length > 0) {
      return availableProviders[0]
    }
    
    // 如果没有任何provider，创建一个默认的
    return {
      id: "openai",
      name: "OpenAI",
      kind: "custom" as any,
      enabled: true,
      models: [],
      apiKey: "",
      baseUrl: "",
      description: ""
    }
  }, [activeId, tabProviders, providers])

  function saveProvider(next: Partial<ProviderConfig>) {
    if (!active) return
    upsertProvider({ ...active, ...next })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>设置服务商</DialogTitle>
          <DialogDescription>
            在这里可以设置和管理您添加的LLM服务商。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-4">
              <div className="text-sm text-muted-foreground">正在加载协议列表...</div>
            </div>
          )}
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
                      value={active?.name || ""}
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
                      value={active?.apiKey || ""}
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
                      value={active?.baseUrl || ""}
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
                  <Textarea 
                    rows={5} 
                    value={active?.description || ""} 
                    onChange={(e) => saveProvider({ description: e.target.value })} 
                    placeholder="选填，例如 阿里云达摩盘" 
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    className="cursor-pointer"
                    checked={(active?.enabled ?? true)}
                    onCheckedChange={(v) => {
                      saveProvider({ enabled: v })
                      toast({ title: v ? "启用服务商" : "禁用服务商" })
                    }}
                  />
                  <span className="text-sm text-muted-foreground">{(active?.enabled ?? true) ? "启用服务商" : "禁用服务商"}</span>
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
                  description: p.description || "",
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
                  // 触发事件通知服务商页面刷新数据
                  window.dispatchEvent(new CustomEvent('provider-saved'))
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
    </>
  )
}


