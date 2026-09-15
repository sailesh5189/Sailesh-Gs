import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown } from 'lucide-react';
import { useTheme, Theme } from '../context/ThemeContext';

interface ThemeSwitcherProps {
  variant?: 'toggle' | 'segmented';
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'toggle',
  className = '',
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'segmented') {
    return (
      <div
        id="theme-switcher-segmented"
        className={`inline-flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs ${className}`}
      >
        <button
          id="theme-btn-light"
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
            theme === 'light'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
          title="Light theme"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Light</span>
        </button>

        <button
          id="theme-btn-dark"
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
          title="Dark theme"
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Dark</span>
        </button>

        <button
          id="theme-btn-system"
          type="button"
          onClick={() => setTheme('system')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
            theme === 'system'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
          title="Match system OS"
        >
          <Laptop className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <span className="hidden sm:inline">Auto</span>
        </button>
      </div>
    );
  }

  // Default 'toggle' variant with quick toggle on main button and menu dropdown for system preference
  return (
    <div ref={dropdownRef} className={`relative inline-flex items-center ${className}`}>
      <div className="inline-flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shadow-2xs">
        {/* Direct 1-click quick toggle button */}
        <button
          id="theme-switcher-toggle"
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white rounded-l-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/80 transition-colors cursor-pointer"
          title={`Currently ${resolvedTheme === 'dark' ? 'Dark' : 'Light'} mode (${theme === 'system' ? 'System' : 'Manual'}). Click to toggle.`}
          aria-label="Toggle light and dark mode"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
          )}
          <span className="text-[11px] font-semibold hidden md:inline">
            {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>

        {/* Dropdown arrow to select Light, Dark, or System mode */}
        <button
          id="theme-switcher-menu-btn"
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="px-1.5 py-1.5 text-zinc-400 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 border-l border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 rounded-r-lg transition-colors cursor-pointer"
          title="Theme options (Light / Dark / System)"
          aria-label="Select theme options"
          aria-expanded={isDropdownOpen}
        >
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Popover Menu */}
      {isDropdownOpen && (
        <div
          id="theme-switcher-dropdown"
          className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            type="button"
            onClick={() => {
              setTheme('light');
              setIsDropdownOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
              theme === 'light'
                ? 'font-semibold text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800/60'
                : 'text-zinc-600 dark:text-zinc-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              Light
            </span>
            {theme === 'light' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              setIsDropdownOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'font-semibold text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800/60'
                : 'text-zinc-600 dark:text-zinc-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              Dark
            </span>
            {theme === 'dark' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme('system');
              setIsDropdownOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
              theme === 'system'
                ? 'font-semibold text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800/60'
                : 'text-zinc-600 dark:text-zinc-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Laptop className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              System (OS)
            </span>
            {theme === 'system' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>
        </div>
      )}
    </div>
  );
};
