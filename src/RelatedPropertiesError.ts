import Property from './Property';

export default class UnknownPropertyError extends Error {
  constructor(
    readonly property1: Property,
    readonly property2: Property
  ) {
    super(`Properties '${property1.key}' and '${property2.key}' are related`)
  }
}
