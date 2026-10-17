import { partyService } from '@/services/party-service'
import { referenceDataService, SelectOption } from '@/services/reference-data-service'
import { BillFormContext, portCountry, ShippingBillFormValues } from '@/shipping-bills/model'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { AsyncSearchOption, AsyncSearchSelect } from './async-search-select'
import { BranchPath, PartySelector } from './party-selector'

export interface CargoPackageTabProps {
  formCtx: BillFormContext
  onQuickAdd: (kind: 'exporter' | 'business', role?: 'consignee') => void
  onAddBranch: (kind: 'exporter' | 'business', ownerId: number, branchName: BranchPath) => void
  cargoOptions: SelectOption<string>[]
  weightUnits: SelectOption<string>[]
  sealTypes: SelectOption<string>[]
  stateOptions: SelectOption<number>[]
  portOptions: SelectOption<string>[]
  nfeiCategories: SelectOption<string>[]
}

const dateType = 'date' as 'text'

/**
 * CargoPackageTab Component (Tab 1: Details)
 * Handles Exporter/Consignee parties, origin/destination ports, package weights, and regulatory details.
 */
export function CargoPackageTab({
  formCtx,
  onQuickAdd,
  onAddBranch,
  cargoOptions,
  weightUnits,
  sealTypes,
  stateOptions,
  portOptions,
  nfeiCategories
}: CargoPackageTabProps) {
  const { register, watch } = formCtx.hooks
  const values: ShippingBillFormValues = watch()
  const [marksOptions, setMarksOptions] = useState<SelectOption<string>[]>([])
  const [loadingMarks, setLoadingMarks] = useState(false)

  // Load marks & numbers dynamically whenever Exporter changes
  useEffect(() => {
    let active = true
    if (values.exporterId) {
      setLoadingMarks(true)
      void partyService
        .getMarksAndNumbers(values.exporterId)
        .then((options) => {
          if (active) {
            setMarksOptions(options)
            setLoadingMarks(false)
          }
        })
        .catch(() => {
          if (active) {
            setMarksOptions([])
            setLoadingMarks(false)
          }
        })
    } else {
      setMarksOptions([])
    }
    return () => {
      active = false
    }
  }, [values.exporterId])

  const originCountry = portCountry(values.loadingPort) || 'IN'
  const destinationCountry = portCountry(values.finalDestinationPort) || '—'

  return (
    <Card className="border border-gray-200/80 shadow-xs">
      <CardHeader
        title="Shipment Parties & Route"
        description="Core export entities, origin/destination ports, and cargo weight specifications."
        className="border-b border-gray-100 bg-gray-50/50 px-5 py-3.5"
      />
      <CardContent className="space-y-6 p-5">
        {/* Parties */}
        <div className="space-y-4">
          <PartySelector
            formCtx={formCtx}
            ownerName="exporterId"
            branchName="exporterBranchId"
            label="Exporter *"
            kind="exporter"
            required={true}
            onQuickAdd={() => onQuickAdd('exporter')}
            onAddBranch={(ownerId) => onAddBranch('exporter', ownerId, 'exporterBranchId')}
          />

          <PartySelector
            formCtx={formCtx}
            ownerName="consigneeId"
            branchName="consigneeBranchId"
            label="Consignee (Overseas Receiver) *"
            kind="business"
            role="consignee"
            required={true}
            onQuickAdd={() => onQuickAdd('business', 'consignee')}
            onAddBranch={(ownerId) => onAddBranch('business', ownerId, 'consigneeBranchId')}
          />
        </div>

        {/* Route Details */}
        <div className="border-t border-gray-200/80 pt-5">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Customs Route & Ports</h4>
            <p className="text-xs text-gray-500">
              Select Indian port of loading and foreign port of discharge/destination.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-sm font-medium text-gray-800">
                Port of Loading (Indian Customs Port) *
              </span>
              <AsyncSearchSelect
                name="loadingPort"
                placeholder="Search Indian port (e.g. Nhava Sheva)..."
                rules={{ required: true }}
                fetchOptions={async (query): Promise<AsyncSearchOption[]> => {
                  return referenceDataService.searchLoadingPorts(query)
                }}
                getInitialLabel={async (code) => {
                  const port = await referenceDataService.getPortByCode(code)
                  return port ? `${port.name} · ${port.code}` : code
                }}
              />
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-gray-800">
                Final Destination Port (Foreign Port) *
              </span>
              <AsyncSearchSelect
                name="finalDestinationPort"
                placeholder="Search overseas port..."
                rules={{ required: true }}
                fetchOptions={async (query): Promise<AsyncSearchOption[]> => {
                  return referenceDataService.searchDestinationPorts(query)
                }}
                getInitialLabel={async (code) => {
                  const port = await referenceDataService.getPortByCode(code)
                  return port ? `${port.name} · ${port.code}` : code
                }}
              />
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-2 rounded-md border border-gray-100 bg-gray-50 p-2 text-xs text-gray-600">
            <span className="font-medium text-gray-700">Country Derivation:</span>
            <span>
              Origin: <strong className="text-gray-900">{originCountry}</strong>
            </span>
            <span>→</span>
            <span>
              Destination: <strong className="text-gray-900">{destinationCountry}</strong>
            </span>
          </div>
        </div>

        {/* Regulatory & Route Exceptions (Collapsible) */}
        <details className="group rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <summary className="group-hover:text-primary-800 cursor-pointer text-sm font-medium text-gray-800 select-none">
            ▸ Regulatory, RBI waiver & discharge port options
          </summary>
          <div className="mt-4 grid gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
            <Select<ShippingBillFormValues>
              label="Discharge Port"
              name="dischargePort"
              options={portOptions}
              placeholder="Defaults to Final Destination"
            />
            <Select<ShippingBillFormValues>
              label="Origin State"
              name="originStateCode"
              options={stateOptions}
              placeholder="Defaults to Branch State"
            />
            <Select<ShippingBillFormValues>
              label="NFEI Category"
              name="nfeiCategory"
              options={nfeiCategories}
              placeholder="Not applicable"
            />
            <Input label="RBI Waiver Number" placeholder="If GR-waiver applicable" {...register('rbiWaiverNumber')} />
            <Input label="RBI Waiver Date" type={dateType} {...register('rbiWaiverDate')} />
          </div>
        </details>

        {/* Package & Weight Specifications */}
        <div className="border-t border-gray-200/80 pt-5">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Package & Weight Specifications</h4>
            <p className="text-xs text-gray-500">
              Customs requires gross weight (including packing) and net weight (goods only).
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select<ShippingBillFormValues> label="Nature of Cargo *" name="natureOfCargo" options={cargoOptions} />

            <Input label="Gross Weight *" type="number" placeholder="Total weight" {...register('grossWeight')} />

            <Input label="Net Weight *" type="number" placeholder="Net goods weight" {...register('netWeight')} />

            <Select<ShippingBillFormValues> label="Weight Unit *" name="measurementUnit" options={weightUnits} />

            <Input label="Total Packages" type="number" placeholder="e.g. 150" {...register('totalPackages')} />

            <div className="sm:col-span-3">
              <Select<ShippingBillFormValues>
                label="Shipping Marks & Numbers"
                name="marksAndNumbers"
                options={marksOptions}
                placeholder={
                  !values.exporterId
                    ? 'Select an exporter first'
                    : loadingMarks
                      ? 'Loading marks...'
                      : marksOptions.length === 0
                        ? 'No marks found'
                        : 'Select standard shipping marks'
                }
                disabled={!values.exporterId || loadingMarks || !marksOptions.length}
              />
            </div>
          </div>
        </div>

        {/* Additional Air/Sea Cargo Details (Collapsible) */}
        <details className="group rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <summary className="group-hover:text-primary-800 cursor-pointer text-sm font-medium text-gray-800 select-none">
            ▸ Additional seal, MAWB/HAWB & loose packets
          </summary>
          <div className="mt-4 grid gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
            <Select<ShippingBillFormValues>
              label="Seal Type"
              name="sealType"
              options={sealTypes}
              placeholder="Select seal type"
            />
            {values.containers.length === 0 && (
              <Input
                label="Number of Containers"
                type="number"
                placeholder="e.g. 1"
                {...register('numberOfContainers')}
              />
            )}
            <Input label="Loose Packets" type="number" {...register('loosePackets')} />
            <Input label="MAWB Number (Air)" placeholder="Master Airway Bill" {...register('mawbNumber')} />
            <Input label="HAWB Number (Air)" placeholder="House Airway Bill" {...register('hawbNumber')} />
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
