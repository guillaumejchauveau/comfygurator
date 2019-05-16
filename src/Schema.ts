import DotT, { Path as DotTPath } from 'dott'

import Property, { PropertyData, PropertyKey, PropertyValue } from './Property'
import ComputedValue from './ComputedValue'
import ObjectValue from './ObjectValue'
import DuplicatePropertyError from './DuplicatePropertyError'
import RelatedPropertiesError from './RelatedPropertiesError'
import UnknownPropertyError from './UnknownPropertyError'
import StringTemplateValue from './StringTemplateValue'

export default class Schema {
  /**
   * Constructors excluded for DotT operations.
   */
  private readonly exclude: Function[]

  /**
   * Registered properties.
   */
  private readonly properties: {
    [propertyKey: string]: Property<any>
  }

  /**
   * Creates a Schema. A Schema can be used to describe the properties, of an
   * object, required or not. The values for each properties must be hydrated to
   * obtain the final object.
   *
   * @param {Array<Function>} excludedConstructors Constructors excluded for DotT operations.
   */
  constructor (excludedConstructors?: Function[]) {
    this.exclude = [ComputedValue, ObjectValue, ...(excludedConstructors || [])]
    this.properties = {}
  }

  get propertyKeys (): string[] {
    return Object.keys(this.properties)
  }

  static fromArray (
    propertiesData: PropertyData<any>[],
    defaultData = {},
    excludedConstructors?: Function[]
  ): Schema {
    const schema = new Schema(excludedConstructors)

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
    return this.properties.hasOwnProperty(PropertyKey.format(propertyKey))
  }

  addProperty (property: Property<any>) {
    if (this.hasProperty(property.key)) {
      throw new DuplicatePropertyError(property)
    }

    for (const propertyKey of this.propertyKeys) {
      if (DotTPath.arePathsRelated(property.key, propertyKey)) {
        throw new RelatedPropertiesError(property, this.properties[propertyKey])
      }
    }

    this.properties[property.key] = property
  }

  hydrate (requestTree: object) {
    const requestTreeNav = new DotT(requestTree, {
      pathType: DotTPath.Types.Leaf,
      exclude: this.exclude
    })
    const propertyKeys = requestTreeNav.paths()

    for (const propertyKey of propertyKeys) {
      const request = requestTreeNav.get(propertyKey)[0]
      this.hydrateProperty(propertyKey, request)
    }
  }

  hydrateProperty (propertyKey: PropertyKey, request: PropertyValue<any>) {
    if (!this.hasProperty(propertyKey)) {
      throw new UnknownPropertyError(propertyKey)
    }

    const property = this.properties[PropertyKey.format(propertyKey)]
    if (StringTemplateValue.isStringTemplate(request)) {
      request = new StringTemplateValue(request)
    }
    property.value = request
  }

  compute (context?: any): object {
    const computedPropertiesNav = new DotT(
      new Object(),
      {
        force: true,
        exclude: this.exclude
      }
    )

    for (const property of Object.values(this.properties)) {
      let value = property.value
      if (value instanceof ComputedValue) {
        if (context === undefined) {
          throw new Error(
            `No context provided to compute the value of property '${property.key}'`
          )
        }

        value = value.compute(context)
        if (!property.typeChecker(value)) {
          throw new TypeError(
            `Computed value requested for property '${property.key}' returns invalid type`
          )
        }
      } else if (value instanceof ObjectValue) {
        value = value.value
      }
      if (!property.typeChecker(value)) {
        throw new TypeError(
          `Value requested for property '${property.key}' has invalid type`
        )
      }
      computedPropertiesNav.put(property.key, value)
    }

    return computedPropertiesNav.value
  }
}
