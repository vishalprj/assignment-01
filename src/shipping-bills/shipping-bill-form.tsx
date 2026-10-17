import { useReferenceData } from '@/hooks/use-reference-data'
import { routes } from '@/shared/route-paths'
import { s, useFieldArray, useForm } from 'core/form'
import { Form, SubmitButton } from 'core/form/components'
import { navigate, useParams } from 'core/routing'
import { toast } from 'core/toast-manager'
import { useEffect, useState } from 'react'
import { Button } from 'ui/basic/button'
import { Tabs, TabsList, TabsTrigger } from 'ui/interactive/tabs'
import { BillHeader } from './components/bill-header'
import { BillSummaryBar } from './components/bill-summary-bar'
import { CargoPackageTab } from './components/cargo-package-tab'
import { DocumentsTab } from './components/documents-tab'
import { InvoicesTab } from './components/invoices-tab'
import { BranchPath } from './components/party-selector'
import { PersistentTab } from './components/persistent-tab'
import {
  Branch,
  Business,
  emptyBill,
  emptyDocument,
  emptyInvoice,
  Exporter,
  SavedBill,
  ShippingBillFormValues
} from './model'
import { BranchDialog, PartyDialog } from './party-dialogs'
import { shippingBillService } from './shipping-bill-service'

const positiveNumber = s.string().refine((value) => (Number(value) > 0 ? undefined : 'Enter a number above zero'))

const billSchema = s.object({
  jobNumber: s.string().optional(),
  jobDate: s.string(),
  exporterId: s.string(),
  exporterBranchId: s.string(),
  consigneeId: s.string(),
  consigneeBranchId: s.string(),
  loadingPort: s.string(),
  finalDestinationPort: s.string(),
  dischargePort: s.string().optional(),
  originStateCode: s.string().optional(),
  nfeiCategory: s.string().optional(),
  rbiWaiverNumber: s.string().optional(),
  rbiWaiverDate: s.string().optional(),
  sealType: s.string().optional(),
  numberOfContainers: s.string().optional(),
  natureOfCargo: s.string().optional(),
  grossWeight: s.string().optional(),
  netWeight: s.string().optional(),
  measurementUnit: s.string().optional(),
  totalPackages: s.string().optional(),
  marksAndNumbers: s.string().optional(),
  loosePackets: s.string().optional(),
  mawbNumber: s.string().optional(),
  hawbNumber: s.string().optional(),
  invoiceNumber: s.string(),
  invoiceDate: s.string(),
  currency: s.string(),
  invoiceTotal: s
    .string()
    .refine((value) => (!value || Number(value) >= 0 ? undefined : 'Total cannot be negative'))
    .optional(),
  contractType: s.string(),
  buyerId: s.string().optional(),
  buyerBranchId: s.string().optional(),
  thirdPartyId: s.string().optional(),
  thirdPartyBranchId: s.string().optional(),
  ritcCode: s.string(),
  goodsDescription1: s.string(),
  quantity: positiveNumber,
  unitOfMeasurement: s.string(),
  unitPrice: positiveNumber,
  containerNumber: s.string().optional(),
  packingNumberFrom: s.string().optional(),
  packingNumberTo: s.string().optional(),
  documentTypeCode: s.string().optional(),
  documentReferenceNumber: s.string().optional(),
  registrationNumber: s.string().optional()
})

interface QuickAddState {
  kind: 'exporter' | 'business'
  role?: 'consignee' | 'buyer' | 'thirdParty' | 'itemThirdParty'
  invoiceIndex?: number
  itemIndex?: number
}

interface QuickBranchState {
  kind: 'exporter' | 'business'
  ownerId: number
  branchName: BranchPath
}

export function BillEditor({ bill }: { bill?: SavedBill }) {
  const refData = useReferenceData()

  const formCtx = useForm<ShippingBillFormValues>(billSchema, {
    defaultValues: bill?.values ?? emptyBill()
  })

  const { control, setValue, formState, watch, getValues } = formCtx.hooks
  const values = watch()

  // Field arrays for dynamic nested collections
  const {
    fields: invoiceFields,
    append: addInvoice,
    remove: removeInvoice
  } = useFieldArray({ control, name: 'invoices' })

  const {
    fields: containerFields,
    append: addContainer,
    remove: removeContainer
  } = useFieldArray({ control, name: 'containers' })

  const {
    fields: packingRangeFields,
    append: addPackingRange,
    remove: removePackingRange
  } = useFieldArray({ control, name: 'packingRanges' })

  const {
    fields: documentFields,
    append: addDocument,
    remove: removeDocument
  } = useFieldArray({ control, name: 'documents' })

  const {
    fields: licenseFields,
    append: addLicense,
    remove: removeLicense
  } = useFieldArray({ control, name: 'licenses' })

  const [activeTab, setActiveTab] = useState('details')
  const [draftId, setDraftId] = useState<number | undefined>(bill?.id)
  const [isSaving, setIsSaving] = useState(false)
  const [quickAdd, setQuickAdd] = useState<QuickAddState | null>(null)
  const [quickBranch, setQuickBranch] = useState<QuickBranchState | null>(null)

  // Jump to tab with validation errors on submit
  useEffect(() => {
    if (!formState.submitCount || !Object.keys(formState.errors).length) return
    toast.error('Please complete all required fields')

    const detailsFields = [
      'jobDate',
      'exporterId',
      'exporterBranchId',
      'consigneeId',
      'consigneeBranchId',
      'loadingPort',
      'finalDestinationPort'
    ]

    if (detailsFields.some((field) => field in formState.errors)) {
      setActiveTab('details')
    } else if (formState.errors.invoices) {
      setActiveTab('invoices')
    } else if (
      formState.errors.containers ||
      formState.errors.packingRanges ||
      formState.errors.documents ||
      formState.errors.licenses
    ) {
      setActiveTab('documents')
    }
  }, [formState.submitCount, formState.errors])

  async function handleSave(data: ShippingBillFormValues) {
    try {
      setIsSaving(true)
      const saved = await shippingBillService.saveBill(data, draftId)
      setDraftId(saved.id)
      toast.success(bill ? 'Shipping bill updated successfully' : 'Shipping bill created successfully')
      navigate(routes.toShippingBillEdit(saved.id))
    } catch (err: any) {
      console.error('Error saving shipping bill:', err)
      toast.error('Failed to save shipping bill')
    } finally {
      setIsSaving(false)
    }
  }

  function handleQuickSaved(party: Exporter | Business) {
    const branchId = party.branches[0]?.id
    if (!quickAdd || !branchId) return

    if (quickAdd.kind === 'exporter') {
      setValue('exporterId', String(party.id), { shouldValidate: true })
      setValue('exporterBranchId', String(branchId), { shouldValidate: true })
    } else if (quickAdd.role === 'consignee') {
      setValue('consigneeId', String(party.id), { shouldValidate: true })
      setValue('consigneeBranchId', String(branchId), { shouldValidate: true })
    } else if (quickAdd.role === 'itemThirdParty' && quickAdd.invoiceIndex != null && quickAdd.itemIndex != null) {
      setValue(`invoices.${quickAdd.invoiceIndex}.items.${quickAdd.itemIndex}.itemThirdPartyId`, String(party.id), {
        shouldValidate: true
      })
      setValue(
        `invoices.${quickAdd.invoiceIndex}.items.${quickAdd.itemIndex}.itemThirdPartyBranchId`,
        String(branchId),
        { shouldValidate: true }
      )
    } else if (quickAdd.invoiceIndex != null) {
      const field = quickAdd.role === 'buyer' ? 'buyer' : 'thirdParty'
      setValue(`invoices.${quickAdd.invoiceIndex}.${field}Id`, String(party.id), { shouldValidate: true })
      setValue(`invoices.${quickAdd.invoiceIndex}.${field}BranchId`, String(branchId), { shouldValidate: true })
    }
  }

  // Visual error indicator badges for tabs
  const hasDetailsErrors =
    formState.errors.jobDate != null ||
    formState.errors.exporterId != null ||
    formState.errors.exporterBranchId != null ||
    formState.errors.consigneeId != null ||
    formState.errors.consigneeBranchId != null ||
    formState.errors.loadingPort != null ||
    formState.errors.finalDestinationPort != null
  const hasInvoiceErrors = formState.errors.invoices != null
  const hasDocumentErrors =
    formState.errors.containers != null ||
    formState.errors.packingRanges != null ||
    formState.errors.documents != null ||
    formState.errors.licenses != null

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      <BillHeader bill={bill} draftId={draftId} isSaving={isSaving} />

      <BillSummaryBar values={values} />

      <Form ctx={formCtx} handleSubmit={handleSave} className="space-y-6">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(String(val))}>
          <TabsList className="flex w-full justify-start gap-2 overflow-x-auto border-b border-gray-200 bg-transparent p-0">
            <TabsTrigger
              value="details"
              className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 relative rounded-none bg-transparent px-4 py-2.5 text-sm font-semibold data-[state=active]:border-b-2">
              <span>1. Parties & Route</span>
              {hasDetailsErrors && <span className="ml-1.5 inline-block size-2 rounded-full bg-red-500" />}
            </TabsTrigger>

            <TabsTrigger
              value="invoices"
              className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 relative rounded-none bg-transparent px-4 py-2.5 text-sm font-semibold data-[state=active]:border-b-2">
              <span>2. Commercial Invoices & Goods ({values.invoices.length})</span>
              {hasInvoiceErrors && <span className="ml-1.5 inline-block size-2 rounded-full bg-red-500" />}
            </TabsTrigger>

            <TabsTrigger
              value="documents"
              className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 relative rounded-none bg-transparent px-4 py-2.5 text-sm font-semibold data-[state=active]:border-b-2">
              <span>3. Containers, Packing & e-Sanchit</span>
              {hasDocumentErrors && <span className="ml-1.5 inline-block size-2 rounded-full bg-red-500" />}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Parties, Route & Package */}
          <PersistentTab value="details" activeTab={activeTab}>
            <CargoPackageTab
              formCtx={formCtx}
              onQuickAdd={(kind, role) => setQuickAdd({ kind, role })}
              onAddBranch={(kind, ownerId, branchName) => setQuickBranch({ kind, ownerId, branchName })}
              cargoOptions={refData.cargoOptions}
              weightUnits={refData.weightUnits}
              sealTypes={refData.sealTypes}
              stateOptions={refData.stateOptions}
              portOptions={refData.portOptions}
              nfeiCategories={refData.nfeiCategories}
            />
          </PersistentTab>

          {/* Tab 2: Invoices & Goods */}
          <PersistentTab value="invoices" activeTab={activeTab}>
            <InvoicesTab
              formCtx={formCtx}
              invoices={values.invoices}
              invoiceFields={invoiceFields}
              onAddInvoice={() => addInvoice(emptyInvoice())}
              onRemoveInvoice={(index) => removeInvoice(index)}
              onQuickAdd={(role, invoiceIndex, itemIndex) =>
                setQuickAdd({ kind: 'business', role, invoiceIndex, itemIndex })
              }
              onAddBranch={(ownerId, branchName) => setQuickBranch({ kind: 'business', ownerId, branchName })}
              currencies={refData.currencies}
              contractTypes={refData.contractTypes}
              paymentTypes={refData.paymentTypes}
              priceInclusionTypes={refData.priceInclusionTypes}
              schemeCodes={refData.schemeCodes}
              quantityCodes={refData.quantityCodes}
              tradeAgreements={refData.tradeAgreements}
              igstPaymentOptions={refData.igstPaymentOptions}
              accessoryStatusOptions={refData.accessoryStatusOptions}
            />
          </PersistentTab>

          {/* Tab 3: Containers, Packing, e-Sanchit & Licences */}
          <PersistentTab value="documents" activeTab={activeTab}>
            <DocumentsTab
              formCtx={formCtx}
              containerFields={containerFields}
              onAddContainer={() => addContainer({ containerNumber: '' })}
              onRemoveContainer={(index) => removeContainer(index)}
              packingRangeFields={packingRangeFields}
              onAddPackingRange={() => addPackingRange({ packingNumberFrom: '', packingNumberTo: '' })}
              onRemovePackingRange={(index) => removePackingRange(index)}
              documentFields={documentFields}
              onAddDocument={() => addDocument(emptyDocument())}
              onRemoveDocument={(index) => removeDocument(index)}
              licenseFields={licenseFields}
              onAddLicense={() => addLicense({ registrationNumber: '' })}
              onRemoveLicense={(index) => removeLicense(index)}
              containerSizes={refData.containerSizes}
              containerSealTypes={refData.containerSealTypes}
              licenseSources={refData.licenseSources}
            />
          </PersistentTab>
        </Tabs>

        {/* Bottom Actions Sticky Footer */}
        <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-b-lg border-t border-gray-200 bg-white/95 px-4 py-3.5 shadow-md backdrop-blur-sm">
          <Button variant="outline" type="button" onClick={() => navigate(routes.dashboard)}>
            Discard
          </Button>

          <div className="flex items-center gap-2">
            {activeTab !== 'details' && (
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  const current = getValues()
                  void shippingBillService.saveBill(current, draftId).then((saved) => {
                    setDraftId(saved.id)
                    setActiveTab(activeTab === 'documents' ? 'invoices' : 'details')
                  })
                }}>
                ← Previous
              </Button>
            )}

            {activeTab !== 'documents' ? (
              <Button
                type="button"
                className="bg-primary-600 hover:bg-primary-700 text-white"
                onClick={(e) => {
                  e.preventDefault()
                  const current = getValues()
                  void shippingBillService.saveBill(current, draftId).then((saved) => {
                    setDraftId(saved.id)
                    toast.success('Section progress saved')
                    setActiveTab(activeTab === 'details' ? 'invoices' : 'documents')
                  })
                }}>
                Save & Continue →
              </Button>
            ) : (
              <SubmitButton className="bg-primary-600 hover:bg-primary-700 px-6 font-semibold text-white shadow-sm">
                Save & Complete Shipping Bill
              </SubmitButton>
            )}
          </div>
        </div>
      </Form>

      {/* Quick Add Party Modal Dialog */}
      {quickAdd && (
        <PartyDialog
          key={`${quickAdd.kind}-${quickAdd.role ?? 'exporter'}-${quickAdd.invoiceIndex ?? 0}`}
          kind={quickAdd.kind}
          initialRole={quickAdd.role === 'itemThirdParty' ? 'thirdParty' : quickAdd.role}
          onClose={() => setQuickAdd(null)}
          onSaved={handleQuickSaved}
        />
      )}

      {/* Quick Add Branch Modal Dialog */}
      {quickBranch && (
        <BranchDialog
          key={`${quickBranch.kind}-${quickBranch.ownerId}`}
          kind={quickBranch.kind}
          ownerId={quickBranch.ownerId}
          onClose={() => setQuickBranch(null)}
          onSaved={(branch: Branch) => setValue(quickBranch.branchName, String(branch.id), { shouldValidate: true })}
        />
      )}
    </div>
  )
}

export default function ShippingBillPage() {
  const { id } = useParams<{ id?: string }>()
  const [bill, setBill] = useState<SavedBill | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(Boolean(id))

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }

    let active = true
    setIsLoading(true)
    void shippingBillService.getBill(id).then((found) => {
      if (active) {
        setBill(found)
        setIsLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-3">
        <div className="border-primary-600 size-8 animate-spin rounded-full border-3 border-t-transparent" />
        <p className="text-sm font-medium text-gray-500">Loading shipping bill data...</p>
      </div>
    )
  }

  if (id && !bill) {
    return (
      <div className="mx-auto my-12 max-w-md space-y-4 rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Shipping Bill Not Found</h1>
        <p className="text-sm text-gray-500">
          The requested shipping bill #{id} does not exist or may have been deleted.
        </p>
        <Button onClick={() => navigate(routes.dashboard)}>Return to Shipping Bills</Button>
      </div>
    )
  }

  return <BillEditor key={id ?? 'new'} bill={bill} />
}
