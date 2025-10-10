// Theme utility functions for consistent styling across the application

export const themeClasses = {
  // Background colors
  bg: {
    primary: 'bg-white dark:bg-gray-900',
    secondary: 'bg-gray-50 dark:bg-gray-800',
    card: 'bg-white dark:bg-gray-800',
    sidebar: 'bg-white dark:bg-gray-900',
    topbar: 'bg-white dark:bg-gray-900',
  },
  
  // Text colors
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    accent: 'text-primary-600 dark:text-primary-400',
  },
  
  // Border colors
  border: {
    primary: 'border-gray-200 dark:border-gray-700',
    secondary: 'border-gray-300 dark:border-gray-600',
    accent: 'border-primary-500',
  },
  
  // Interactive states
  hover: {
    bg: 'hover:bg-gray-100 dark:hover:bg-gray-800',
    text: 'hover:text-gray-700 dark:hover:text-gray-300',
    accent: 'hover:text-primary-700 dark:hover:text-primary-300',
  },
  
  // Focus states
  focus: {
    ring: 'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
    border: 'focus:border-primary-500',
  },
  
  // Button variants
  button: {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600',
    ghost: 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
  },
  
  // Input styles
  input: 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400',
  
  // Navigation
  nav: {
    link: 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
    active: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  },
};

// Utility function to combine theme classes
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Theme-aware component class generator
export const getThemeClasses = (variant: keyof typeof themeClasses, key?: string) => {
  if (key && typeof themeClasses[variant] === 'object') {
    return (themeClasses[variant] as any)[key] || '';
  }
  return themeClasses[variant] || '';
};