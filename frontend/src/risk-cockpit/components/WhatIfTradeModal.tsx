import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import * as theme from '../theme'

interface WhatIfTradeModalProps {
  open: boolean
  onClose: () => void
}

export function WhatIfTradeModal({ open, onClose }: WhatIfTradeModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          className="w-full max-w-md rounded-lg p-6"
          style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
        >
          <DialogTitle className="text-sm font-semibold tracking-wide uppercase" style={{ color: theme.textPrimary }}>
            What-If Trade
          </DialogTitle>
          <p className="mt-3 text-sm" style={{ color: theme.textSecondary }}>
            Incremental-CVaR simulation for a hypothetical trade isn't wired up yet — it needs a backend endpoint
            that can price a proposed position against the existing book and return ΔCVaR before the trade is
            booked. The Monte Carlo engine behind the headline CVaR/VaR tiles is the right place to add it.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 rounded-md px-3 py-1.5 text-sm font-medium"
            style={{ backgroundColor: theme.categorical.blue, color: '#ffffff' }}
          >
            Close
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
