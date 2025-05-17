import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-plugin-prettier/recommended'

const files = ['./src/**/*.{js,mjs,cjs,ts,jsx,tsx}']

export default [
  {
    files,
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    ...pluginJs.configs.recommended,
  },
  ...tseslint.configs.recommended.map(config => ({ files, ...config })),
  { files, ...eslintConfigPrettier },
]
