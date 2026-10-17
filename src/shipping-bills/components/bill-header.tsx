import { routes } from '@/shared/route-paths'
import { SavedBill } from '@/shipping-bills/model'
import { workflowSteps } from '@/shipping-bills/workflow'
import { navigate } from 'core/routing'
import { Badge } from 'ui/basic/badge'
import { Button } from 'ui/basic/button'

export interface BillHeaderProps {
  bill?: SavedBill
  draftId?: number
  isSaving?: boolean
}

/**
 * Top header containing breadcrumbs, document status badge, and workflow stepper.
 */
export function BillHeader({ bill, draftId, isSaving = false }: BillHeaderProps) {
  const isExisting = Boolean(bill ?? draftId)
  const displayId = bill?.id ?? draftId

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-900"
            onClick={() => navigate(routes.dashboard)}>
            <span>←</span>
            <span>Back to Shipping Bills</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
              {isExisting ? `Shipping Bill #${displayId}` : 'New Shipping Bill'}
            </h1>
            <Badge variant={isExisting ? 'default' : 'outline'}>
              {isSaving ? 'Saving...' : isExisting ? 'Saved Draft' : 'New Entry'}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            ICEGATE Checklist standard export declaration and commercial invoice filing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => navigate(routes.dashboard)}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Visual Workflow Steps */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {workflowSteps.map((step, index) => {
          const isShippingBill = step.id === 'shipping-bill'
          return (
            <div
              key={step.id}
              className={`rounded-lg border p-3 transition-colors ${
                isShippingBill
                  ? 'border-primary-300 bg-primary-50/70 shadow-2xs'
                  : 'border-gray-200 bg-gray-50/60 opacity-75'
              }`}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span
                  className={`flex size-5 items-center justify-center rounded-full text-xs font-bold ${
                    isShippingBill ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                  {index + 1}
                </span>
                <span className={isShippingBill ? 'text-primary-950' : 'text-gray-700'}>{step.title}</span>
              </div>
              <p className="mt-0.5 ml-7 text-xs text-gray-500">{step.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
