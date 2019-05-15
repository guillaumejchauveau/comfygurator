import { Path } from 'dott'
import ComputedValue from './ComputedValue'
import NonHydratedPropertyError from './NonHydratedPropertyError'
import HydratedPropertyError from './HydratedPropertyError'
import ObjectValue from './ObjectValue'

export type PropertyKey = Path
export type PropertyValue<T> = ObjectValue<T> | ComputedValue<T, any> | T
export namespace PropertyKey {
  /**
   * Formats a property key as a string.
   *
   * @param {PropertyKey} key The property key to format.
   * @returns {String}
   */
  export function format (key: PropertyKey): string {
    return <string>Path.format(key, { pathFormat: Path.Formats.String })
  }
}

export interface PropertyData<T> {
  key: PropertyKey,
  typeChecker?: (request: PropertyValue<T>) => boolean,
  required?: boolean
}

export default class Property<T> {
  readonly key: string
  readonly typeChecker: (request: T) => boolean

  constructor (
    key: PropertyKey,
    typeChecker = (request: PropertyValue<T>) => true,
    required = true
  ) {
    this.key = PropertyKey.format(key)
    this._value = undefined
    this._required = required
    this.typeChecker = typeChecker
  }

  private _value: PropertyValue<T> | undefined

  get value (): PropertyValue<T> {
    if (this.required && !this.hydrated) {
      throw new NonHydratedPropertyError(this)
    }
    return <PropertyValue<T>>this._value
  }

  set value (request: PropertyValue<T>) {
    if (this.hydrated) {
      throw new HydratedPropertyError(this)
    }
    this._value = request
  }

  private _required: boolean

  get required (): boolean {
    return this._required
  }

  get hydrated (): boolean {
    return this._value !== undefined
  }

  require () {
    this._required = true
  }
}
