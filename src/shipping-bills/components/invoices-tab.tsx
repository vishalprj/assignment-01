import { SchemeCodeOption, SelectOption } from '@/services/reference-data-service'
import { BillFormContext, BillInvoiceForm, emptyInvoice } from '@/shipping-bills/model'
import { Button } from 'ui/basic/button'
import { InvoiceCard } from './invoice-card'
import { BranchPath } from './party-selector'

export interface InvoicesTabProps {
  formCtx: BillFormContext
  invoices: BillInvoiceForm[]
  invoiceFields: any[]
  onAddInvoice: () => void
  onRemoveInvoice: (index: number) => void
  onQuickAdd: (role: 'buyer' | 'thirdParty' | 'itemThirdParty', invoiceIndex: number, itemIndex?: number) => void
  onAddBranch: (ownerId: number, branchName: BranchPath) => void
  currencies: SelectOption<string>[]
  contractTypes: SelectOption<string>[]
  paymentTypes: SelectOption<string>[]
  priceInclusionTypes: SelectOption<string>[]
  schemeCodes: SchemeCodeOption[]
  quantityCodes: SelectOption<string>[]
  tradeAgreements: SelectOption<string>[]
  igstPaymentOptions: SelectOption<string>[]
  accessoryStatusOptions: SelectOption<string>[]
}

/**
 * InvoicesTab Component (Tab 2: Invoices & Goods)
 * Renders all commercial export invoices and line items.
 */
export function InvoicesTab({
  formCtx,
  invoices,
  invoiceFields,
  onAddInvoice,
  onRemoveInvoice,
  onQuickAdd,
  onAddBranch,
  currencies,
  contractTypes,
  paymentTypes,
  priceInclusionTypes,
  schemeCodes,
  quantityCodes,
  tradeAgreements,
  igstPaymentOptions,
  accessoryStatusOptions
}: InvoicesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200/80 bg-white p-4 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Commercial Invoices ({invoices.length})</h2>
          <p className="text-xs text-gray-500">
            Each invoice represents a commercial bill under this shipping bill filing.
          </p>
        </div>
        <Button
          type="button"
          onClick={onAddInvoice}
          className="bg-primary-600 hover:bg-primary-700 text-white shadow-xs">
          + Add another invoice
        </Button>
      </div>

      <div className="space-y-4">
        {invoiceFields.map((field, index) => (
          <InvoiceCard
            key={field.id}
            formCtx={formCtx}
            index={index}
            invoice={invoices[index] ?? emptyInvoice()}
            canRemove={invoiceFields.length > 1}
            onRemove={() => onRemoveInvoice(index)}
            onQuickAdd={onQuickAdd}
            onAddBranch={onAddBranch}
            currencies={currencies}
            contractTypes={contractTypes}
            paymentTypes={paymentTypes}
            priceInclusionTypes={priceInclusionTypes}
            schemeCodes={schemeCodes}
            quantityCodes={quantityCodes}
            tradeAgreements={tradeAgreements}
            igstPaymentOptions={igstPaymentOptions}
            accessoryStatusOptions={accessoryStatusOptions}
          />
        ))}
      </div>
    </div>
  )
}
