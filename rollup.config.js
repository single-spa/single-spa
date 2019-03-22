import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import analyzer from 'rollup-plugin-analyzer'

const isProduction = process.env.NODE_ENV === 'production'
const useAnalyzer = process.env.ANALYZER === 'analyzer'

export default (async () => ([
  {
    input: './src/single-spa.js',
    output: {
      file: './lib/umd/single-spa.min.js',
      format: 'umd',
      name: 'singleSpa',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**'
      }),
      isProduction && (await import('rollup-plugin-terser')).terser(),
      useAnalyzer && analyzer()
    ]
  },
  {
    input: './src/single-spa.js',
    output: {
      file: './lib/esm/single-spa.min.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**'
      }),
      isProduction && (await import('rollup-plugin-terser')).terser(),
      useAnalyzer && analyzer()
    ]
  }
]))()