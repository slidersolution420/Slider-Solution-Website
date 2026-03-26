import Footer from '@/components/ui/Footer'

interface ContactLayoutProps {
  children: React.ReactNode
}

export default function ContactLayout({ children }: ContactLayoutProps) {
  return (
    <>
      {children}
      <Footer />
    </>
  )
}
