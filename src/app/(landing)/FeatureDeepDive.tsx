import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

type FeatureDeepDiveProps = {
  eyebrow: string
  headline: string
  body: string
  bullets: string[]
  stat: string
  statLabel: string
  mockup: ReactNode
  reversed?: boolean
  sectionClassName?: string
}

export function FeatureDeepDive({
  eyebrow,
  headline,
  body,
  bullets,
  stat,
  statLabel,
  mockup,
  reversed = false,
  sectionClassName = 'bg-white',
}: FeatureDeepDiveProps) {
  return (
    <section className={`py-24 px-6 ${sectionClassName}`}>
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className={reversed ? 'lg:order-last' : ''}>
            <p className="text-green-600 text-xs font-semibold tracking-widest uppercase mb-3">
              {eyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 leading-tight mb-4">
              {headline}
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">{body}</p>
            <ul className="space-y-2.5 mb-8">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <Check size={14} className="text-green-600 mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="pt-6 border-t border-gray-100">
              <span className="text-4xl font-black text-gray-900">{stat}</span>
              <span className="text-gray-400 text-sm ml-2">{statLabel}</span>
            </div>
          </div>

          <div className={reversed ? 'lg:order-first' : ''}>
            <div className="relative bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-xl shadow-gray-200/40">
              <div className="flex gap-1.5 mb-4 px-1">
                <div className="w-3 h-3 rounded-full bg-red-300/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-300/70" />
                <div className="w-3 h-3 rounded-full bg-green-300/70" />
              </div>
              <div className="rounded-xl overflow-hidden">
                {mockup}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
