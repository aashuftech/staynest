import Link from 'next/link'
import { Home, MapPin, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#1e2a4a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-950/30">
                <Home size={20} strokeWidth={2.5} />
                <MapPin size={9} strokeWidth={3} className="absolute bottom-1.5 right-1.5 text-blue-100" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">StayNest</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">AI-powered apartment finder with verified listings and secure payments worldwide.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[['/', 'Home'],['/apartments','Browse Apartments'],['/about','About Us'],['/contact','Contact'],['/dashboard','My Dashboard']].map(([href, label]) => (
                <li key={href}><Link href={href} className="text-white/60 hover:text-white text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Property Types</h4>
            <ul className="space-y-2">
              {['Flats','Houses','Studios','Condos','Townhouses','Villas'].map(t => (
                <li key={t}><Link href={`/apartments?type=${t.slice(0,-1).toUpperCase()}`} className="text-white/60 hover:text-white text-sm transition-colors">{t}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/60 text-sm"><MapPin size={14} className="mt-0.5 text-blue-400 shrink-0" />Sec 21 Oxford Tower Rohtak 124001</li>
              <li className="flex items-center gap-2 text-sm"><Mail size={14} className="text-blue-400" /><a href="mailto:westaynest@gmail.com" className="text-white/60 hover:text-white transition-colors">westaynest@gmail.com</a></li>
              <li className="flex items-center gap-2 text-sm"><Phone size={14} className="text-blue-400" /><a href="tel:+1204557890" className="text-white/60 hover:text-white transition-colors">+120 455-7890</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">© {new Date().getFullYear()} StayNest. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-white/40 hover:text-white text-sm transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white/40 hover:text-white text-sm transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
