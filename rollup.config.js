export default {
  input: 'src/index.js',
  output: [{
    file: 'lib/solid-components.js',
    format: 'cjs',
  }, {
    file: 'dist/solid-components.js',
    format: 'es'
  }],
  external: ['solid-js', 'solid-js/dom', 's-js', 'component-register']
}