import { referenceDataService, SchemeCodeOption, SelectOption } from '@/services/reference-data-service'
import { useEffect, useState } from 'react'

interface ReferenceDataState {
  currencies: SelectOption<string>[]
  contractTypes: SelectOption<string>[]
  paymentTypes: SelectOption<string>[]
  priceInclusionTypes: SelectOption<string>[]
  cargoOptions: SelectOption<string>[]
  sealTypes: SelectOption<string>[]
  weightUnits: SelectOption<string>[]
  schemeCodes: SchemeCodeOption[]
  quantityCodes: SelectOption<string>[]
  stateOptions: SelectOption<number>[]
  tradeAgreements: SelectOption<string>[]
  portOptions: SelectOption<string>[]
  nfeiCategories: SelectOption<string>[]
  igstPaymentOptions: SelectOption<string>[]
  accessoryStatusOptions: SelectOption<string>[]
  containerSizes: SelectOption<string>[]
  containerSealTypes: SelectOption<number>[]
  licenseSources: SelectOption<string>[]
  isLoading: boolean
  error: Error | null
}

let cachedData: Omit<ReferenceDataState, 'isLoading' | 'error'> | null = null

/**
 * Custom hook to load all form master reference data asynchronously.
 * Prevents hardcoding array imports in UI components and supports real-time network states.
 */
export function useReferenceData() {
  const [state, setState] = useState<ReferenceDataState>(() => ({
    currencies: cachedData?.currencies ?? [],
    contractTypes: cachedData?.contractTypes ?? [],
    paymentTypes: cachedData?.paymentTypes ?? [],
    priceInclusionTypes: cachedData?.priceInclusionTypes ?? [],
    cargoOptions: cachedData?.cargoOptions ?? [],
    sealTypes: cachedData?.sealTypes ?? [],
    weightUnits: cachedData?.weightUnits ?? [],
    schemeCodes: cachedData?.schemeCodes ?? [],
    quantityCodes: cachedData?.quantityCodes ?? [],
    stateOptions: cachedData?.stateOptions ?? [],
    tradeAgreements: cachedData?.tradeAgreements ?? [],
    portOptions: cachedData?.portOptions ?? [],
    nfeiCategories: cachedData?.nfeiCategories ?? [],
    igstPaymentOptions: cachedData?.igstPaymentOptions ?? [],
    accessoryStatusOptions: cachedData?.accessoryStatusOptions ?? [],
    containerSizes: cachedData?.containerSizes ?? [],
    containerSealTypes: cachedData?.containerSealTypes ?? [],
    licenseSources: cachedData?.licenseSources ?? [],
    isLoading: !cachedData,
    error: null
  }))

  useEffect(() => {
    if (cachedData) return

    let isMounted = true
    async function loadAll() {
      try {
        const [
          currencies,
          contractTypes,
          paymentTypes,
          priceInclusionTypes,
          cargoOptions,
          sealTypes,
          weightUnits,
          schemeCodes,
          quantityCodes,
          stateOptions,
          tradeAgreements,
          portOptions,
          nfeiCategories,
          igstPaymentOptions,
          accessoryStatusOptions,
          containerSizes,
          containerSealTypes,
          licenseSources
        ] = await Promise.all([
          referenceDataService.getCurrencies(),
          referenceDataService.getContractTypes(),
          referenceDataService.getPaymentTypes(),
          referenceDataService.getPriceInclusionTypes(),
          referenceDataService.getCargoOptions(),
          referenceDataService.getSealTypes(),
          referenceDataService.getWeightUnits(),
          referenceDataService.getSchemeCodes(),
          referenceDataService.getQuantityCodes(),
          referenceDataService.getStateOptions(),
          referenceDataService.getTradeAgreements(),
          referenceDataService.getPortOptions(),
          referenceDataService.getNfeiCategories(),
          referenceDataService.getIgstPaymentOptions(),
          referenceDataService.getAccessoryStatusOptions(),
          referenceDataService.getContainerSizes(),
          referenceDataService.getContainerSealTypes(),
          referenceDataService.getLicenseSources()
        ])

        const payload = {
          currencies,
          contractTypes,
          paymentTypes,
          priceInclusionTypes,
          cargoOptions,
          sealTypes,
          weightUnits,
          schemeCodes,
          quantityCodes,
          stateOptions,
          tradeAgreements,
          portOptions,
          nfeiCategories,
          igstPaymentOptions,
          accessoryStatusOptions,
          containerSizes,
          containerSealTypes,
          licenseSources
        }

        cachedData = payload
        if (isMounted) {
          setState({
            ...payload,
            isLoading: false,
            error: null
          })
        }
      } catch (err: any) {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: err instanceof Error ? err : new Error(String(err))
          }))
        }
      }
    }

    void loadAll()

    return () => {
      isMounted = false
    }
  }, [])

  return state
}
