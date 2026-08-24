type DashboardHeroProps = {
  eyebrow: string
  title: string
  description: string
}

export default function DashboardHero({ eyebrow, title, description }: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#0e0d0b] px-4 pb-10 pt-28 sm:px-6 sm:pt-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,138,67,.28),transparent_44%)]" />
      <div className="relative mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9ab59]">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-light text-white sm:text-5xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#d2c8b8]">{description}</p>
      </div>
    </section>
  )
}
