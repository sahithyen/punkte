import { eslint } from 'rollup-plugin-eslint'

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/punkte.js',
    format: 'es'
  },
  plugins: [
    eslint({
      throwOnError: true,
      throwOnWarning: true
    })
  ]
}
