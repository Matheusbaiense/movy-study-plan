import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

// Flat config (ESLint 9). `eslint-config-next` still ships an eslintrc-style
// preset, so we bridge it with FlatCompat — this is the setup Next's official
// `next-lint-to-eslint-cli` codemod produces. Replaces the deprecated
// `next lint` wrapper (removed in Next 16).

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const compat = new FlatCompat({ baseDirectory: __dirname })

const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'next-env.d.ts', '.claude/**'],
  },
  ...compat.extends('next/core-web-vitals'),
]

export default eslintConfig
