import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  ReactNode,
} from 'react';
import { addMonths } from 'date-fns';

export interface FilterState {
  startDate: Date;
  endDate: Date;
  technology: string[];
  client: string[];
  ticketType: string[];
  assignedTo: string[];
  status: string[];
  ticketNumber: string[];
}

export interface TicketData {
  id: string | number;
  date: Date | string;
  technology: string;
  client: string;
  ticketType: string;
  assignedTo: string;
  status: string;
  ticketNumber: string;
  responseTime?: number;
  satisfaction?: number;
  [key: string]: any;
}

interface DashboardContextType {
  rawData: any[] | null;
  allData: TicketData[]; // ✅ NEW
  processedData: TicketData[] | null;
  filteredData: TicketData[] | null;
  selectedTickets: TicketData[] | null;
  selectedCategory: string | null;
  selectedValue: string | null;
  filters: FilterState;
  uniqueValues: Record<keyof Omit<FilterState, 'startDate' | 'endDate'>, string[]>;
  isLoading: boolean;
  isDarkMode: boolean;
  isPanelOpen: boolean;
  updateFilters: (newFilters: Partial<FilterState>, applyImmediately?: boolean) => void;
  resetFilters: () => void;
  applyFilters: (filtersToApply?: FilterState) => void;
  loadExcelData: (data: any[]) => void;
  toggleDarkMode: () => void;
  selectTicketsByCategory: (category: string, values: string[] | string) => void;
  clearSelectedTickets: () => void;
  togglePanel: () => void;
  setSelectedTickets: (tickets: TicketData[]) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedValue: (value: string) => void;
}

export const DashboardContext = createContext<DashboardContextType>({} as DashboardContextType);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const defaultStartDate = addMonths(new Date(), -2);
  const defaultEndDate = new Date();

  const [rawData, setRawData] = useState<any[] | null>(null);
  const [allData, setAllData] = useState<TicketData[]>([]); // ✅ NEW
  const [processedData, setProcessedData] = useState<TicketData[] | null>(null);
  const [filteredData, setFilteredData] = useState<TicketData[] | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<TicketData[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterState>({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    technology: ['All'],
    client: ['All'],
    ticketType: ['All'],
    assignedTo: ['All'],
    status: ['All'],
    ticketNumber: ['All'],
  });

  const [uniqueValues, setUniqueValues] = useState<DashboardContextType['uniqueValues']>({
    technology: ['All'],
    client: ['All'],
    ticketType: ['All'],
    assignedTo: ['All'],
    status: ['All'],
    ticketNumber: ['All'],
  });

  const normalize = (val: string): string => val?.toString().toLowerCase().trim();

  const extractUniqueValues = (data: TicketData[]) => {
    const unique = {
      technology: ['All'],
      client: ['All'],
      ticketType: ['All'],
      assignedTo: ['All'],
      status: ['All'],
      ticketNumber: ['All'],
    };

    data.forEach(ticket => {
      (Object.keys(unique) as Array<keyof typeof unique>).forEach(key => {
        const value = (ticket[key] || ticket[key.charAt(0).toUpperCase() + key.slice(1)] || '').toString().trim();
        if (value && !unique[key].includes(value)) {
          unique[key].push(value);
        }
      });
    });

    return unique;
  };

  const processRawData = (data: any[]): TicketData[] =>
    data.map((row, index) => ({
      id: row.ID || `ticket-${index}`,
      ticketNumber: (row['Ticket Number'] || 'Unknown').toString().trim(),
      date: row['Assigned Date'] || 'Unknown',
      technology: (row['Technology/Platform'] || 'Unknown').toString().trim(),
      client: (row.Client || 'Unknown').toString().trim(),
      ticketType: (row['Ticket Type'] || 'Unknown').toString().trim(),
      assignedTo: (row.AssignedTo || row['Assigned to'] || 'Unassigned').toString().trim(),
      status: row.Status || 'Unknown',
      responseTime: null,
      satisfaction: null,
      ...row,
    }));

  const applyFilters = useCallback((filtersToApply?: FilterState) => {
    if (!processedData) return;

    const current = filtersToApply || filters;

    const filtered = processedData.filter(ticket => {
      const ticketDate = new Date(ticket.date);

      return (
        ticketDate >= current.startDate &&
        ticketDate <= current.endDate &&
        (current.technology.includes('All') || current.technology.map(normalize).includes(normalize(ticket.technology))) &&
        (current.client.includes('All') || current.client.map(normalize).includes(normalize(ticket.client))) &&
        (current.ticketType.includes('All') || current.ticketType.map(normalize).includes(normalize(ticket.ticketType))) &&
        (current.assignedTo.includes('All') || current.assignedTo.map(normalize).includes(normalize(ticket.assignedTo))) &&
        (current.status.includes('All') || current.status.map(normalize).includes(normalize(ticket.status))) &&
        (current.ticketNumber.includes('All') || current.ticketNumber.includes(ticket.ticketNumber))
      );
    });

    setFilteredData(filtered);
    setSelectedTickets(null);
    setSelectedCategory(null);
    setSelectedValue(null);

    const updatedUnique = extractUniqueValues(filtered);
    setUniqueValues(updatedUnique);
  }, [filters, processedData]);

  const updateFilters = (newFilters: Partial<FilterState>, applyImmediately = false) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      if (applyImmediately) applyFilters(updated);
      return updated;
    });
  };

  const resetFilters = () => {
    const reset = {
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      technology: ['All'],
      client: ['All'],
      ticketType: ['All'],
      assignedTo: ['All'],
      status: ['All'],
      ticketNumber: ['All'],
    };
    setFilters(reset);
    setFilteredData(processedData);
    setUniqueValues(extractUniqueValues(processedData || []));
  };

  const loadExcelData = (data: any[]) => {
    setIsLoading(true);
    const processed = processRawData(data);
    const unique = extractUniqueValues(processed);
    setRawData(data);
    setAllData(processed); // ✅ populate allData
    setProcessedData(processed);
    setUniqueValues(unique);
    applyFilters({ ...filters, technology: ['All'], client: ['All'], ticketType: ['All'], assignedTo: ['All'], status: ['All'], ticketNumber: ['All'] });
    setIsLoading(false);
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  const selectTicketsByCategory = (category: string, values: string[] | string) => {
    if (!filteredData) return;

    const normalizedValues = Array.isArray(values)
      ? values.map(normalize)
      : [normalize(values)];

    const tickets = filteredData.filter(item =>
      normalizedValues.includes(normalize(item[category]))
    );

    setSelectedTickets(tickets);
    setSelectedCategory(category);
    setSelectedValue(Array.isArray(values) ? values.join(', ') : values);
    setIsPanelOpen(true);
  };

  const clearSelectedTickets = () => {
    setSelectedTickets(null);
    setSelectedCategory(null);
    setSelectedValue(null);
    setIsPanelOpen(false);
  };

  const togglePanel = () => setIsPanelOpen(prev => !prev);

  useEffect(() => {
    const storedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = storedMode !== null ? JSON.parse(storedMode) : prefersDark;
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        rawData,
        allData, // ✅ exposed
        processedData,
        filteredData,
        selectedTickets,
        selectedCategory,
        selectedValue,
        filters,
        uniqueValues,
        isLoading,
        isDarkMode,
        isPanelOpen,
        updateFilters,
        resetFilters,
        applyFilters,
        loadExcelData,
        toggleDarkMode,
        selectTicketsByCategory,
        clearSelectedTickets,
        togglePanel,
        setSelectedTickets,
        setSelectedCategory,
        setSelectedValue,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
  return context;
};
