"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useDashboard } from "@/context/DashboardContext"
import { calculateMetrics } from "@/utils/dataProcessor"
import { Badge } from "@/components/ui/badge"
import { Ticket, CheckCircle, AlertCircle, Filter, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

const SummaryCards = () => {
  const { filteredData, isLoading, filters, selectTicketsByCategory } = useDashboard()

  const metrics = React.useMemo(() => {
    if (!filteredData)
      return {
        totalTickets: 0,
        openTickets: 0,
        resolvedTickets: 0,
      }
    return calculateMetrics(filteredData)
  }, [filteredData])

  const handleOpenTicketsClick = () => {
    selectTicketsByCategory("status", ["Open", "In Progress", "Hold", "In Review"])
  }

  const handleResolvedTicketsClick = () => {
    selectTicketsByCategory("status", "Closed")
  }

  const getActiveFilters = () => {
    if (!filteredData || filteredData.length === 0) return []

    const extractUniqueValues = (key: string) => {
      const values = filteredData.map((item) => item[key]).filter((v) => v != null && v !== "")
      return [...new Set(values)].sort()
    }

    const categories = [
      { key: "technology", label: "Technology" },
      { key: "client", label: "Client" },
      { key: "ticketType", label: "Ticket Type" },
      { key: "status", label: "Status" },
      { key: "assignedTo", label: "Assigned To" },
    ]

    return categories.map(({ key, label }) => {
      const selected = filters[key]
      const allValues = extractUniqueValues(key)
      const selectedArray =
        selected === "All" || selected == null
          ? ["All"]
          : Array.isArray(selected)
          ? selected.length === 0
            ? ["All"]
            : selected
          : [selected]

      const displayValue =
        selected === "All" ||
        (Array.isArray(selected) && selected.length === 0) ||
        selected == null
          ? "All"
          : Array.isArray(selected)
          ? selected.join(", ")
          : selected

      return {
        label,
        value: displayValue,
        options: ["All", ...allValues],
        selected: selectedArray,
      }
    })
  }

  const activeFilters = getActiveFilters()
  const totalActiveFilters = activeFilters.reduce(
    (acc, filter) =>
      acc + (filter.selected && !filter.selected.includes("All") ? filter.selected.length : 0),
    0
  )

  return (
    <div className="space-y-3 pb-2">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
  Analytics Overview (MM/DD/YY)
  {filters.startDate && filters.endDate && (
    <span className="text-2xl font-bold text-gray-500 dark:text-gray-400">
      ({new Date(filters.startDate).toLocaleDateString('en-US')} - {new Date(filters.endDate).toLocaleDateString('en-US')})
    </span>
  )}
</h2>
              <p className="text-sm text-muted-foreground">Real-time insights and metrics</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm px-3 py-1 font-medium border-2 text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900 border-none rounded-full">
            <Filter className="h-4 w-4 mr-2" />
            {activeFilters.filter(f => !f.selected.includes("All")).length} Active Filters
          </Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-wrap xl:flex-nowrap gap-4">
        {/* Metric Cards */}
        <div className="flex gap-4 shrink-0">
          <MetricCard
            title="Total Tickets"
            value={isLoading ? "..." : metrics.totalTickets}
            subtitle="All time tickets"
            icon={<Ticket className="h-5 w-5" />}
            gradient="from-purple-500 to-purple-600"
            bgGradient="from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50"
            clickable={false}
            width="270px"
            height="160px"
          />

          <div onClick={handleOpenTicketsClick} className="cursor-pointer">
            <MetricCard
              title="Open Tickets"
              value={isLoading ? "..." : metrics.openTickets || 0}
              subtitle="Requires attention"
              icon={<AlertCircle className="h-5 w-5" />}
              gradient="from-amber-500 to-orange-500"
              bgGradient="from-amber-50 to-orange-100 dark:from-amber-950/50 dark:to-orange-900/50"
              clickable={true}
              width="270px"
              height="160px"
            />
          </div>

          <div onClick={handleResolvedTicketsClick} className="cursor-pointer">
            <MetricCard
              title="Resolved Tickets"
              value={isLoading ? "..." : metrics.resolvedTickets || 0}
              subtitle="Successfully closed"
              icon={<CheckCircle className="h-5 w-5" />}
              gradient="from-emerald-500 to-green-500"
              bgGradient="from-emerald-50 to-green-100 dark:from-emerald-950/50 dark:to-green-900/50"
              clickable={true}
              width="270px"
              height="160px"
            />
          </div>
        </div>

        {/* Active Filters Card */}
        <Card className="w-full border border-border bg-card shadow-lg rounded-2xl overflow-hidden">
          <div className="rounded-t-2xl bg-muted px-5 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-base font-semibold text-card-foreground flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Section Criteria
            </h3>
            <span className="text-sm text-slate-600 dark:text-slate-400">{totalActiveFilters} Active Filters</span>
          </div>

          <CardContent className="px-4 py-3">
            {activeFilters.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Filter className="h-6 w-6 mx-auto mb-2 opacity-50" />
                No active filters — showing all data
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-muted/50 px-1 pb-2">
                {activeFilters.map((filter, index) => (
                  <div
                    key={index}
                    className="shrink-0 bg-muted border border-border rounded-lg p-3 min-w-[200px] shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {filter.label}
                      </p>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {filter.selected.length > 0 ? filter.selected.length : "All"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {filter.selected.length > 0 ? (
                        filter.selected.slice(0, 6).map((option, i) => (
                          <Badge
                            key={i}
                            variant="default"
                            className="text-xs bg-primary text-primary-foreground px-2.5 py-1 rounded-full"
                          >
                            {option}
                          </Badge>
                        ))
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs text-muted-foreground border-border bg-muted px-2.5 py-1 rounded-full"
                        >
                          All
                        </Badge>
                      )}
                      {filter.selected.length > 6 && (
                        <Badge
                          variant="secondary"
                          className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full"
                        >
                          +{filter.selected.length - 6}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  gradient,
  bgGradient,
  clickable,
  width = "180px",
  height = "140px",
}) => (
  <Card
    style={{ width, height }}
    className={`group border-2 shadow-lg bg-gradient-to-br ${bgGradient} rounded-2xl overflow-hidden ${
      clickable ? "hover:scale-[1.02] hover:shadow-xl cursor-pointer" : ""
    } transition-all duration-300 ease-in-out`}
  >
    <CardContent className="p-0">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {title}
              </p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <div
            className={`p-2 rounded-lg bg-gradient-to-br ${gradient} text-white shadow-md group-hover:scale-110 transition-transform duration-200`}
          >
            {icon}
          </div>
        </div>
        {clickable && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span>Click to view details</span>
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)

export default SummaryCards
