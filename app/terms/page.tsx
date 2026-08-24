import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function TermsPage() {
  const sections = [
    { title: '1. Acceptance of Terms', content: 'By accessing and using StayNest, you accept and agree to be bound by these terms. If you do not agree, please do not use our service.' },
    { title: '2. Use of Service', content: 'StayNest provides a platform to search, discover, and book apartments. You agree to use the service only for lawful purposes and are responsible for maintaining the confidentiality of your account credentials.' },
    { title: '3. Booking and Payments', content: 'All bookings are subject to availability and landlord confirmation. Payment is processed securely through Stripe. By booking, you authorize us to charge the total amount to your selected payment method. All prices are in USD.' },
    { title: '4. Cancellation Policy', content: 'Cancellations made more than 48 hours before check-in are eligible for a full refund. Cancellations within 48 hours may incur a fee up to one night rent. Refunds are processed within 5-7 business days.' },
    { title: '5. Property Listings', content: 'StayNest verifies listings but cannot guarantee 100% accuracy of all information. Landlords are responsible for maintaining accurate listing information. We reserve the right to remove listings that violate our policies.' },
    { title: '6. AI Matching', content: 'Our AI matching service powered by Anthropic Claude provides recommendations only — not guarantees of suitability. The final decision to book any property rests solely with the user.' },
    { title: '7. Intellectual Property', content: 'The StayNest platform, design, features, and content are owned by StayNest and protected by intellectual property laws. You may not copy or distribute any part without written consent.' },
    { title: '8. Limitation of Liability', content: 'StayNest shall not be liable for any indirect or consequential damages. Our total liability shall not exceed the amount paid by you in the three months preceding the claim.' },
    { title: '9. Contact', content: 'Questions about these Terms? Contact us at legal@staynest.com or +120 455-7890.' },
  ]
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="bg-[#1e2a4a] py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
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
