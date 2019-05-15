import Property from './Property'

export default class RelatedPropertyError extends Error {
  constructor (
    readonly property1: Property<any>,
    readonly property2: Property<any>
  ) {
    super(`Properties '${property1.key}' and '${property2.key}' are related`)
  }
}
