
import React from 'react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/context/DashboardContext';
import { MoonIcon, SunIcon } from 'lucide-react';

const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDashboard();

  return (
    <Button
  variant="ghost"
  size="icon"
  onClick={toggleDarkMode}
  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
  className="rounded-full w-10 h-10"
  style={{
    backgroundColor: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
    border: '2px solid hsl(var(--primary))',
    boxShadow: '0 0 6px hsl(var(--primary))',
  }}
>
  {isDarkMode ? (
    <SunIcon className="h-[1.2rem] w-[1.2rem]" />
  ) : (
    <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
  )}
</Button>

  );
};

export default ThemeToggle;
