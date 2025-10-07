import { Suspense } from 'react'
import ToolDetailClient from './tool-detail-client'

interface ToolDetailPageProps {
  params: Promise<{
    toolId: string
  }>
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { toolId } = await params
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ToolDetailClient toolId={toolId} />
    </Suspense>
  )
}
