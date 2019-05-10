import { Path } from 'dott'
import ComputedValue from './ComputedValue'
import NonHydratedPropertyError from './NonHydratedPropertyError'
import HydratedPropertyError from './HydratedPropertyError'
import ObjectValue from './ObjectValue'

export type PropertyKey = Path
export namespace PropertyKey {
  /**
   * Formats a property key as a string.
   *
   * @param {PropertyKey} key The property key to format.
   * @returns {String}
   */
  export function format(key: PropertyKey): string {
    return <string>Path.format(key, {pathFormat: Path.Formats.String})
  }
}

export interface PropertyData {
  key: PropertyKey,
  typeChecker?: (request: any) => boolean,
  required?: boolean
}

export default class Property {
  readonly key: string
  private _value: any
  private _required: boolean

  constructor(
    key: PropertyKey,
    readonly typeChecker=(request: any) => true,
    required=true
  ) {
    this.key = PropertyKey.format(key)
    this._value = undefined
    this._required = required
  }

  get required(): boolean {
    return this._required
  }

  require() {
    this._required = true
  }

  get hydrated(): boolean {
    return this._value !== undefined
  }

  get status(): boolean {
    return this.hydrated || !this.required
  }

  get value(): any {
    if (this.required && !this.hydrated) {
      throw new NonHydratedPropertyError(this)
    }

    return this._value
  }

  set value(request: any) {
    if (this.hydrated) {
      throw new HydratedPropertyError(this)
    }

    if (
      request instanceof ObjectValue && this.typeChecker(request.value) ||
      request instanceof ComputedValue ||
      this.typeChecker(request)
    ) {
      this._value = request
    } else {
      throw new TypeError(
        `Value requested for property '${this.key}' has invalid type`
      )
    }
  }
}
