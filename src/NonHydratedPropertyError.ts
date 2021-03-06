import Property from './Property'

export default class NonHydratedPropertyError extends Error {
  constructor (readonly property: Property<any>) {
    super(`Property '${property.key}' is not hydrated`)
  }
}
