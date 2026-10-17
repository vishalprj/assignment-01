import { invoiceTotal, ShippingBillFormValues } from '@/shipping-bills/model'
import { useMemo } from 'react'

export interface DomainValidationIssue {
  type: 'error' | 'warning'
  field: string
  message: string
}

/**
 * Domain calculations hook for Shipping Bill metrics & business rules.
 * Extracts calculation logic out of the presentation components.
 */
export function useShippingBillStats(values: ShippingBillFormValues) {
  return useMemo(() => {
    const totalInvoices = values.invoices.length

    let totalItems = 0
    const currencyTotals: Record<string, number> = {}

    values.invoices.forEach((invoice) => {
      const itemsCount = invoice.items.length
      totalItems += itemsCount

      const invTotal = invoiceTotal(invoice)
      const currency = invoice.currency ? invoice.currency : 'USD'
      currencyTotals[currency] = (currencyTotals[currency] ?? 0) + invTotal
    })

    const issues: DomainValidationIssue[] = []

    // 1. Gross Weight vs Net Weight domain rule:
    // In customs shipping bills, Gross Weight (cargo + packaging) must never be less than Net Weight (pure goods).
    const grossNum = Number(values.grossWeight)
    const netNum = Number(values.netWeight)
    const hasGross = values.grossWeight != null && values.grossWeight !== '' && !isNaN(grossNum)
    const hasNet = values.netWeight != null && values.netWeight !== '' && !isNaN(netNum)

    if (hasGross && hasNet && grossNum < netNum) {
      issues.push({
        type: 'error',
        field: 'grossWeight',
        message: 'Gross weight must be greater than or equal to Net weight.'
      })
    }

    // 2. Containerized cargo consistency rule:
    const containerCount = values.containers.length
    const specifiedContainers = values.numberOfContainers ? Number(values.numberOfContainers) : 0

    if (values.natureOfCargo === 'C' && containerCount === 0 && specifiedContainers === 0) {
      issues.push({
        type: 'warning',
        field: 'natureOfCargo',
        message: 'Cargo is marked containerized (C), but no containers have been added.'
      })
    }

    // 3. Drawback schemes rule:
    values.invoices.forEach((inv, invIdx) => {
      inv.items.forEach((item, itemIdx) => {
        if (item.schemeCode && ['19', '43', '60', '61', '64'].includes(item.schemeCode)) {
          if (!item.drawbackSerialNumber) {
            issues.push({
              type: 'warning',
              field: `invoices.${invIdx}.items.${itemIdx}.drawbackSerialNumber`,
              message: `Invoice ${invIdx + 1}, Item ${itemIdx + 1}: Drawback scheme requires a Drawback Serial Number.`
            })
          }
        }
      })
    })

    return {
      totalInvoices,
      totalItems,
      currencyTotals,
      totalContainers: containerCount,
      totalDocuments: values.documents.length,
      totalLicenses: values.licenses.length,
      issues,
      hasErrors: issues.some((i) => i.type === 'error'),
      hasWarnings: issues.some((i) => i.type === 'warning')
    }
  }, [values])
}
