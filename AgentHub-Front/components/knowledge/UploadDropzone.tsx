"use client"

import { useRef, useState } from "react"
import { useKbStore } from "@/lib/knowledge"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileText, FileUp } from "lucide-react"

export function UploadDropzone() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const uploadFiles = useKbStore((s) => s.uploadFiles)

  const onFiles = async (files: File[] | FileList) => {
    await uploadFiles(files)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const files = Array.from(e.dataTransfer.files)
        if (files.length) onFiles(files)
      }}
      className={
        "relative rounded-md border p-6 flex flex-col items-center justify-center text-center gap-3 " +
        (dragOver ? "bg-muted/60 border-primary/50" : "bg-muted/30")
      }
    >
      <UploadCloud className="w-8 h-8 text-muted-foreground" />
      <div className="text-sm text-muted-foreground">
        拖拽文件到此处，或
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mx-1 text-primary underline underline-offset-4"
        >
          点击选择
        </button>
      </div>
      <div className="text-xs text-muted-foreground">
        支持 .txt / .md / .pdf / .docx 等常见格式，单个文件 ≤ 20MB
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <FileUp className="w-4 h-4 mr-2" /> 选择文件
        </Button>
        <Button variant="ghost" size="sm" onClick={() => demoSeed(onFiles)}>
          <FileText className="w-4 h-4 mr-2" /> 添加示例
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        accept=".txt,.md,.pdf,.doc,.docx,.json,.csv"
        onChange={(e) => {
          const files = e.currentTarget.files
          if (files?.length) onFiles(files)
          e.currentTarget.value = ""
        }}
      />
    </div>
  )
}

async function demoSeed(cb: (files: File[]) => void | Promise<void>) {
  const demo = `# RAG 平台用户手册\n\n本手册介绍如何上传文档、实时查看处理进度以及预览拆分片段。\n\n## 上传流程\n1. 选择文件\n2. 自动拆分\n3. 构建索引\n\n## 最佳实践\n- 优先上传结构化文本\n- 合理设置切片策略\n- 及时发布知识库共享给他人`
  const file = new File([demo], "RAG-用户手册.md", { type: "text/markdown" })
  await cb([file])
}

