import { useShippingBillStats } from '@/hooks/use-shipping-bill-stats'
import { ShippingBillFormValues } from '@/shipping-bills/model'

export interface BillSummaryBarProps {
  values: ShippingBillFormValues
}

/**
 * Live Quick Stats Bar
 * Displays active shipment totals, currency subtotals, item counts,
 * and immediate domain validation feedback (e.g. weight disparity).
 */
export function BillSummaryBar({ values }: BillSummaryBarProps) {
  const stats = useShippingBillStats(values)

  const currencyKeys = Object.keys(stats.currencyTotals)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-500">Invoices:</span>
            <span className="font-bold text-gray-900">{stats.totalInvoices}</span>
          </div>

          <div className="h-4 w-px bg-gray-200" />

          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-500">Goods Items:</span>
            <span className="font-bold text-gray-900">{stats.totalItems}</span>
          </div>

          <div className="h-4 w-px bg-gray-200" />

          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-500">Containers:</span>
            <span className="font-bold text-gray-900">{stats.totalContainers}</span>
          </div>

          <div className="h-4 w-px bg-gray-200" />

          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-500">Documents:</span>
            <span className="font-bold text-gray-900">{stats.totalDocuments}</span>
          </div>
        </div>

        {/* Currency Values */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Declared Value:</span>
          {currencyKeys.length === 0 ? (
            <span className="text-sm font-bold text-gray-400">0.00</span>
          ) : (
            currencyKeys.map((curr) => (
              <span
                key={curr}
                className="bg-primary-50 text-primary-900 border-primary-200/60 rounded-md border px-2.5 py-1 text-xs font-bold shadow-2xs sm:text-sm">
                {curr}{' '}
                {stats.currencyTotals[curr].toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Domain Validation Feedback Alerts */}
      {stats.hasErrors && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          <div className="flex items-center gap-2 font-semibold">
            <span>⚠ Domain Validation Notice:</span>
          </div>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {stats.issues
              .filter((i) => i.type === 'error')
              .map((issue, idx) => (
                <li key={idx}>{issue.message}</li>
              ))}
          </ul>
        </div>
      )}

      {stats.hasWarnings && !stats.hasErrors && (
        <div className="rounded-md border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-800">
          <ul className="list-inside list-disc space-y-0.5">
            {stats.issues
              .filter((i) => i.type === 'warning')
              .map((issue, idx) => (
                <li key={idx}>{issue.message}</li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}
