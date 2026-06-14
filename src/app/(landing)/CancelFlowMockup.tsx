import { PauseCircle, ArrowDown, X } from 'lucide-react'

export function CancelFlowMockup() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 relative shadow-xl shadow-gray-200/60">
        <button type="button" className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <X size={13} />
        </button>

        <div className="mb-5">
          <h3 className="text-gray-900 font-semibold text-lg mb-1">Wait — before you go 👋</h3>
          <p className="text-gray-500 text-sm">We hate to see you leave. Can we offer you this?</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-base flex-shrink-0">
            🎯
          </div>
          <div>
            <p className="text-gray-900 text-sm font-semibold">Get 30% off for 3 months</p>
            <p className="text-gray-500 text-xs mt-0.5">Applied automatically — no code needed</p>
          </div>
        </div>

        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Or choose another option:</p>

        <div className="flex flex-col gap-2 mb-5">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-pointer hover:border-gray-300 transition-colors">
            <PauseCircle size={14} className="text-gray-400" />
            <span>Pause my subscription</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-pointer hover:border-gray-300 transition-colors">
            <ArrowDown size={14} className="text-gray-400" />
            <span>Downgrade my plan</span>
          </div>
        </div>

        <button type="button" className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(22,163,74,0.2)] mb-2">
          Claim 30% Discount
        </button>
        <p className="w-full py-1.5 text-gray-400 text-xs text-center cursor-pointer hover:text-gray-600 transition-colors">
          No thanks, cancel anyway
        </p>
      </div>
    </div>
  )
}
