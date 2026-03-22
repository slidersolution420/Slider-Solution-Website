// Root layout — minimal wrapper required by Next.js App Router.
// Locale-specific layout lives at [locale]/layout.tsx.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
