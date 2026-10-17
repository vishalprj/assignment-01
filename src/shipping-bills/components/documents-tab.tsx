import { referenceDataService, SelectOption } from '@/services/reference-data-service'
import { BillFormContext, ShippingBillFormValues } from '@/shipping-bills/model'
import { useState } from 'react'
import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { AsyncSearchOption, AsyncSearchSelect } from './async-search-select'

export interface DocumentsTabProps {
  formCtx: BillFormContext
  containerFields: any[]
  onAddContainer: () => void
  onRemoveContainer: (index: number) => void
  packingRangeFields: any[]
  onAddPackingRange: () => void
  onRemovePackingRange: (index: number) => void
  documentFields: any[]
  onAddDocument: () => void
  onRemoveDocument: (index: number) => void
  licenseFields: any[]
  onAddLicense: () => void
  onRemoveLicense: (index: number) => void
  containerSizes: SelectOption<string>[]
  containerSealTypes: SelectOption<number>[]
  licenseSources: SelectOption<string>[]
}

const dateType = 'date' as 'text'

/**
 * DocumentsTab Component (Tab 3: Cargo & Documents)
 * Handles Container records, Packing list ranges, e-Sanchit Supporting Docs, and Export Licences.
 */
export function DocumentsTab({
  formCtx,
  containerFields,
  onAddContainer,
  onRemoveContainer,
  packingRangeFields,
  onAddPackingRange,
  onRemovePackingRange,
  documentFields,
  onAddDocument,
  onRemoveDocument,
  licenseFields,
  onAddLicense,
  onRemoveLicense,
  containerSizes,
  containerSealTypes,
  licenseSources
}: DocumentsTabProps) {
  const { register } = formCtx.hooks

  return (
    <div className="space-y-6">
      {/* 1. Containers */}
      <Card className="border border-gray-200/80 shadow-xs">
        <CardHeader className="flex-row items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-3.5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Containers ({containerFields.length})</h3>
            <p className="text-xs text-gray-500">Only required when cargo is containerized (FCL/LCL).</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onAddContainer}
            className="text-primary-700 border-primary-300 hover:bg-primary-50">
            + Add container
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {containerFields.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
              <p className="text-sm text-gray-500">No containers added.</p>
              <Button type="button" size="sm" variant="outline" className="mt-3 text-xs" onClick={onAddContainer}>
                + Add container
              </Button>
            </div>
          ) : (
            containerFields.map((field, index) => (
              <div key={field.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs">
                <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="text-sm font-semibold text-gray-800">Container #{index + 1}</h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onRemoveContainer(index)}>
                    Remove
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Input
                    label="Container Number *"
                    placeholder="e.g. MSCU1234567"
                    {...register(`containers.${index}.containerNumber`)}
                  />
                  <Select<ShippingBillFormValues>
                    label="Size"
                    name={`containers.${index}.containerSize`}
                    options={containerSizes}
                    placeholder="Select size"
                  />
                  <Input
                    label="Excise / Customs Seal No."
                    placeholder="Seal number"
                    {...register(`containers.${index}.exciseSealNumber`)}
                  />
                  <Input label="Seal Date" type={dateType} {...register(`containers.${index}.sealDate`)} />
                  <Select<ShippingBillFormValues>
                    label="Seal Type"
                    name={`containers.${index}.sealType`}
                    options={containerSealTypes}
                    placeholder="Select seal type"
                  />
                  <Input
                    label="Seal Device ID (RFID / E-Seal)"
                    placeholder="Device ID"
                    {...register(`containers.${index}.sealDeviceId`)}
                  />
                  <Input
                    label="Movement Document Type"
                    placeholder="e.g. Gate Pass / Lorry Receipt"
                    {...register(`containers.${index}.movementDocumentType`)}
                  />
                  <Input
                    label="Movement Document Number"
                    placeholder="Doc number"
                    {...register(`containers.${index}.movementDocumentNumber`)}
                  />
                </div>
              </div>
            ))
          )}

          {/* Packing List Ranges */}
          <details className="group mt-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <summary className="group-hover:text-primary-800 cursor-pointer text-sm font-medium text-gray-800 select-none">
              ▸ Packing list serial number ranges ({packingRangeFields.length})
            </summary>
            <div className="mt-4 space-y-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onAddPackingRange} className="text-xs">
                + Add packing range
              </Button>
              {packingRangeFields.map((field, index) => (
                <div key={field.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-2xs">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">Range #{index + 1}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs text-red-600 hover:bg-red-50"
                      onClick={() => onRemovePackingRange(index)}>
                      Remove
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input
                      label="Package From"
                      type="number"
                      placeholder="1"
                      {...register(`packingRanges.${index}.packingNumberFrom`)}
                    />
                    <Input
                      label="Package To"
                      type="number"
                      placeholder="100"
                      {...register(`packingRanges.${index}.packingNumberTo`)}
                    />
                    <Input
                      label="Packing Code / Type"
                      placeholder="e.g. CTN (Cartons)"
                      {...register(`packingRanges.${index}.packingCode`)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </details>
        </CardContent>
      </Card>

      {/* 2. Supporting Documents (e-Sanchit) */}
      <Card className="border border-gray-200/80 shadow-xs">
        <CardHeader className="flex-row items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-3.5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Supporting Documents (e-Sanchit / ICEGATE) ({documentFields.length})
            </h3>
            <p className="text-xs text-gray-500">
              Attach uploaded e-Sanchit documents, certificates of origin, and inspection reports.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onAddDocument}
            className="text-primary-700 border-primary-300 hover:bg-primary-50">
            + Add document
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {documentFields.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
              <p className="text-sm text-gray-500">No supporting documents attached.</p>
              <Button type="button" size="sm" variant="outline" className="mt-3 text-xs" onClick={onAddDocument}>
                + Add document
              </Button>
            </div>
          ) : (
            documentFields.map((field, index) => (
              <SupportingDocItem
                key={field.id}
                formCtx={formCtx}
                index={index}
                onRemove={() => onRemoveDocument(index)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* 3. Export Licences */}
      <Card className="border border-gray-200/80 shadow-xs">
        <CardHeader className="flex-row items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-3.5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Export Licences ({licenseFields.length})</h3>
            <p className="text-xs text-gray-500">
              Only required for restricted items or incentive schemes requiring DGFT licences.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onAddLicense}
            className="text-primary-700 border-primary-300 hover:bg-primary-50">
            + Add licence
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {licenseFields.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
              <p className="text-sm text-gray-500">No licences required for standard goods.</p>
              <Button type="button" size="sm" variant="outline" className="mt-3 text-xs" onClick={onAddLicense}>
                + Add licence
              </Button>
            </div>
          ) : (
            licenseFields.map((field, index) => (
              <div key={field.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-2xs">
                <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="text-sm font-semibold text-gray-800">Licence #{index + 1}</h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-red-600 hover:bg-red-50"
                    onClick={() => onRemoveLicense(index)}>
                    Remove
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Input
                    label="Registration Number *"
                    placeholder="Licence registration no."
                    {...register(`licenses.${index}.registrationNumber`)}
                  />
                  <Input
                    label="Registration Date"
                    type={dateType}
                    {...register(`licenses.${index}.registrationDate`)}
                  />
                  <Input
                    label="Invoice Serial Number"
                    type="number"
                    placeholder="1"
                    {...register(`licenses.${index}.invoiceSerialNumber`)}
                  />
                  <Input
                    label="Item Serial Number"
                    type="number"
                    placeholder="1"
                    {...register(`licenses.${index}.itemSerialNumber`)}
                  />
                  <Input
                    label="Licence Serial Number"
                    type="number"
                    {...register(`licenses.${index}.licenseSerialNumber`)}
                  />
                  <Input
                    label="Licence Quantity"
                    type="number"
                    placeholder="0.00"
                    {...register(`licenses.${index}.licenseQuantity`)}
                  />
                  <Input
                    label="Export Quantity"
                    type="number"
                    placeholder="0.00"
                    {...register(`licenses.${index}.licenseExportQuantity`)}
                  />
                  <Select<ShippingBillFormValues>
                    label="Goods Source"
                    name={`licenses.${index}.indigenousOrImported`}
                    options={licenseSources}
                    placeholder="Select source"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SupportingDocItem({
  formCtx,
  index,
  onRemove
}: {
  formCtx: BillFormContext
  index: number
  onRemove: () => void
}) {
  const { register } = formCtx.hooks
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <h4 className="text-sm font-semibold text-gray-800">Supporting Document #{index + 1}</h4>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-red-600 hover:bg-red-50"
          onClick={onRemove}>
          Remove
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-gray-800">Document Type Code (e-Sanchit) *</span>
          <AsyncSearchSelect
            name={`documents.${index}.documentTypeCode`}
            placeholder="Search document type (e.g. Invoice, COO)..."
            fetchOptions={async (query): Promise<AsyncSearchOption[]> => {
              return referenceDataService.searchDocumentCodes(query)
            }}
            getInitialLabel={async (val) => {
              return referenceDataService.getDocumentCodeLabel(val)
            }}
          />
        </div>

        <Input
          label="Image Reference Number (IRN)"
          placeholder="e-Sanchit IRN identifier"
          {...register(`documents.${index}.imageReferenceNumber`)}
        />

        <Input label="Issue Date" type={dateType} {...register(`documents.${index}.documentIssueDate`)} />
      </div>

      <details
        className="group rounded-md border border-gray-100 bg-gray-50/50 p-3"
        open={showAdvanced}
        onToggle={(e) => setShowAdvanced(e.currentTarget.open)}>
        <summary className="cursor-pointer text-xs font-semibold text-gray-600 select-none group-hover:text-gray-900">
          ▸ Issuing authority, beneficiary & ICEGATE details
        </summary>
        <div className="mt-3 space-y-3 pt-2">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Document Ref Number"
              placeholder="Certificate / license number"
              {...register(`documents.${index}.documentReferenceNumber`)}
            />
            <Input label="Expiry Date" type={dateType} {...register(`documents.${index}.documentExpiryDate`)} />
            <Input
              label="Invoice Sr. No."
              type="number"
              placeholder="1"
              {...register(`documents.${index}.invoiceSerialNumber`)}
            />
            <Input
              label="Item Sr. No."
              type="number"
              placeholder="1"
              {...register(`documents.${index}.itemSerialNumber`)}
            />
            <Input
              label="Place of Issue"
              placeholder="City of issuance"
              {...register(`documents.${index}.placeOfIssue`)}
            />
          </div>

          <div className="border-t border-gray-200/60 pt-3">
            <h5 className="mb-2 text-xs font-bold tracking-wider text-gray-600 uppercase">Issuing Party Details</h5>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                label="Party Code"
                placeholder="Authority code"
                {...register(`documents.${index}.issuingPartyCode`)}
              />
              <Input
                label="Party Name"
                placeholder="Name of issuing agency"
                {...register(`documents.${index}.issuingPartyName`)}
              />
              <Input label="City" placeholder="City" {...register(`documents.${index}.issuingPartyCity`)} />
            </div>
          </div>
        </div>
      </details>
    </div>
  )
}
