import Link from "next/link"
import { redirect } from "next/navigation"

export default function Page() {
  // Send users to the demo agent chat on first load
  redirect("/chat/demo")
  return (
    <main className="p-6">
      <div className="text-center">Redirecting…</div>
      <Link href="/chat/demo" className="underline">
        Go to chat
      </Link>
    </main>
  )
}
