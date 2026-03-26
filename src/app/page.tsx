import { notFound } from 'next/navigation'

// The middleware handles locale routing for '/'.
// This page is a fallback that should never be reached in normal operation.
export default function RootPage() {
  notFound()
}
