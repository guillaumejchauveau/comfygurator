import { PropertyKey } from './Property';

export default class UnknownPropertyError extends Error {
  constructor(readonly propertyKey: PropertyKey) {
    super(`Property '${propertyKey}' doesn't exist`)
  }
}
