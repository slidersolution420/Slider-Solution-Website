import { redirect } from 'next/navigation'

// Root path — redirect to default locale.
// Middleware handles this at the edge, but this page acts as a fallback.
export default function RootPage() {
  redirect('/en')
}
