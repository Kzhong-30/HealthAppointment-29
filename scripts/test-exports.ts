import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  generateCSSVariables,
  generateTailwindConfig,
  generateFigmaTokens
} from '../src/utils/export-pure'
import { defaultConfig } from '../src/utils/defaults'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(__dirname, '../export-test-output')
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

function indentLines(content: string, prefix = '  '): string {
  return content
    .split('\n')
    .map((l, i) => (i === 0 ? l : prefix + l))
    .join('\n')
}

const cssOut = generateCSSVariables(defaultConfig)
const twOut = generateTailwindConfig(defaultConfig)
const figmaOut = generateFigmaTokens(defaultConfig)

writeFileSync(path.join(outDir, 'design-tokens.css'), cssOut, 'utf8')
writeFileSync(path.join(outDir, 'tailwind.config.extended.js'), twOut, 'utf8')
writeFileSync(path.join(outDir, 'figma-tokens.json'), figmaOut, 'utf8')

console.log('✅ CSS variables output (generated from src/utils/export-pure.ts -> generateCSSVariables):')
console.log(indentLines(cssOut, '   '))
console.log('\n✅ Tailwind config output (generateTailwindConfig) — head:')
console.log(indentLines(twOut.slice(0, 600), '   '))
console.log('\n✅ Figma tokens JSON output (generateFigmaTokens) — head:')
console.log(indentLines(figmaOut.slice(0, 600), '   '))
console.log('\n📁 Files written to:', outDir)
console.log('   -', 'design-tokens.css', '(' + cssOut.length, 'bytes)')
console.log('   -', 'tailwind.config.extended.js', '(' + twOut.length, 'bytes)')
console.log('   -', 'figma-tokens.json', '(' + figmaOut.length, 'bytes)')
