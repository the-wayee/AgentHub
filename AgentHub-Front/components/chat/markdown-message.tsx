"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { cn } from "@/lib/utils"

interface MarkdownMessageProps {
  content: string
  className?: string
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div className={cn("markdown-content max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // 自定义代码块样式
          code({ node, inline: isInline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            return !isInline && match ? (
              <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            )
          },
          // 自定义链接样式
          a({ node, children, ...props }) {
            return (
              <a
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            )
          },
          // 自定义表格样式
          table({ node, ...props }) {
            return (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse" {...props} />
              </div>
            )
          },
          // 自定义表格单元格样式
          th({ node, ...props }) {
            return (
              <th className="border border-border px-3 py-2 text-left font-semibold bg-muted" {...props} />
            )
          },
          td({ node, ...props }) {
            return (
              <td className="border border-border px-3 py-2" {...props} />
            )
          },
          // 自定义列表样式
          ul({ node, ...props }) {
            return (
              <ul className="list-disc list-inside space-y-1 my-2" {...props} />
            )
          },
          ol({ node, ...props }) {
            return (
              <ol className="list-decimal list-inside space-y-1 my-2" {...props} />
            )
          },
          // 自定义引用样式
          blockquote({ node, ...props }) {
            return (
              <blockquote className="border-l-4 border-border pl-4 italic my-2" {...props} />
            )
          },
          // 自定义标题样式
          h1({ node, ...props }) {
            return (
              <h1 className="text-lg font-semibold mt-4 mb-2" {...props} />
            )
          },
          h2({ node, ...props }) {
            return (
              <h2 className="text-base font-semibold mt-3 mb-2" {...props} />
            )
          },
          h3({ node, ...props }) {
            return (
              <h3 className="text-sm font-semibold mt-2 mb-1" {...props} />
            )
          },
          h4({ node, ...props }) {
            return (
              <h4 className="text-sm font-semibold mt-1 mb-1" {...props} />
            )
          },
          h5({ node, ...props }) {
            return (
              <h5 className="text-sm font-semibold mt-1 mb-1" {...props} />
            )
          },
          h6({ node, ...props }) {
            return (
              <h6 className="text-sm font-semibold mt-1 mb-1" {...props} />
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}