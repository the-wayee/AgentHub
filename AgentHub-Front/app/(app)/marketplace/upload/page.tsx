import { Suspense } from 'react'
import UploadToolClient from './upload-tool-client' 

export default function UploadToolPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UploadToolClient />
    </Suspense>
  )
}
