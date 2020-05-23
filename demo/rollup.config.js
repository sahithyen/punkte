import { eslint } from 'rollup-plugin-eslint'

export default {
  input: 'demo.js',
  output: {
    name: 'demo',
    file: 'bundle.js',
    format: 'iife'
  },
  plugins: [
    eslint({
      throwOnError: true,
      throwOnWarning: true
    })
  ]
}
