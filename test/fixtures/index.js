const propertiesData = [
  {
    key: 'foo.bar'
  },
  {
    key: 'webpack.port'
  },
  {
    key: 'webpack.historyApiFallback'
  },
  {
    key: 'paths.output.path'
  },
  {
    key: ['paths', 'output', 'publicPath']
  }
]
const propertyKeys = [
  'foo.bar',
  'webpack.port',
  'webpack.historyApiFallback',
  'paths.output.path',
  'paths.output.publicPath'
]

module.exports = {
  propertiesData,
  propertyKeys,
  A: class {
    constructor() {
      this.test = 'a'
    }
  }
}
