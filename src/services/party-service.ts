import { getDemoData, saveBranch, saveBusiness, saveExporter } from '@/shipping-bills/demo-store'
import { MarksAndNumbersOption } from '@/shipping-bills/marks-and-numbers-source'
import { Branch, Business, Exporter } from '@/shipping-bills/model'

const MOCK_LATENCY_MS = 140

function asyncDelay<T>(data: T, delayMs = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs))
}

const marksByExporter: Record<string, MarksAndNumbersOption[]> = {
  '1000': [
    { value: 'AARAV TEXTILES / MADE IN INDIA', label: 'AARAV TEXTILES / MADE IN INDIA' },
    { value: 'ATPL / LOT NO. ______', label: 'ATPL / LOT NO. ______' },
    { value: 'AS PER PACKING LIST', label: 'AS PER PACKING LIST' }
  ],
  '1002': [
    { value: 'BLUE HARBOR EXPORTS / INDIA', label: 'BLUE HARBOR EXPORTS / INDIA' },
    { value: 'BHE / SHIPPING MARKS AS PER INVOICE', label: 'BHE / SHIPPING MARKS AS PER INVOICE' }
  ],
  '1010': [
    { value: 'APEX / GIDC KHATODARA / SURAT', label: 'APEX / GIDC KHATODARA / SURAT' },
    { value: 'CONTAINER SEAL NO AS APPLICABLE', label: 'CONTAINER SEAL NO AS APPLICABLE' }
  ]
}

/**
 * Asynchronous Party Service
 * Manages Exporters, Businesses (Consignees, Buyers, Third Parties), and Branches.
 * Decouples the UI from synchronous storage and prepares for full REST API replacement.
 */
export const partyService = {
  /**
   * Search Exporters by query (matches name, IEC, or PAN)
   */
  async searchExporters(query = ''): Promise<Exporter[]> {
    const { exporters } = getDemoData()
    const q = query.trim().toLowerCase()
    const filtered = exporters.filter((item) => {
      if (item.disabled) return false
      if (!q) return true
      return (
        item.name.toLowerCase().includes(q) || item.iec.toLowerCase().includes(q) || item.pan?.toLowerCase().includes(q)
      )
    })
    return asyncDelay(filtered)
  },

  /**
   * Fetch single Exporter by ID
   */
  async getExporterById(id: string | number): Promise<Exporter | undefined> {
    const { exporters } = getDemoData()
    const found = exporters.find((item) => String(item.id) === String(id))
    return asyncDelay(found, 60)
  },

  /**
   * Search Branches belonging to an Exporter
   */
  async getExporterBranches(exporterId: string | number, query = ''): Promise<Branch[]> {
    if (!exporterId) return asyncDelay([])
    const { exporters } = getDemoData()
    const exporter = exporters.find((item) => String(item.id) === String(exporterId))
    if (!exporter) return asyncDelay([])

    const q = query.trim().toLowerCase()
    const branches = q
      ? exporter.branches.filter(
          (b) =>
            b.branchName.toLowerCase().includes(q) ||
            b.city.toLowerCase().includes(q) ||
            b.address1.toLowerCase().includes(q)
        )
      : exporter.branches
    return asyncDelay(branches)
  },

  /**
   * Search Businesses (Consignees, Buyers, Third Parties)
   */
  async searchBusinesses(role?: 'consignee' | 'buyer' | 'thirdParty', query = ''): Promise<Business[]> {
    const { businesses } = getDemoData()
    const q = query.trim().toLowerCase()
    const filtered = businesses.filter((b) => {
      if (role === 'consignee' && !b.isConsignee) return false
      if (role === 'buyer' && !b.isBuyer) return false
      if (role === 'thirdParty' && !b.isThirdParty) return false
      if (!q) return true
      return b.name.toLowerCase().includes(q) || b.iec?.toLowerCase().includes(q)
    })
    return asyncDelay(filtered)
  },

  /**
   * Fetch single Business by ID
   */
  async getBusinessById(id: string | number): Promise<Business | undefined> {
    const { businesses } = getDemoData()
    const found = businesses.find((b) => String(b.id) === String(id))
    return asyncDelay(found, 60)
  },

  /**
   * Search Branches belonging to a Business
   */
  async getBusinessBranches(businessId: string | number, query = ''): Promise<Branch[]> {
    if (!businessId) return asyncDelay([])
    const { businesses } = getDemoData()
    const business = businesses.find((b) => String(b.id) === String(businessId))
    if (!business) return asyncDelay([])

    const q = query.trim().toLowerCase()
    const branches = q
      ? business.branches.filter(
          (b) =>
            b.branchName.toLowerCase().includes(q) ||
            b.city.toLowerCase().includes(q) ||
            b.address1.toLowerCase().includes(q)
        )
      : business.branches
    return asyncDelay(branches)
  },

  /**
   * Get Marks & Numbers options for an exporter
   */
  async getMarksAndNumbers(exporterId: string | number): Promise<MarksAndNumbersOption[]> {
    const list = marksByExporter[String(exporterId)] ?? [
      { value: 'AS PER PACKING LIST', label: 'AS PER PACKING LIST' },
      { value: 'BRAND / PRODUCT LABELS AS PER INVOICE', label: 'BRAND / PRODUCT LABELS AS PER INVOICE' }
    ]
    return asyncDelay(list)
  },

  /**
   * Quick-add a new Exporter asynchronously
   */
  async createExporter(
    data: Omit<Exporter, 'id' | 'branches'> & { id?: number; firstBranch?: Omit<Branch, 'id'> }
  ): Promise<Exporter> {
    const created = saveExporter(data)
    return asyncDelay(created)
  },

  /**
   * Quick-add a new Business (Consignee/Buyer/ThirdParty) asynchronously
   */
  async createBusiness(
    data: Omit<Business, 'id' | 'branches'> & { id?: number; firstBranch?: Omit<Branch, 'id'> }
  ): Promise<Business> {
    const created = saveBusiness(data)
    return asyncDelay(created)
  },

  /**
   * Quick-add a new Branch to an Exporter or Business asynchronously
   */
  async createBranch(
    kind: 'exporter' | 'business',
    ownerId: number,
    data: Omit<Branch, 'id'> & { id?: number }
  ): Promise<Branch> {
    const created = saveBranch(kind, ownerId, data)
    return asyncDelay(created)
  }
}
