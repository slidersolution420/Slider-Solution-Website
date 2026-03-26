import { redirect } from 'next/navigation'

// Root route redirects to default locale (Hebrew)
export default function RootPage() {
  redirect('/')
}
