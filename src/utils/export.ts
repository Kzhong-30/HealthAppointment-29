import type { DesignSystemConfig } from '../types'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportCSSVariables(config: DesignSystemConfig) {
  let css = `:root {\n`
  css += `  /* ${config.name} v${config.version} */\n\n`

  css += `  /* === Colors === */\n`
  config.colors.primary.forEach(c => {
    css += `  --color-primary-${c.name}: ${c.value};\n`
  })
  css += `\n`
  config.colors.secondary.forEach(c => {
    css += `  --color-secondary-${c.name}: ${c.value};\n`
  })
  css += `\n`
  config.colors.neutral.forEach(c => {
    css += `  --color-neutral-${c.name}: ${c.value};\n`
  })

  css += `\n  /* === Typography === */\n`
  css += `  --font-family: ${config.typography.fontFamily};\n\n`
  config.typography.fontSizes.forEach(f => {
    css += `  --font-size-${f.name}: ${f.value};\n`
  })
  css += `\n`
  config.typography.lineHeights.forEach(l => {
    css += `  --line-height-${l.name}: ${l.value};\n`
  })

  css += `\n  /* === Spacing === */\n`
  Object.entries(config.spacing).forEach(([key, value]) => {
    css += `  --spacing-${key}: ${value};\n`
  })

  css += `\n  /* === Border Radius === */\n`
  Object.entries(config.borderRadius).forEach(([key, value]) => {
    css += `  --radius-${key}: ${value};\n`
  })

  css += `\n  /* === Shadows === */\n`
  config.shadows.levels.forEach(s => {
    css += `  --shadow-${s.name}: ${s.value};\n`
  })

  css += `\n}\n`
  downloadFile(css, 'design-system-variables.css', 'text/css')
}

export function exportTailwindConfig(config: DesignSystemConfig) {
  const primaryColors: Record<string, string> = {}
  const secondaryColors: Record<string, string> = {}
  const neutralColors: Record<string, string> = {}

  config.colors.primary.forEach(c => { primaryColors[c.name] = c.value })
  config.colors.secondary.forEach(c => { secondaryColors[c.name] = c.value })
  config.colors.neutral.forEach(c => { neutralColors[c.name] = c.value })

  const fontSizes: Record<string, string> = {}
  config.typography.fontSizes.forEach(f => { fontSizes[f.name] = f.value })

  const lineHeights: Record<string, number> = {}
  config.typography.lineHeights.forEach(l => { lineHeights[l.name] = l.value })

  const shadows: Record<string, string> = {}
  config.shadows.levels.forEach(s => { shadows[s.name] = s.value })

  const tailwind = `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      // ${config.name} v${config.version}
      colors: {
        primary: ${JSON.stringify(primaryColors, null, 10).replace(/\n/g, '\n        ')},
        secondary: ${JSON.stringify(secondaryColors, null, 10).replace(/\n/g, '\n        ')},
        neutral: ${JSON.stringify(neutralColors, null, 10).replace(/\n/g, '\n        ')}
      },
      fontFamily: {
        sans: [${config.typography.fontFamily.split(',').map(s => s.trim()).map(s => JSON.stringify(s)).join(', ')}]
      },
      fontSize: ${JSON.stringify(fontSizes, null, 8).replace(/\n/g, '\n      ')},
      lineHeight: ${JSON.stringify(lineHeights, null, 8).replace(/\n/g, '\n      ')},
      spacing: ${JSON.stringify(config.spacing, null, 8).replace(/\n/g, '\n      ')},
      borderRadius: ${JSON.stringify(config.borderRadius, null, 8).replace(/\n/g, '\n      ')},
      boxShadow: ${JSON.stringify(shadows, null, 8).replace(/\n/g, '\n      ')}
    }
  }
}
`
  downloadFile(tailwind, 'tailwind.config.extended.js', 'application/javascript')
}

interface FigmaTokenBase {
  $type: string
  $value: unknown
}

interface FigmaTokenGroup {
  [key: string]: FigmaTokenBase | FigmaTokenGroup
}

interface FigmaTokensRoot {
  $schema: string
  _: { version: string; name: string }
  global: {
    color: { primary: FigmaTokenGroup; secondary: FigmaTokenGroup; neutral: FigmaTokenGroup }
    typography: {
      fontFamily: FigmaTokenGroup
      fontSize: FigmaTokenGroup
      lineHeight: FigmaTokenGroup
    }
    spacing: FigmaTokenGroup
    borderRadius: FigmaTokenGroup
    boxShadow: FigmaTokenGroup
  }
  [key: string]: unknown
}

export function exportFigmaTokens(config: DesignSystemConfig) {
  const tokens: FigmaTokensRoot = {
    $schema: 'https://schemas.tokens.studio/v1.json',
    _: {
      version: config.version,
      name: config.name
    },
    global: {
      color: {
        primary: {},
        secondary: {},
        neutral: {}
      },
      typography: {
        fontFamily: {
          sans: {
            $type: 'fontFamilies',
            $value: config.typography.fontFamily
          }
        },
        fontSize: {},
        lineHeight: {}
      },
      spacing: {},
      borderRadius: {},
      boxShadow: {}
    }
  }

  config.colors.primary.forEach(c => {
    tokens.global.color.primary[c.name] = { $type: 'color', $value: c.value }
  })
  config.colors.secondary.forEach(c => {
    tokens.global.color.secondary[c.name] = { $type: 'color', $value: c.value }
  })
  config.colors.neutral.forEach(c => {
    tokens.global.color.neutral[c.name] = { $type: 'color', $value: c.value }
  })

  config.typography.fontSizes.forEach(f => {
    tokens.global.typography.fontSize[f.name] = { $type: 'fontSizes', $value: f.value }
  })
  config.typography.lineHeights.forEach(l => {
    tokens.global.typography.lineHeight[l.name] = { $type: 'lineHeights', $value: `${l.value}` }
  })

  Object.entries(config.spacing).forEach(([key, value]) => {
    tokens.global.spacing[key] = { $type: 'spacing', $value: value }
  })

  Object.entries(config.borderRadius).forEach(([key, value]) => {
    tokens.global.borderRadius[key] = { $type: 'borderRadius', $value: value }
  })

  config.shadows.levels.forEach(s => {
    tokens.global.boxShadow[s.name] = { $type: 'boxShadow', $value: s.value }
  })

  downloadFile(JSON.stringify(tokens, null, 2), 'figma-tokens.json', 'application/json')
}

export async function exportPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error('Element not found:', elementId)
    return
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  })

  const imgData = canvas.toDataURL('image/png')
  const imgWidth = 210
  const pageHeight = 297
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  let heightLeft = imgHeight
  let position = 0

  const pdf = new jsPDF('p', 'mm', 'a4')
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(filename)
}
