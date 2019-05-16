import ComputedValue from './ComputedValue'
import InvalidTemplateError from './InvalidTemplateError'
import { PropertyValue } from './Property'

export interface StringTemplateContext {
  [name: string]: any
}

export default class StringTemplateValue<C extends StringTemplateContext> extends ComputedValue<string, C> {
  public static readonly TEMPLATE_VAR_START = '{'
  public static readonly TEMPLATE_VAR_STOP = '}'
  private readonly templateVars: string[]

  public static isStringTemplate (request: PropertyValue<any>): boolean {
    return typeof request === 'string' && request.includes(this.TEMPLATE_VAR_START)
  }

  constructor (readonly template: string) {
    super(context => {
      let value = template
      for (let templateVar of this.templateVars) {
        value = value.replace(
          StringTemplateValue.TEMPLATE_VAR_START + templateVar + StringTemplateValue.TEMPLATE_VAR_STOP,
          context[templateVar].toString()
        )
      }
      return value
    })

    this.templateVars = []
    let buffer: string | undefined = undefined
    for (let cursor of template) {
      switch (cursor) {
        case StringTemplateValue.TEMPLATE_VAR_START:
          if (buffer !== undefined) {
            throw new InvalidTemplateError(template)
          }
          buffer = ''
          break
        case StringTemplateValue.TEMPLATE_VAR_STOP:
          if (buffer === undefined) {
            throw new InvalidTemplateError(template)
          }
          this.templateVars.push(buffer)
          buffer = undefined
          break
        default:
          if (buffer !== undefined) {
            buffer += cursor
          }
      }
    }
    if (buffer !== undefined) {
      throw new InvalidTemplateError(template)
    }
  }
}
