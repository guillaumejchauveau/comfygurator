import DotT, { Path as DotTPath } from 'dott'

import DOTT_OPTIONS from './DotTOptions'
import Property, { PropertyData, PropertyKey, PropertyValue } from './Property'
import ComputedValue from './ComputedValue'
import DuplicatePropertyError from './DuplicatePropertyError'
import RelatedPropertiesError from './RelatedPropertiesError'
import UnknownPropertyError from './UnknownPropertyError'
import StringTemplateValue from './StringTemplateValue'

export default class Schema {
  /**
   * Registered properties.
   */
  private readonly properties: Map<PropertyKey, Property<any>>

  /**
   * Creates a Schema. A Schema can be used to describe the properties, of an
   * object, required or not. The values for each properties must be hydrated to
   * obtain the final object.
   */
  constructor () {
    this.properties = new Map<PropertyKey, Property<any>>()
  }

  get propertyKeys (): Iterable<PropertyKey> {
    return this.properties.keys()
  }

  static fromArray (
    propertiesData: PropertyData<any>[],
    defaultData = {}
  ): Schema {
    const schema = new Schema()

    for (let propertyData of propertiesData) {
      propertyData = Object.assign({}, defaultData, propertyData)
      schema.addProperty(
        new Property(
          propertyData.key,
          propertyData.typeChecker,
          propertyData.required
        )
      )
    }
    return schema
  }

  hasProperty (propertyKey: PropertyKey): boolean {
    return this.properties.has(propertyKey)
  }

  addProperty (property: Property<any>) {
    if (this.hasProperty(property.key)) {
      throw new DuplicatePropertyError(property)
    }

    for (const propertyEntry of this.properties) {
      if (DotTPath.arePathsRelated(property.key, propertyEntry[0], DOTT_OPTIONS)) {
        throw new RelatedPropertiesError(property, propertyEntry[1])
      }
    }
    this.properties.set(property.key, property)
  }

  hydrate (requestTree: object) {
    const requestTreeNav = new DotT(requestTree, Object.assign(
      {},
      DOTT_OPTIONS,
      {
        enableSpecialParts: false,
        pathType: DotTPath.Types.Any
      }
    ))

    // Extracts all paths from the request tree and formats them for comparison.
    const requestPaths = requestTreeNav.paths().map(path => DotTPath.format(path, DOTT_OPTIONS))
    for (const propertyKey of this.properties.keys()) {
      // Filters every path from the request tree that matches the current property.
      for (const matchedPath of requestPaths.filter(requestPath =>
        DotTPath.format(propertyKey, DOTT_OPTIONS).length === requestPath.length &&
        DotTPath.arePathsRelated(propertyKey, requestPath, DOTT_OPTIONS)
      )) {
        this.hydrateProperty(
          propertyKey,
          requestTreeNav.get(matchedPath)[0],
          <string>DotTPath.format(matchedPath, {
            pathFormat: DotTPath.Formats.String
          })
        )
      }
    }
  }

  hydrateProperty (propertyKey: PropertyKey, request: PropertyValue<any>, realPropertyKey?: string) {
    if (!this.hasProperty(propertyKey)) {
      throw new UnknownPropertyError(propertyKey)
    }

    const property = this.properties.get(propertyKey)
    if (StringTemplateValue.isStringTemplate(request)) {
      request = new StringTemplateValue(request)
    }
    (<Property<any>>property).setValue(request, realPropertyKey)
  }

  compute (context?: any): object {
    const computedPropertiesNav = new DotT(
      new Object(),
      DOTT_OPTIONS
    )

    for (const property of this.properties.values()) {
      for (const key of property.getRealKeys()) {
        let value = property.getValue(key)
        if (value instanceof ComputedValue) {
          if (context === undefined) {
            throw new Error(
              `No context provided to compute the value of property '${key}'`
            )
          }

          value = value.compute(context)
          if (!property.typeChecker(value)) {
            throw new TypeError(
              `Computed value requested for property '${key}' returns invalid type`
            )
          }
        }
        if (!property.typeChecker(value)) {
          throw new TypeError(
            `Value requested for property '${key}' has invalid type`
          )
        }
        computedPropertiesNav.put(key, value)
      }
    }
    return computedPropertiesNav.value
  }
}
