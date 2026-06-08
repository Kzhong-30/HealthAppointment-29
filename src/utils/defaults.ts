import type { DesignSystemConfig } from '../types'

export const defaultConfig: DesignSystemConfig = {
  name: 'My Design System',
  version: '1.0.0',
  colors: {
    primary: [
      { name: '50', value: '#eff6ff' },
      { name: '100', value: '#dbeafe' },
      { name: '200', value: '#bfdbfe' },
      { name: '300', value: '#93c5fd' },
      { name: '400', value: '#60a5fa' },
      { name: '500', value: '#3b82f6' },
      { name: '600', value: '#2563eb' },
      { name: '700', value: '#1d4ed8' },
      { name: '800', value: '#1e40af' },
      { name: '900', value: '#1e3a8a' }
    ],
    secondary: [
      { name: '50', value: '#fdf4ff' },
      { name: '100', value: '#fae8ff' },
      { name: '200', value: '#f5d0fe' },
      { name: '300', value: '#f0abfc' },
      { name: '400', value: '#e879f9' },
      { name: '500', value: '#d946ef' },
      { name: '600', value: '#c026d3' },
      { name: '700', value: '#a21caf' },
      { name: '800', value: '#86198f' },
      { name: '900', value: '#701a75' }
    ],
    neutral: [
      { name: '50', value: '#fafafa' },
      { name: '100', value: '#f4f4f5' },
      { name: '200', value: '#e4e4e7' },
      { name: '300', value: '#d4d4d8' },
      { name: '400', value: '#a1a1aa' },
      { name: '500', value: '#71717a' },
      { name: '600', value: '#52525b' },
      { name: '700', value: '#3f3f46' },
      { name: '800', value: '#27272a' },
      { name: '900', value: '#18181b' }
    ]
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSizes: [
      { name: 'xs', value: '12px' },
      { name: 'sm', value: '14px' },
      { name: 'base', value: '16px' },
      { name: 'lg', value: '18px' },
      { name: 'xl', value: '20px' },
      { name: '2xl', value: '24px' },
      { name: '3xl', value: '30px' },
      { name: '4xl', value: '36px' },
      { name: '5xl', value: '48px' },
      { name: '6xl', value: '60px' }
    ],
    lineHeights: [
      { name: 'tight', value: 1.2 },
      { name: 'normal', value: 1.5 },
      { name: 'relaxed', value: 1.75 }
    ]
  },
  spacing: {
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '6': '24px',
    '8': '32px',
    '12': '48px',
    '16': '64px'
  },
  borderRadius: {
    none: '0px',
    sm: '2px',
    base: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px'
  },
  shadows: {
    levels: [
      { name: 'sm', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
      { name: 'base', value: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)' },
      { name: 'md', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)' },
      { name: 'lg', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)' },
      { name: 'xl', value: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' },
      { name: '2xl', value: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }
    ]
  }
}

export const collaboratorColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6',
  '#ec4899', '#f43f5e'
]

export const collaboratorNames = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Evan',
  'Fiona', 'George', 'Hannah', 'Ivan', 'Julia'
]
