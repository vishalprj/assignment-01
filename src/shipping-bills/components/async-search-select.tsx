import { RrCaretDown } from 'icons/rr/fi-rr-caret-down'
import { RrSearch } from 'icons/rr/fi-rr-search'
import { useEffect, useRef, useState } from 'react'
import { getFormContext, RegisterOptions, useController } from 'ui/form'
import { InputError } from 'ui/inputs/error'
import { Popover, PopoverContent, PopoverTrigger } from 'ui/interactive/popover'
import { PopoverContext } from 'ui/interactive/popover-context'
import { clsx, clsxJoin, getContext } from 'ui/utils'

export interface AsyncSearchOption {
  value: string
  label: string
  sublabel?: string
}

export interface AsyncSearchSelectProps {
  name: string
  placeholder?: string
  disabled?: boolean
  className?: string
  rules?: RegisterOptions
  deps?: React.DependencyList
  fetchOptions: (query: string) => Promise<AsyncSearchOption[]>
  getInitialLabel?: (id: string) => Promise<string>
}

/**
 * Reusable asynchronous search select component with popover dropdown,
 * debounced query fetching, initial label resolution, and form state integration.
 */
export function AsyncSearchSelect({
  name,
  placeholder = 'Search...',
  disabled = false,
  className,
  rules,
  deps = [],
  fetchOptions,
  getInitialLabel
}: AsyncSearchSelectProps) {
  const ctx = getFormContext()
  const {
    field: { onChange, value, ref }
  } = useController({
    name,
    control: ctx.hooks.control,
    rules: ctx.schema.shape[name] ?? rules,
    disabled
  })

  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<AsyncSearchOption[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const fetchOptionsRef = useRef(fetchOptions)
  fetchOptionsRef.current = fetchOptions

  const getInitialLabelRef = useRef(getInitialLabel)
  getInitialLabelRef.current = getInitialLabel

  // Fetch initial label when value changes or mounts
  useEffect(() => {
    let active = true
    if (value) {
      if (getInitialLabelRef.current) {
        void getInitialLabelRef.current(String(value)).then((lbl) => {
          if (active && lbl) setSelectedLabel(lbl)
        })
      } else {
        const found = options.find((o) => o.value === String(value))
        if (found) setSelectedLabel(found.label)
      }
    } else {
      setSelectedLabel('')
    }
    return () => {
      active = false
    }
  }, [value, ...deps])

  // Debounced search when query changes or popover opens
  useEffect(() => {
    if (!isOpen && !query) return

    let active = true
    setLoading(true)
    const timer = setTimeout(() => {
      void fetchOptionsRef
        .current(query)
        .then((results) => {
          if (active) {
            setOptions(results)
            setLoading(false)
          }
        })
        .catch(() => {
          if (active) {
            setOptions([])
            setLoading(false)
          }
        })
    }, 180)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query, isOpen, ...deps])

  return (
    <div className="w-full">
      <input type="hidden" name={name} value={value ?? ''} ref={ref} disabled={disabled} />
      <Popover placement="bottom-start" fallbackPlacements={['top-start']} onOpenCallback={(open) => setIsOpen(open)}>
        <PopoverTrigger
          className={clsxJoin(
            'group focus:border-primary-500 focus:ring-primary-500 flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs transition-colors hover:border-gray-400 focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60',
            className,
            disabled ? 'cursor-not-allowed bg-gray-50 opacity-60' : ''
          )}
          disabled={disabled}>
          <div className="flex items-center truncate text-sm">
            <span className={selectedLabel ? 'truncate font-medium text-gray-900' : 'truncate text-gray-400'}>
              {selectedLabel || placeholder}
            </span>
          </div>
          <RrCaretDown className="size-4 shrink-0 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </PopoverTrigger>
        <InputError<Record<string, any>> name={name} />
        <PopoverContent className="z-50 w-[300px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl sm:w-[360px]">
          <div className="border-b border-gray-100 bg-gray-50/70 p-2">
            <div className="relative">
              <RrSearch className="absolute top-2.5 left-2.5 size-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="focus:border-primary-500 focus:ring-primary-500 w-full rounded border border-gray-300 bg-white py-1.5 pr-2.5 pl-8 text-sm transition outline-none focus:ring-1"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-60 divide-y divide-gray-50 overflow-y-auto p-1">
            {loading ? (
              <div className="flex items-center justify-center p-4 text-xs text-gray-500">
                <span className="inline-block animate-pulse">Searching records...</span>
              </div>
            ) : options.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">No matching records found</div>
            ) : (
              options.map((opt) => (
                <OptionItem
                  key={opt.value}
                  option={opt}
                  isSelected={String(value) === opt.value}
                  onSelect={(selected) => {
                    onChange(selected.value)
                    ctx.hooks.setValue(name, selected.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true
                    })
                    setSelectedLabel(selected.label)
                    setQuery('')
                  }}
                />
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function OptionItem({
  option,
  isSelected,
  onSelect
}: {
  option: AsyncSearchOption
  isSelected: boolean
  onSelect: (opt: AsyncSearchOption) => void
}) {
  const { setOpen } = getContext(PopoverContext)

  return (
    <div
      onClick={() => {
        onSelect(option)
        setOpen(false)
      }}
      className={clsx(
        'flex cursor-pointer flex-col rounded px-2.5 py-2 text-sm transition-colors',
        isSelected ? 'bg-primary-50 text-primary-950 font-semibold' : 'text-gray-800 hover:bg-gray-100'
      )}>
      <span className="truncate">{option.label}</span>
      {option.sublabel && <span className="truncate text-xs text-gray-500">{option.sublabel}</span>}
    </div>
  )
}
