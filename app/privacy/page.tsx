import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function PrivacyPage() {
  const sections = [
    { title: '1. Information We Collect', content: 'We collect information you provide directly: name, email, payment info, and booking details. We also automatically collect usage data, IP addresses, and browser type when you use our platform.' },
    { title: '2. How We Use Your Information', content: 'We use collected information to provide our services, process transactions, send booking confirmations, improve our AI matching algorithm, and communicate important updates about your bookings.' },
    { title: '3. AI Data Usage', content: 'Your search preferences and booking history are used exclusively to improve our AI matching powered by Anthropic Claude. This data is never sold to third parties. You can opt out of AI personalization in your account settings.' },
    { title: '4. Data Security', content: 'All data is encrypted at rest using AES-256 and in transit using TLS 1.3. Payment information is processed by Stripe and never stored on our servers. Data is stored on MongoDB Atlas with automated backups.' },
    { title: '5. Data Sharing', content: 'We do not sell, trade, or rent your personal information. We share data with landlords only to complete bookings, and with service providers (Stripe, MongoDB Atlas) who help operate our platform.' },
    { title: '6. Your Rights', content: 'You have the right to access, correct, or delete your personal information at any time from your profile page. Contact us at privacy@staynest.com for requests. We respond within 30 days.' },
    { title: '7. Cookies', content: 'We use cookies to maintain your session and improve user experience. You can disable cookies in your browser settings, though some features may not work correctly without them.' },
    { title: '8. Contact', content: 'Questions about this Privacy Policy? Contact us at privacy@staynest.com or call +120 455-7890. Office: 120 W West Floor Broad, Central, ON 82074.' },
  ]
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="bg-[#1e2a4a] py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
            <p className="text-white/60">Last updated: January 2025</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {sections.map(s => (
            <section key={s.title} className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{s.title}</h2>
              <p className="text-gray-600 leading-relaxed">{s.content}</p>
            </section>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
