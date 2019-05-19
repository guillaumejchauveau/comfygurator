import { Path } from 'dott'
import DOTT_OPTIONS from './DotTOptions'
import ComputedValue from './ComputedValue'
import NonHydratedPropertyError from './NonHydratedPropertyError'
import HydratedPropertyError from './HydratedPropertyError'
import UnknownPropertyError from './UnknownPropertyError'

export type PropertyKey = Path
export type PropertyValue<T> = ComputedValue<T, any> | T

export interface PropertyData<T> {
  key: PropertyKey,
  typeChecker?: (request: PropertyValue<T>) => boolean,
  required?: boolean
}

export default class Property<T> {
  readonly regExp: boolean
  private _value: PropertyValue<T> | Map<PropertyKey, PropertyValue<T>> | undefined
  private _required: boolean

  constructor (
    readonly key: PropertyKey,
    readonly typeChecker = (request: T) => true,
    required = true
  ) {
    this.regExp = Path.isPathContainingRegExp(key, DOTT_OPTIONS)
    this._value = undefined
    this._required = required
  }

  getRealKeys (): Iterable<PropertyKey> {
    if (!this.regExp) {
      return [this.key]
    }
    if (this._value === undefined) {
      throw new NonHydratedPropertyError(this)
    }
    return (<Map<PropertyKey, PropertyValue<any>>>this._value).keys()
  }

  getValue (realKey?: PropertyKey): PropertyValue<T> {
    if (this.required && !this.hydrated) {
      throw new NonHydratedPropertyError(this)
    }
    if (!this.regExp) {
      return <PropertyValue<T>>this._value
    }
    if (realKey === undefined) {
      throw new Error(`Property '${this.key}' contains multiple values`)
    }
    const value = (<Map<PropertyKey, PropertyValue<T>>>this._value).get(<PropertyKey>realKey)
    if (value === undefined) {
      throw new UnknownPropertyError(realKey)
    }
    return value
  }

  setValue (request: PropertyValue<T>, realKey?: PropertyKey) {
    if (!this.regExp) {
      if (this.hydrated) {
        throw new HydratedPropertyError(this)
      }
      this._value = request
      return
    }

    if (realKey === undefined) {
      throw new Error(`Property '${this.key}' contains multiple values`)
    }

    const fRequestKey = <Path.Part[]>Path.format(realKey, DOTT_OPTIONS)
    const fPropertyKey = <Path.Part[]>Path.format(this.key, DOTT_OPTIONS)
    if (fRequestKey.length !== fPropertyKey.length || !Path.arePathsRelated(realKey, this.key, DOTT_OPTIONS)) {
      throw new Error()
    }
    if (this._value === undefined) {
      this._value = new Map()
    }
    (<Map<PropertyKey, PropertyValue<T>>>this._value).set(realKey, request)
  }

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
