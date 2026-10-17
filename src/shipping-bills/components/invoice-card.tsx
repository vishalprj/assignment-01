import { SchemeCodeOption, SelectOption } from '@/services/reference-data-service'
import {
  BillFormContext,
  BillInvoiceForm,
  emptyItem,
  invoiceTotal,
  ShippingBillFormValues
} from '@/shipping-bills/model'
import { useFieldArray } from 'core/form'
import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Checkbox } from 'ui/inputs/checkbox'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { GoodsItemCard } from './goods-item-card'
import { BranchPath, PartySelector } from './party-selector'
import { RateAmountInput } from './rate-amount-input'

export interface InvoiceCardProps {
  formCtx: BillFormContext
  index: number
  invoice: BillInvoiceForm
  canRemove: boolean
  onRemove: () => void
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

const dateType = 'date' as 'text'

/**
 * InvoiceCard Component
 * Manages an individual export invoice with commercial terms, charges, buyer details, and items.
 */
export function InvoiceCard({
  formCtx,
  index,
  invoice,
  canRemove,
  onRemove,
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
}: InvoiceCardProps) {
  const { register, control, watch } = formCtx.hooks
  const invoiceValues = watch(`invoices.${index}`)

  const {
    fields: items,
    append: addItem,
    remove: removeItem
  } = useFieldArray({ control, name: `invoices.${index}.items` })

  const buyerSameAsConsignee = watch(`invoices.${index}.buyerSameAsConsignee`)
  const currentTotal = invoiceTotal(invoice)

  return (
    <Card className="mb-6 border border-gray-200/80 shadow-xs">
      <CardHeader className="flex-row items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 flex size-7 items-center justify-center rounded-md text-xs font-bold text-white shadow-xs">
            INV {index + 1}
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {invoiceValues.invoiceNumber ? `Invoice #${invoiceValues.invoiceNumber}` : `Invoice ${index + 1}`}
            </h3>
            <span className="text-xs text-gray-500">
              {items.length} {items.length === 1 ? 'line item' : 'line items'}
              {invoiceValues.contractType ? ` · ${invoiceValues.contractType}` : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow-2xs">
            {invoice.currency}{' '}
            {currentTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {canRemove && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={onRemove}>
              Delete invoice
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-5">
        {/* Core Commercial Meta */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Invoice Number *" placeholder="INV/2026/001" {...register(`invoices.${index}.invoiceNumber`)} />

          <Input label="Invoice Date *" type={dateType} {...register(`invoices.${index}.invoiceDate`)} />

          <div className="flex gap-2">
            <div className="w-[110px] shrink-0">
              <Select<ShippingBillFormValues>
                label="Currency *"
                name={`invoices.${index}.currency`}
                options={currencies}
                rules={{ required: true }}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Custom Total Override"
                type="number"
                placeholder={currentTotal.toFixed(2)}
                {...register(`invoices.${index}.invoiceTotal`)}
              />
            </div>
          </div>

          <Select<ShippingBillFormValues>
            label="Contract Type *"
            name={`invoices.${index}.contractType`}
            options={contractTypes}
            rules={{ required: true }}
          />
        </div>

        {/* Buyer Section */}
        <div className="rounded-lg border border-gray-100 bg-gray-50/40 p-4">
          <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-800 select-none">
            <Checkbox {...register(`invoices.${index}.buyerSameAsConsignee`)} />
            Buyer is the same as Consignee
          </label>

          {!buyerSameAsConsignee && (
            <div className="border-t border-gray-200/60 pt-2">
              <PartySelector
                formCtx={formCtx}
                ownerName={`invoices.${index}.buyerId`}
                branchName={`invoices.${index}.buyerBranchId`}
                label="Buyer (Overseas)"
                kind="business"
                role="buyer"
                required={!buyerSameAsConsignee}
                onQuickAdd={() => onQuickAdd('buyer', index)}
                onAddBranch={(ownerId) => onAddBranch(ownerId, `invoices.${index}.buyerBranchId`)}
              />
            </div>
          )}
        </div>

        {/* Commercial Charges & Deductions */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold tracking-wider text-gray-500 uppercase">Invoice Deductions & Inclusions</h4>
          <div className="space-y-2">
            <RateAmountInput
              label="Freight"
              rateName={`invoices.${index}.freightRate`}
              amountName={`invoices.${index}.freightAmount`}
              currencyName={`invoices.${index}.freightCurrency`}
              rateValue={invoiceValues.freightRate}
              amountValue={invoiceValues.freightAmount}
              defaultCurrency={invoice.currency}
              currencyOptions={currencies}
              register={register}
            />

            <RateAmountInput
              label="Insurance"
              rateName={`invoices.${index}.insuranceRate`}
              amountName={`invoices.${index}.insuranceAmount`}
              currencyName={`invoices.${index}.insuranceCurrency`}
              rateValue={invoiceValues.insuranceRate}
              amountValue={invoiceValues.insuranceAmount}
              defaultCurrency={invoice.currency}
              currencyOptions={currencies}
              register={register}
            />

            <RateAmountInput
              label="Commission"
              rateName={`invoices.${index}.commissionRate`}
              amountName={`invoices.${index}.commissionAmount`}
              currencyName={`invoices.${index}.commissionCurrency`}
              rateValue={invoiceValues.commissionRate}
              amountValue={invoiceValues.commissionAmount}
              defaultCurrency={invoice.currency}
              currencyOptions={currencies}
              register={register}
            />

            <RateAmountInput
              label="Discount"
              rateName={`invoices.${index}.discountRate`}
              amountName={`invoices.${index}.discountAmount`}
              currencyName={`invoices.${index}.discountCurrency`}
              rateValue={invoiceValues.discountRate}
              amountValue={invoiceValues.discountAmount}
              defaultCurrency={invoice.currency}
              currencyOptions={currencies}
              register={register}
            />

            <RateAmountInput
              label="Other Deductions"
              rateName={`invoices.${index}.otherDeductionsRate`}
              amountName={`invoices.${index}.otherDeductionsAmount`}
              currencyName={`invoices.${index}.otherDeductionsCurrency`}
              rateValue={invoiceValues.otherDeductionsRate}
              amountValue={invoiceValues.otherDeductionsAmount}
              defaultCurrency={invoice.currency}
              currencyOptions={currencies}
              register={register}
            />
          </div>

          <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Packing Charges"
              type="number"
              placeholder="0.00"
              {...register(`invoices.${index}.packingCharges`)}
            />
            <Select<ShippingBillFormValues>
              label="Price Includes"
              name={`invoices.${index}.freightInsuranceIncluded`}
              options={priceInclusionTypes}
              placeholder="Select inclusion"
            />
            <Input
              label="Contract / Order No."
              placeholder="PO or contract ref"
              {...register(`invoices.${index}.contractNumber`)}
            />
            <Select<ShippingBillFormValues>
              label="Payment Terms"
              name={`invoices.${index}.natureOfPayment`}
              options={paymentTypes}
              placeholder="Select terms"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Period of Payment (days)"
              type="number"
              min="0"
              placeholder="e.g. 60"
              {...register(`invoices.${index}.periodOfPayment`)}
            />
          </div>

          <PartySelector
            formCtx={formCtx}
            ownerName={`invoices.${index}.thirdPartyId`}
            branchName={`invoices.${index}.thirdPartyBranchId`}
            label="Third-Party Merchant Exporter (Optional)"
            kind="business"
            role="thirdParty"
            required={false}
            onQuickAdd={() => onQuickAdd('thirdParty', index)}
            onAddBranch={(ownerId) => onAddBranch(ownerId, `invoices.${index}.thirdPartyBranchId`)}
          />
        </div>

        {/* Goods Line Items */}
        <div className="border-t border-gray-200/80 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-base font-semibold text-gray-900">Goods Items</h4>
              <p className="text-xs text-gray-500">
                Classify export items by RITC, assign export schemes, and enter quantity/pricing.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addItem(emptyItem())}
              className="text-primary-700 border-primary-300 hover:bg-primary-50">
              + Add item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((field, itemIndex) => (
              <GoodsItemCard
                key={field.id}
                formCtx={formCtx}
                invoiceIndex={index}
                itemIndex={itemIndex}
                item={invoice.items[itemIndex] ?? emptyItem()}
                invoiceCurrency={invoice.currency || 'USD'}
                canRemove={items.length > 1}
                onRemove={() => removeItem(itemIndex)}
                onQuickAdd={(role, invIdx, itmIdx) => onQuickAdd(role, invIdx, itmIdx)}
                onAddBranch={onAddBranch}
                schemeCodes={schemeCodes}
                quantityCodes={quantityCodes}
                tradeAgreements={tradeAgreements}
                igstPaymentOptions={igstPaymentOptions}
                accessoryStatusOptions={accessoryStatusOptions}
              />
            ))}
          </div>
        </div>

        {/* Invoice Summary Footer */}
        <div className="flex justify-end rounded-md border border-gray-200/60 bg-gray-50 p-3">
          <div className="text-right">
            <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">Invoice Subtotal</span>
            <p className="text-lg font-bold text-gray-900">
              {invoice.currency || 'USD'}{' '}
              {currentTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
