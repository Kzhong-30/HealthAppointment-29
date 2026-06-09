import type { DesignSystemConfig } from '../types'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import {
  generateCSSVariables,
  generateTailwindConfig,
  generateFigmaTokens
} from './export-pure'

export { generateCSSVariables, generateTailwindConfig, generateFigmaTokens }

function downloadFile(content: string, filename: string, mimeType: string): void {
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

export function exportCSSVariables(config: DesignSystemConfig): void {
  downloadFile(generateCSSVariables(config), 'design-system-variables.css', 'text/css')
}

export function exportTailwindConfig(config: DesignSystemConfig): void {
  downloadFile(generateTailwindConfig(config), 'tailwind.config.extended.js', 'application/javascript')
}

export function exportFigmaTokens(config: DesignSystemConfig): void {
  downloadFile(generateFigmaTokens(config), 'figma-tokens.json', 'application/json')
}

export async function exportPDF(elementId: string, filename: string): Promise<void> {
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
