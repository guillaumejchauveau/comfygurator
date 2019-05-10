import Property from './Property';

export default class DuplicatePropertyError extends Error {
  constructor(readonly property: Property) {
    super(`Property '${property.key}' already exists`)
  }
}
