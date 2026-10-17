import { SelectOption } from '@/services/reference-data-service'
import { ShippingBillFormValues } from '@/shipping-bills/model'
import type { UseFormRegister } from 'ui/form'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'

export interface RateAmountInputProps {
  label: string
  rateName: string
  amountName: string
  currencyName: string
  rateValue?: string
  amountValue?: string
  defaultCurrency?: string
  currencyOptions: SelectOption<string>[]
  register: UseFormRegister<ShippingBillFormValues>
}

/**
 * Reusable Rate & Amount Input Pair
 * Used for commercial invoice charges: Freight, Insurance, Commission, Discounts, and Deductions.
 * Enforces business logic: Rate (%) and Amount are mutually exclusive.
 */
export function RateAmountInput({
  label,
  rateName,
  amountName,
  currencyName,
  rateValue,
  amountValue,
  defaultCurrency = 'USD',
  currencyOptions,
  register
}: RateAmountInputProps) {
  const isAmountDisabled = Boolean(rateValue && rateValue.trim() !== '')
  const isRateDisabled = Boolean(amountValue && amountValue.trim() !== '')

  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-gray-100 bg-gray-50/50 p-2.5 transition-colors hover:border-gray-200 hover:bg-white sm:flex-row sm:items-center sm:gap-3">
      <span className="w-32 shrink-0 text-xs font-semibold tracking-wider text-gray-700 uppercase">{label}</span>

      <div className="flex flex-1 items-center gap-2">
        {/* Rate Input (%) */}
        <div className="relative w-28 shrink-0">
          <Input
            type="number"
            placeholder="Rate %"
            disabled={isRateDisabled}
            className="pr-6 text-right"
            {...register(rateName as any)}
          />
          <span className="pointer-events-none absolute top-2 right-2.5 text-xs font-medium text-gray-400">%</span>
        </div>

        <span className="text-xs font-medium text-gray-400">or</span>

        {/* Amount Input */}
        <div className="w-36 shrink-0">
          <Input
            type="number"
            placeholder="Amount"
            disabled={isAmountDisabled}
            className="text-right"
            {...register(amountName as any)}
          />
        </div>

        {/* Currency Select */}
        <div className="w-28 shrink-0">
          <Select<ShippingBillFormValues>
            name={currencyName as any}
            options={currencyOptions}
            placeholder={defaultCurrency}
          />
        </div>
      </div>
    </div>
  )
}
