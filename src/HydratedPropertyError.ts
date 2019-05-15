import Property from './Property'

export default class HydratedPropertyError extends Error {
  constructor (readonly property: Property<any>) {
    super(`Property '${property.key}' is already hydrated`)
  }
}
