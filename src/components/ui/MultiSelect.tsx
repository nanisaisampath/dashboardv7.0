"use client"

import type React from "react"
import { useState, useMemo, useCallback } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Search, X } from "lucide-react"

interface MultiSelectProps {
  label: string
  options: string[]
  selected: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  maxDisplayItems?: number
  className?: string
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  maxDisplayItems = 2,
  className = "",
}) => {
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // Memoize filtered options to prevent unnecessary recalculations
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options
    return options.filter((option) => option.toLowerCase().includes(search.toLowerCase()))
  }, [options, search])

  // Check if all options are selected
  const isAllSelected = useMemo(() => {
    return selected.length === options.length
  }, [selected.length, options.length])

  // Handle individual option toggle
  const toggleOption = useCallback(
    (option: string) => {
      const newSelected = selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]
      onChange(newSelected)
    },
    [selected, onChange],
  )

  // Handle select all
  const handleSelectAll = useCallback(() => {
    onChange(options)
  }, [options, onChange])

  // Handle clear all
  const handleClearAll = useCallback(() => {
    setSearch("")
    onChange([])
  }, [onChange])

  // Remove individual selected item
  const removeSelectedItem = useCallback(
    (item: string, e: React.MouseEvent) => {
      e.stopPropagation()
      const newSelected = selected.filter((selectedItem) => selectedItem !== item)
      onChange(newSelected)
    },
    [selected, onChange],
  )

  // Clear search when popover closes
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setSearch("")
    }
  }, [])

  // Render selected items display
  const renderSelectedItems = () => {
    if (selected.length === 0) {
      return <span className="text-muted-foreground text-sm">{placeholder}</span>
    }

    if (isAllSelected) {
      return <span className="text-sm font-medium">All selected</span>
    }

    return (
      <div className="flex flex-wrap gap-1 max-w-full">
        {selected.slice(0, maxDisplayItems).map((item) => (
          <Badge
            key={item}
            variant="secondary"
            className="text-xs px-2 py-0.5 max-w-[120px] truncate hover:bg-secondary/80 transition-colors"
          >
            <span className="truncate">{item}</span>
            <X
              className="ml-1 h-3 w-3 hover:bg-destructive/20 rounded-full cursor-pointer transition-colors"
              onClick={(e) => removeSelectedItem(item, e)}
            />
          </Badge>
        ))}
        {selected.length > maxDisplayItems && (
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            +{selected.length - maxDisplayItems} more
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-between w-full min-h-10 h-auto py-2 px-3 text-left hover:bg-accent/50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex-1 overflow-hidden">{renderSelectedItems()}</div>
            <ChevronDown
              className={`ml-2 h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 shadow-lg border"
          side="bottom"
          align="start"
          sideOffset={4}
        >
          <div className="p-3 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search options..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center text-xs border-b pb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                disabled={isAllSelected}
                className="h-8 px-3 text-xs hover:bg-accent transition-colors"
              >
                Select All ({options.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={selected.length === 0}
                className="h-8 px-3 text-xs hover:bg-accent transition-colors"
              >
                Clear All
              </Button>
            </div>

            {/* Selected Count */}
            {selected.length > 0 && (
              <div className="text-xs text-muted-foreground px-1">
                {selected.length} of {options.length} selected
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = selected.includes(option)
                  const isAllOption = option === "All"

                  return (
                    <div
                      key={option}
                      className={`flex items-center w-full py-3 px-3 rounded-md cursor-pointer transition-all duration-200 group select-none ${
                        isSelected
                          ? isAllOption
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => toggleOption(option)}
                    >
                      <div className="flex items-center space-x-3 w-full pointer-events-none">
                        <Checkbox
                          id={`option-${option}`}
                          checked={isSelected}
                          className={`shrink-0 ${
                            isSelected
                              ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-600"
                              : ""
                          }`}
                        />
                        <label
                          htmlFor={`option-${option}`}
                          className={`text-sm truncate flex-1 transition-colors ${
                            isSelected ? "text-white font-medium" : "group-hover:text-foreground"
                          }`}
                          title={option}
                        >
                          {option}
                        </label>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">No options found</p>
                  {search && <p className="text-xs text-muted-foreground mt-1">Try adjusting your search</p>}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default MultiSelect
