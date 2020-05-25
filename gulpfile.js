const { series, watch } = require('gulp')
const { rollup } = require('rollup')
const { eslint } = require('rollup-plugin-eslint')
const del = require('del')

let bs = null

const notifyBrowser = message => bs && bs.notify(message)

async function build () {
  notifyBrowser('Compiling punkte...')

  const bundle = await rollup({
    input: './src/main.js',
    plugins: [
      eslint({
        throwOnError: true,
        throwOnWarning: true
      })
    ]
  })

  await bundle.write({
    file: 'dist/punkte.js',
    format: 'es'
  })
}

async function buildDemo () {
  notifyBrowser('Compiling demo of punkte...')

  const bundle = await rollup({
    input: './demo/demo.js',
    plugins: [
      eslint({
        throwOnError: true,
        throwOnWarning: true
      })
    ]
  })

  await bundle.write({
    file: 'demo/bundle.js',
    format: 'iife'
  })
}

async function clean () {
  notifyBrowser('Cleaning punkte...')

  return del(['dist', 'demo/bundle.js'])
}

async function dev () {
  bs = require('browser-sync').create()

  async function reloadBrowser () {
    bs.reload()
  }

  bs.init({
    server: './demo',
    open: false
  })

  watch('./src/**', series(build, buildDemo, reloadBrowser))
}

exports.build = build
exports.buildDemo = buildDemo
exports.clean = clean
exports.dev = dev
exports.default = build
