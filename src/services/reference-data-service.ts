import { documentCodes } from '@/data/e-sanchit-codes'
import { quantityCodes } from '@/data/quantity-code'
import schemeCodes from '@/data/scheme-codes'
import { stateOptions } from '@/data/states'
import { Trades } from '@/data/trade-agrements'
import { cargoOptions, contractTypes, paymentTypes, priceInclusionTypes, sealTypes, weightUnits } from '@/data/types'
import { PortOption, countries, loadingPorts, ports } from '@/shipping-bills/model'

export interface SelectOption<T = string | number> {
  value: T
  label: string
  sublabel?: string
  extra?: Record<string, any>
}

export interface SchemeCodeOption extends SelectOption<string> {
  drawback: boolean
  RODTEP: boolean
  ROSCTL: boolean
}

const DEFAULT_DELAY_MS = 120

function asyncResponse<T>(data: T, delayMs = DEFAULT_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs))
}

const currencies: SelectOption<string>[] = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' }
]

const nfeiCategories: SelectOption<string>[] = [
  { value: '01', label: '01 - Free trade sample' },
  { value: '02', label: '02 - Diplomatic goods' },
  { value: '03', label: '03 - Warranty replacement' },
  { value: '07', label: '07 - Gift parcel' },
  { value: '08', label: '08 - Other' }
]

const igstPaymentOptions: SelectOption<string>[] = [
  { value: 'NA', label: 'Not applicable' },
  { value: 'LUT', label: 'Under LUT / bond' },
  { value: 'P', label: 'Against payment' }
]

const accessoryStatusOptions: SelectOption<string>[] = [
  { value: '0', label: 'No accessory' },
  { value: '1', label: 'Included free of cost' },
  { value: '2', label: 'Entered separately' }
]

const containerSizeOptions: SelectOption<string>[] = [
  { value: '20', label: '20 ft' },
  { value: '40', label: '40 ft' },
  { value: '45', label: '45 ft' }
]

const containerSealTypeOptions: SelectOption<number>[] = [
  { value: 1, label: 'BTSL - Bottle Seal' },
  { value: 2, label: 'ESEAL - Electronic Seal' },
  { value: 3, label: 'RFID - Radio Frequency Identifier' }
]

const licenseSourceOptions: SelectOption<string>[] = [
  { value: 'I', label: 'Imported' },
  { value: 'D', label: 'Indigenous' }
]

/**
 * Asynchronous Reference Data Service
 * Simulates REST API endpoints for master and reference data.
 * Ready to be swapped with real HTTP fetch calls without modifying UI components.
 */
export const referenceDataService = {
  /**
   * Search Indian Loading Ports (code prefix 'IN')
   */
  async searchLoadingPorts(query = ''): Promise<SelectOption<string>[]> {
    const q = query.trim().toLowerCase()
    const all = loadingPorts.filter((p) => p.code.startsWith('IN'))
    const filtered = q ? all.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)) : all
    return asyncResponse(
      filtered.map((p) => ({
        value: p.code,
        label: `${p.name} · ${p.code}`,
        sublabel: `Country: ${p.countryCode}`
      }))
    )
  },

  /**
   * Search Destination & Discharge Ports
   */
  async searchDestinationPorts(query = ''): Promise<SelectOption<string>[]> {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? ports.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
      : ports
    return asyncResponse(
      filtered.map((p) => ({
        value: p.code,
        label: `${p.name} · ${p.code}`,
        sublabel: `Country: ${p.countryCode}`
      }))
    )
  },

  /**
   * Resolve port by code
   */
  async getPortByCode(code: string): Promise<PortOption | undefined> {
    const found = [...loadingPorts, ...ports].find((p) => p.code === code)
    return asyncResponse(found, 60)
  },

  /**
   * Get all ports as dropdown options (for standard selects)
   */
  async getPortOptions(): Promise<SelectOption<string>[]> {
    return asyncResponse(
      ports.map((port) => ({
        value: port.code,
        label: `${port.name} · ${port.code}`
      }))
    )
  },

  /**
   * Get Scheme Codes with drawback, RODTEP, ROSCTL flags
   */
  async getSchemeCodes(): Promise<SchemeCodeOption[]> {
    return asyncResponse(schemeCodes as SchemeCodeOption[])
  },

  /**
   * Get Quantity Units (UQC)
   */
  async getQuantityCodes(): Promise<SelectOption<string>[]> {
    return asyncResponse(quantityCodes)
  },

  /**
   * Search e-Sanchit Supporting Document Codes
   */
  async searchDocumentCodes(query = ''): Promise<SelectOption<string>[]> {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? documentCodes.filter((doc) => doc.label.toLowerCase().includes(q) || doc.value.toLowerCase().includes(q))
      : documentCodes
    return asyncResponse(
      filtered.map((doc) => ({
        value: doc.value,
        label: doc.label
      }))
    )
  },

  /**
   * Get Document Code label by value
   */
  async getDocumentCodeLabel(val: string): Promise<string> {
    const found = documentCodes.find((doc) => doc.value === val || doc.label === val)
    return asyncResponse(found ? found.label : val, 50)
  },

  /**
   * Get State Codes
   */
  async getStateOptions(): Promise<SelectOption<number>[]> {
    return asyncResponse(stateOptions)
  },

  /**
   * Get Trade Agreement Codes
   */
  async getTradeAgreements(): Promise<SelectOption<string>[]> {
    return asyncResponse(Trades)
  },

  /**
   * Get Contract Types (FOB, CIF, etc.)
   */
  async getContractTypes(): Promise<SelectOption<string>[]> {
    return asyncResponse(contractTypes)
  },

  /**
   * Get Payment Types (DP, LC, etc.)
   */
  async getPaymentTypes(): Promise<SelectOption<string>[]> {
    return asyncResponse(paymentTypes)
  },

  /**
   * Get Price Inclusion Types (Freight, Insurance, etc.)
   */
  async getPriceInclusionTypes(): Promise<SelectOption<string>[]> {
    return asyncResponse(priceInclusionTypes)
  },

  /**
   * Get Cargo Types (Packaged, Containerized, etc.)
   */
  async getCargoOptions(): Promise<SelectOption<string>[]> {
    return asyncResponse(cargoOptions)
  },

  /**
   * Get Seal Types (Self, Agency, etc.)
   */
  async getSealTypes(): Promise<SelectOption<string>[]> {
    return asyncResponse(sealTypes)
  },

  /**
   * Get Weight Units (kg, MT, etc.)
   */
  async getWeightUnits(): Promise<SelectOption<string>[]> {
    return asyncResponse(weightUnits)
  },

  /**
   * Get Currencies
   */
  async getCurrencies(): Promise<SelectOption<string>[]> {
    return asyncResponse(currencies)
  },

  /**
   * Get NFEI Categories
   */
  async getNfeiCategories(): Promise<SelectOption<string>[]> {
    return asyncResponse(nfeiCategories)
  },

  /**
   * Get IGST Payment Status Options
   */
  async getIgstPaymentOptions(): Promise<SelectOption<string>[]> {
    return asyncResponse(igstPaymentOptions)
  },

  /**
   * Get Accessory Status Options
   */
  async getAccessoryStatusOptions(): Promise<SelectOption<string>[]> {
    return asyncResponse(accessoryStatusOptions)
  },

  /**
   * Get Container Sizes
   */
  async getContainerSizes(): Promise<SelectOption<string>[]> {
    return asyncResponse(containerSizeOptions)
  },

  /**
   * Get Container Seal Types
   */
  async getContainerSealTypes(): Promise<SelectOption<number>[]> {
    return asyncResponse(containerSealTypeOptions)
  },

  /**
   * Get License Sources
   */
  async getLicenseSources(): Promise<SelectOption<string>[]> {
    return asyncResponse(licenseSourceOptions)
  },

  /**
   * Get Countries list
   */
  async getCountries(): Promise<{ value: string; label: string }[]> {
    return asyncResponse(countries)
  }
}
