export interface ColorSwatch {
  name: string
  value: string
}

export interface ColorSystem {
  primary: ColorSwatch[]
  secondary: ColorSwatch[]
  neutral: ColorSwatch[]
}

export interface FontSize {
  name: string
  value: string
}

export interface LineHeight {
  name: string
  value: number
}

export interface TypographySystem {
  fontFamily: string
  fontSizes: FontSize[]
  lineHeights: LineHeight[]
}

export interface SpacingSystem {
  [key: string]: string
}

export interface BorderRadiusSystem {
  [key: string]: string
}

export interface ShadowLevel {
  name: string
  value: string
}

export interface ShadowSystem {
  levels: ShadowLevel[]
}

export interface DesignSystemConfig {
  name: string
  version: string
  colors: ColorSystem
  typography: TypographySystem
  spacing: SpacingSystem
  borderRadius: BorderRadiusSystem
  shadows: ShadowSystem
}

export interface Collaborator {
  id: string
  name: string
  color: string
  lastActive: number
}

export type ExportFormat = 'pdf' | 'css' | 'tailwind' | 'figma'
