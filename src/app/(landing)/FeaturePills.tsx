const pills = [
  { emoji: '💬', label: 'Cancel Flows' },
  { emoji: '🎯', label: 'Adaptive Offers' },
  { emoji: '💳', label: 'Payment Recovery' },
  { emoji: '⏸', label: 'Pause Subscriptions' },
  { emoji: '📊', label: 'Recovery Analytics' },
  { emoji: '⚡', label: '60-Second Setup' },
]

export function FeaturePills() {
  return (
    <div className="bg-gray-50 border-t border-b border-gray-100 py-5 px-6" role="list" aria-label="Feature highlights">
      <div className="mx-auto max-w-7xl">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {pills.map((pill) => (
            <div
              key={pill.label}
              role="listitem"
              className="flex items-center gap-2.5 flex-shrink-0 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 whitespace-nowrap hover:border-green-300 hover:text-gray-900 transition-all duration-200 cursor-default shadow-sm"
            >
              <span>{pill.emoji}</span>
              <span className="font-medium">{pill.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
