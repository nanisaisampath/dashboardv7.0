import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useDashboard } from '@/context/DashboardContext';
import { CalendarIcon } from 'lucide-react';
import FileUpload from './FileUpload';
import MultiSelect from '@/components/ui/MultiSelect';

const Sidebar = () => {
  const {
    filters,
    uniqueValues,
    updateFilters,
    resetFilters,
    applyFilters,
  } = useDashboard();

  const [localFilters, setLocalFilters] = useState(filters);
  const [shouldApply, setShouldApply] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (shouldApply) {
      applyFilters();
      setShouldApply(false);
    }
  }, [filters, shouldApply, applyFilters]);

  const handleFilterChange = (name: string, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    updateFilters(localFilters);
    setShouldApply(true);
  };

  const handleRemoveFilter = (key: string) => {
    const updated = {
      ...localFilters,
      [key]: key === 'startDate' || key === 'endDate' ? null : '',
    };
    setLocalFilters(updated);
    updateFilters(updated);
    applyFilters();
  };

  return (
    <aside className="bg-sidebar text-sidebar-foreground w-80 lg:w-96 shrink-0 border-r border-sidebar-border h-screen overflow-y-auto p-4 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold">Excel Insights</h3>
        <p className="text-sm text-sidebar-foreground/70">
          Upload and analyze ticket data
        </p>
      </div>

      <FileUpload />

      <div className="flex flex-col gap-5">
        <h3 className="text-lg font-medium">Filters</h3>

        {/* Date Filters */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !localFilters.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters.startDate ? (
                    format(localFilters.startDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover" align="start">
                <Calendar
                  mode="single"
                  selected={localFilters.startDate}
                  onSelect={(date) => date && handleFilterChange("startDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !localFilters.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters.endDate ? (
                    format(localFilters.endDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover" align="start">
                <Calendar
                  mode="single"
                  selected={localFilters.endDate}
                  onSelect={(date) => date && handleFilterChange("endDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="space-y-4">
          
          <MultiSelect
            label="Client"
            options={uniqueValues.client}
            selected={localFilters.client || []}
            onChange={(values) => handleFilterChange("client", values)}
          />

          <MultiSelect
            label="Technology"
            options={uniqueValues.technology}
            selected={localFilters.technology || []}
            onChange={(values) => handleFilterChange("technology", values)}
          />

          <MultiSelect
            label="Assigned To"
            options={uniqueValues.assignedTo}
            selected={localFilters.assignedTo || []}
            onChange={(values) => handleFilterChange("assignedTo", values)}
          />
          
          <MultiSelect
            label="Request Type "
            options={uniqueValues.ticketType}
            selected={localFilters.ticketType || []}
            onChange={(values) => handleFilterChange("ticketType", values)}
          />

          <MultiSelect
            label="Status"
            options={uniqueValues.status}
            selected={localFilters.status || []}
            onChange={(values) => handleFilterChange("status", values)}
          />
        </div>

        <div className="flex flex-col gap-2 pt-4">
          <Button
            onClick={handleApplyFilters}
            size="lg"
            className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            Apply
          </Button>

          <Button
            onClick={resetFilters}
            variant="outline"
            size="lg"
            className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            Show All
          </Button>
          
        </div>
      </div>

      <div className="mt-auto text-xs text-sidebar-foreground/50 text-center">
        it soli Dashboard v1.0
      </div>
    </aside>
  );
};

export default Sidebar;
