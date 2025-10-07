import { Suspense } from 'react'
import MarketplaceClient from './marketplace-client'

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MarketplaceClient />
    </Suspense>
  )
}
