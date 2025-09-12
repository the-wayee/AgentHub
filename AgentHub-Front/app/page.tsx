import { redirect } from "next/navigation"

export default function Page() {
  // Send users to the demo agent chat on first load
  redirect("/chat/demo")
}
