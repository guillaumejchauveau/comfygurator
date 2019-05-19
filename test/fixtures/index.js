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

module.exports = {
  propertiesData,
  A: class {
    constructor () {
      this.test = 'a'
    }
  }
}
