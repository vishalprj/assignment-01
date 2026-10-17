import { SchemeCodeOption, SelectOption } from '@/services/reference-data-service'
import { BillFormContext, BillItemForm, lineTotal, ShippingBillFormValues } from '@/shipping-bills/model'
import { Button } from 'ui/basic/button'
import { Checkbox } from 'ui/inputs/checkbox'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { BranchPath, PartySelector } from './party-selector'

export interface GoodsItemCardProps {
  formCtx: BillFormContext
  invoiceIndex: number
  itemIndex: number
  item: BillItemForm
  invoiceCurrency: string
  canRemove: boolean
  onRemove: () => void
  onQuickAdd: (role: 'itemThirdParty', invoiceIndex: number, itemIndex: number) => void
  onAddBranch: (ownerId: number, branchName: BranchPath) => void
  schemeCodes: SchemeCodeOption[]
  quantityCodes: SelectOption<string>[]
  tradeAgreements: SelectOption<string>[]
  igstPaymentOptions: SelectOption<string>[]
  accessoryStatusOptions: SelectOption<string>[]
}

const dateType = 'date' as 'text'

/**
 * Focused component for a single goods / item line in an export invoice.
 * Encapsulates tariff classification, pricing, duty drawback, and customs incentive logic.
 */
export function GoodsItemCard({
  formCtx,
  invoiceIndex,
  itemIndex,
  item,
  invoiceCurrency,
  canRemove,
  onRemove,
  onQuickAdd,
  onAddBranch,
  schemeCodes,
  quantityCodes,
  tradeAgreements,
  igstPaymentOptions,
  accessoryStatusOptions
}: GoodsItemCardProps) {
  const { register } = formCtx.hooks

  // Determine if selected scheme qualifies for Duty Drawback / RoDTEP / RoSCTL incentives
  const selectedScheme = schemeCodes.find((s) => s.value === item.schemeCode)
  const isDrawbackEligible = Boolean(
    selectedScheme && (selectedScheme.drawback || selectedScheme.RODTEP || selectedScheme.ROSCTL)
  )

  const computedTotal = lineTotal(item)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs transition-all hover:border-gray-300">
      <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="bg-primary-100 text-primary-800 flex size-5 items-center justify-center rounded-full text-xs font-bold">
            {itemIndex + 1}
          </span>
          <h4 className="text-sm font-semibold text-gray-900">Line Item #{itemIndex + 1}</h4>
          {selectedScheme && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              Scheme {selectedScheme.value}
            </span>
          )}
        </div>
        {canRemove && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={onRemove}>
            Remove item
          </Button>
        )}
      </div>

      {/* Main Grid: Core Classification, Quantity, Pricing */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <Input
          label="RITC / HS Code *"
          placeholder="e.g. 61091000"
          {...register(`invoices.${invoiceIndex}.items.${itemIndex}.ritcCode`)}
        />

        <Select<ShippingBillFormValues>
          label="Scheme Code *"
          name={`invoices.${invoiceIndex}.items.${itemIndex}.schemeCode`}
          options={schemeCodes}
          placeholder="Select scheme"
        />

        <Input
          label="Goods Description *"
          placeholder="Commercial name / specifications"
          wrapClass="lg:col-span-4"
          {...register(`invoices.${invoiceIndex}.items.${itemIndex}.goodsDescription1`)}
        />

        <Input
          label="Quantity *"
          type="number"
          placeholder="0.00"
          {...register(`invoices.${invoiceIndex}.items.${itemIndex}.quantity`)}
        />

        <Select<ShippingBillFormValues>
          label="Unit (UQC) *"
          name={`invoices.${invoiceIndex}.items.${itemIndex}.unitOfMeasurement`}
          options={quantityCodes}
          rules={{ required: true }}
        />

        <Input
          label={`Unit Price (${invoiceCurrency || 'USD'}) *`}
          type="number"
          placeholder="0.00"
          {...register(`invoices.${invoiceIndex}.items.${itemIndex}.unitPrice`)}
        />

        <div>
          <Input
            label="Line Subtotal"
            type="number"
            readOnly
            className="bg-gray-50 text-right font-medium text-gray-900"
            placeholder={`${invoiceCurrency} ${computedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            {...register(`invoices.${invoiceIndex}.items.${itemIndex}.lineTotal`)}
          />
        </div>

        <Select<ShippingBillFormValues>
          label="IGST Payment"
          name={`invoices.${invoiceIndex}.items.${itemIndex}.igstPaymentStatus`}
          options={igstPaymentOptions}
          placeholder="Select status"
        />
      </div>

      {/* Incentive Badges & Conditional Drawback Fields */}
      <div className="mb-3 flex flex-wrap items-center gap-4 rounded-md border border-gray-100 bg-gray-50/70 p-3">
        {isDrawbackEligible && (
          <div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
            <div className="w-36">
              <Input
                label="Drawback Sr. No."
                placeholder="DBK Code"
                {...register(`invoices.${invoiceIndex}.items.${itemIndex}.drawbackSerialNumber`)}
              />
            </div>
            <div className="w-28">
              <Input
                label="Drawback Unit"
                placeholder="Unit"
                {...register(`invoices.${invoiceIndex}.items.${itemIndex}.drawbackUnit`)}
              />
            </div>
            <div className="w-32">
              <Input
                label="Drawback Qty"
                type="number"
                placeholder="Quantity"
                {...register(`invoices.${invoiceIndex}.items.${itemIndex}.drawbackQuantity`)}
              />
            </div>
          </div>
        )}

        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 select-none">
          <Checkbox {...register(`invoices.${invoiceIndex}.items.${itemIndex}.rewardItem`)} />
          Claim Export Reward (MEIS / RoDTEP)
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 select-none">
          <Checkbox {...register(`invoices.${invoiceIndex}.items.${itemIndex}.thirdPartyItem`)} />
          Manufactured by Third Party
        </label>
      </div>

      {/* Conditional Item-Level Third Party Manufacturer */}
      {item.thirdPartyItem && (
        <div className="my-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3">
          <h5 className="mb-2 text-xs font-bold tracking-wider text-amber-900 uppercase">
            Third-Party Manufacturer Information
          </h5>
          <PartySelector
            formCtx={formCtx}
            ownerName={`invoices.${invoiceIndex}.items.${itemIndex}.itemThirdPartyId`}
            branchName={`invoices.${invoiceIndex}.items.${itemIndex}.itemThirdPartyBranchId`}
            label="Third-Party Manufacturer"
            kind="business"
            role="thirdParty"
            required={false}
            onQuickAdd={() => onQuickAdd('itemThirdParty', invoiceIndex, itemIndex)}
            onAddBranch={(ownerId) =>
              onAddBranch(ownerId, `invoices.${invoiceIndex}.items.${itemIndex}.itemThirdPartyBranchId`)
            }
          />
        </div>
      )}

      {/* Collapsible Advanced Customs & Excise Attributes */}
      <details className="group mt-2 rounded-md border border-gray-100 bg-gray-50/40 p-3">
        <summary className="cursor-pointer text-xs font-semibold text-gray-600 transition-colors select-none group-hover:text-gray-900">
          ▸ Additional customs classification, accessory & excise details
        </summary>
        <div className="mt-3 space-y-3 pt-2">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select<ShippingBillFormValues>
              label="Unit of Rate"
              name={`invoices.${invoiceIndex}.items.${itemIndex}.unitOfRate`}
              options={quantityCodes}
              placeholder={item.unitOfMeasurement || 'UQC'}
            />
            <Input
              label="Per Unit Rate Units"
              type="number"
              placeholder="1"
              {...register(`invoices.${invoiceIndex}.items.${itemIndex}.numberOfUnits`)}
            />
            <Input
              label="Present Market Value (PMV)"
              type="number"
              placeholder="Local value"
              {...register(`invoices.${invoiceIndex}.items.${itemIndex}.presentMarketValue`)}
            />
            <Input
              label="Cess Amount"
              type="number"
              {...register(`invoices.${invoiceIndex}.items.${itemIndex}.cess`)}
            />
            <Input
              label="Accessories Description"
              wrapClass="lg:col-span-3"
              {...register(`invoices.${invoiceIndex}.items.${itemIndex}.accessoriesDescription`)}
            />
            <Select<ShippingBillFormValues>
              label="Accessory Status"
              name={`invoices.${invoiceIndex}.items.${itemIndex}.accessoryStatus`}
              options={accessoryStatusOptions}
              placeholder="Select status"
            />
          </div>

          {/* Conditional IGST Taxable & IGST Amount */}
          {item.igstPaymentStatus === 'P' && (
            <div className="grid gap-3 rounded-md border border-blue-100 bg-blue-50/50 p-2.5 sm:grid-cols-2">
              <Input
                label="Taxable Value (INR)"
                type="number"
                {...register(`invoices.${invoiceIndex}.items.${itemIndex}.taxableValue`)}
              />
              <Input
                label="IGST Amount (INR)"
                type="number"
                {...register(`invoices.${invoiceIndex}.items.${itemIndex}.igstAmount`)}
              />
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Origin District Code"
              placeholder="e.g. 524"
              {...register(`invoices.${invoiceIndex}.items.${itemIndex}.originDistrictCode`)}
            />
            <Select<ShippingBillFormValues>
              label="Trade Agreement"
              name={`invoices.${invoiceIndex}.items.${itemIndex}.tradeAgreementsCode`}
              options={tradeAgreements}
              placeholder="NCPTI"
            />
            <Input
              label="End Use Code"
              placeholder="e.g. 208"
              {...register(`invoices.${invoiceIndex}.items.${itemIndex}.endUseOfItem`)}
            />
            <Input
              label="Packages for Item"
              type="number"
              {...register(`invoices.${invoiceIndex}.items.${itemIndex}.totalPackage`)}
            />
          </div>

          <div className="border-t border-gray-100 pt-2.5">
            <span className="mb-2 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
              AR4 / Central Excise Details
            </span>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="AR4 Number"
                placeholder="AR4 document number"
                {...register(`invoices.${invoiceIndex}.items.${itemIndex}.ar4Number`)}
              />
              <Input
                label="AR4 Date"
                type={dateType}
                {...register(`invoices.${invoiceIndex}.items.${itemIndex}.ar4Date`)}
              />
            </div>
          </div>
        </div>
      </details>
    </div>
  )
}
