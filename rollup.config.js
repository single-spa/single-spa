import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

const isProduction = process.env.NODE_ENV === 'production'

export default (async () => ([
  {
    input: './src/single-spa.js',
    output: {
      file: './lib/single-spa.js',
      format: 'umd',
      name: 'singleSpa',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**'
      }),
      isProduction && (await import('rollup-plugin-terser')).terser()
    ]
  },
  {
    input: './src/single-spa.js',
    output: {
      file: './lib/single-spa.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**'
      }),
      isProduction && (await import('rollup-plugin-terser')).terser()
    ]
  }
]))()