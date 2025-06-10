import React from 'react';
import { DashboardProvider } from '@/context/DashboardContext';
import Sidebar from '@/components/Dashboard/Sidebar';
import SummaryCards from '@/components/Dashboard/SummaryCards';
import Charts from '@/components/Dashboard/Charts';
import ThemeToggle from '@/components/Dashboard/ThemeToggle';
import TicketPanel from '@/components/Dashboard/TicketPanel';

const Index = () => {
  return (
    <DashboardProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground dark:bg-background dark:text-foreground">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
          {/* Header */}
          <header className="border-b py-5 flex items-center justify-center bg-background dark:bg-card shadow-sm relative">
            <div className="text-center">
              <p className="font-semibold mt-1 text-3xl tracking-wide text-foreground dark:text-card-foreground">
                Digital Dashboard — Real-time view of Operations, Anywhere Anytime
              </p>
            </div>
            <div className="absolute right-6">
              <ThemeToggle />
            </div>
          </header>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-auto">
            <div className="p-6 w-full">
              
              {/* Sticky Summary Cards */}
              <div className="sticky top-0 z-50 bg-background dark:bg-card pb-2 mb-4 shadow-md">
                <SummaryCards />
              </div>

              {/* Charts */}
              <div className="w-full mb-6">
                <Charts />
              </div>

              {/* Upload prompt */}
              <div className="text-center py-12 rounded-lg border border-dashed border-muted dark:border-muted-foreground bg-muted dark:bg-muted-foreground/10">
                <p className="text-lg text-foreground dark:text-muted-foreground">
                  Upload an Excel file to see your data visualized
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Ticket Panel */}
        <TicketPanel />
      </div>
    </DashboardProvider>
  );
};

export default Index;
