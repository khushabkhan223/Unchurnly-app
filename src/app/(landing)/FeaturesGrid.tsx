import {
  RefreshCw,
  GitBranch,
  PauseCircle,
  Tag,
  Plug,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

type Feature = {
  Icon: LucideIcon
  title: string
  description: string
}

const features: Feature[] = [
  {
    Icon: RefreshCw,
    title: 'Failed Payment Recovery',
    description: 'Smart retry emails at exactly the right time.',
  },
  {
    Icon: GitBranch,
    title: 'Cancel Flow Builder',
    description: 'Personalized offers before they leave.',
  },
  {
    Icon: PauseCircle,
    title: 'Pause Subscriptions',
    description: "Let customers pause instead of cancelling.",
  },
  {
    Icon: Tag,
    title: 'Discount Offers',
    description: 'Automatically offer a discount to at-risk customers.',
  },
  {
    Icon: Plug,
    title: 'Stripe Native',
    description: 'Connects in 60 seconds via OAuth. No engineers required.',
  },
  {
    Icon: TrendingUp,
    title: 'Recovery Analytics',
    description: "See exactly how much MRR you've recovered.",
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 px-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <p className="text-green-600 text-sm font-semibold tracking-widest uppercase text-center mb-4">
          MORE FEATURES
        </p>

        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 text-center mb-2">
          Everything else you need, included.
        </h2>

        <p className="text-gray-500 text-center mb-10">
          All features in every plan. No feature gating.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:border-green-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center mb-4">
                <Icon size={16} className="text-green-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
