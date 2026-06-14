const stats = [
  { value: '70%', label: 'recovery rate' },
  { value: '15 min', label: 'setup time' },
  { value: '$49/mo', label: 'flat price, always' },
]

export default function SocialProofBar() {
  return (
    <div className="bg-gray-50 border-y border-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center gap-6">
        <p className="text-sm text-gray-400 tracking-wide">
          Protecting MRR for indie founders worldwide
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-14">
          {stats.map(({ value, label }) => (
            <div key={value} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-gray-900">{value}</span>
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
