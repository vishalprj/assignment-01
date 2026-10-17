import { partyService } from '@/services/party-service'
import { BillFormContext, Branch, Business, Exporter } from '@/shipping-bills/model'
import { useEffect, useState } from 'react'
import { AsyncSearchOption, AsyncSearchSelect } from './async-search-select'

export type BranchPath =
  | 'exporterBranchId'
  | 'consigneeBranchId'
  | `invoices.${number}.buyerBranchId`
  | `invoices.${number}.thirdPartyBranchId`
  | `invoices.${number}.items.${number}.itemThirdPartyBranchId`

export interface PartySelectorProps {
  formCtx: BillFormContext
  ownerName:
    | 'exporterId'
    | 'consigneeId'
    | `invoices.${number}.buyerId`
    | `invoices.${number}.thirdPartyId`
    | `invoices.${number}.items.${number}.itemThirdPartyId`
  branchName: BranchPath
  label: string
  kind: 'exporter' | 'business'
  role?: 'consignee' | 'buyer' | 'thirdParty'
  required?: boolean
  onAddBranch: (ownerId: number) => void
  onQuickAdd: () => void
}

/**
 * PartySelector Component
 * Asynchronously searches parties and cascades branch selections.
 * Provides quick-actions for inline party and branch creation.
 */
export function PartySelector({
  formCtx,
  ownerName,
  branchName,
  label,
  kind,
  role = 'consignee',
  required = true,
  onAddBranch,
  onQuickAdd
}: PartySelectorProps) {
  const rawOwnerId = formCtx.hooks.watch(ownerName)
  const ownerId = typeof rawOwnerId === 'string' ? rawOwnerId : ''
  const [selectedOwner, setSelectedOwner] = useState<Exporter | Business | null>(null)

  // Fetch current selected owner details asynchronously when ownerId changes
  useEffect(() => {
    let active = true
    if (ownerId) {
      const fetcher =
        kind === 'exporter' ? partyService.getExporterById(ownerId) : partyService.getBusinessById(ownerId)

      void fetcher.then((party) => {
        if (active && party) {
          setSelectedOwner(party)
        }
      })
    } else {
      setSelectedOwner(null)
    }
    return () => {
      active = false
    }
  }, [kind, ownerId])

  // Reset branch if it no longer belongs to the selected owner
  useEffect(() => {
    const rawBranch = formCtx.hooks.getValues(branchName)
    const selectedBranch = typeof rawBranch === 'string' ? rawBranch : ''
    if (
      selectedBranch &&
      selectedOwner &&
      selectedOwner.branches.length > 0 &&
      !selectedOwner.branches.some((branch) => String(branch.id) === selectedBranch)
    ) {
      formCtx.hooks.setValue(branchName, '', { shouldValidate: true })
    }
  }, [branchName, formCtx.hooks, selectedOwner])

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-800">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
          <button
            type="button"
            className="text-primary-600 hover:text-primary-800 text-xs font-semibold transition-colors hover:underline"
            onClick={onQuickAdd}>
            + Add new
          </button>
        </div>
        <AsyncSearchSelect
          name={ownerName}
          placeholder={`Search ${kind === 'exporter' ? 'exporter' : role}...`}
          rules={{ required }}
          fetchOptions={async (query): Promise<AsyncSearchOption[]> => {
            if (kind === 'exporter') {
              const list = await partyService.searchExporters(query)
              return list.map((item) => ({
                value: String(item.id),
                label: item.name,
                sublabel: item.iec ? `IEC: ${item.iec}` : undefined
              }))
            } else {
              const list = await partyService.searchBusinesses(role, query)
              return list.map((item) => ({
                value: String(item.id),
                label: item.name,
                sublabel: item.iec ? `IEC: ${item.iec}` : undefined
              }))
            }
          }}
          getInitialLabel={async (id) => {
            if (kind === 'exporter') {
              const item = await partyService.getExporterById(id)
              return item ? item.name : ''
            } else {
              const item = await partyService.getBusinessById(id)
              return item ? item.name : ''
            }
          }}
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-800">
            Branch / Registered Address
            {(required || !!ownerId) && <span className="ml-0.5 text-red-500">*</span>}
          </label>
          {selectedOwner && (
            <button
              type="button"
              className="text-primary-600 hover:text-primary-800 text-xs font-semibold transition-colors hover:underline"
              onClick={() => onAddBranch(selectedOwner.id)}>
              + Add branch
            </button>
          )}
        </div>
        <AsyncSearchSelect
          name={branchName}
          placeholder={selectedOwner ? 'Select branch...' : `Choose ${kind} first`}
          disabled={!selectedOwner}
          rules={{ required: required || !!ownerId }}
          deps={[ownerId]}
          fetchOptions={async (query): Promise<AsyncSearchOption[]> => {
            if (!ownerId) return []
            const branches: Branch[] =
              kind === 'exporter'
                ? await partyService.getExporterBranches(ownerId, query)
                : await partyService.getBusinessBranches(ownerId, query)
            return branches.map((b) => ({
              value: String(b.id),
              label: `${b.branchName} · ${b.city}`,
              sublabel: `${b.address1}${b.gstnId ? ` · GSTIN: ${b.gstnId}` : ''}`
            }))
          }}
          getInitialLabel={(id) => {
            const branch = selectedOwner?.branches.find((b) => String(b.id) === id)
            return Promise.resolve(branch ? `${branch.branchName} · ${branch.city}` : '')
          }}
        />
      </div>
    </div>
  )
}
