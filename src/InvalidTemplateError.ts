export default class InvalidTemplateError extends Error {
  constructor (readonly template: string) {
    super(`Template '${template}' is invalid`)
  }
}
