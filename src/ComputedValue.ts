export default class ComputedValue<T, C> {
  constructor (protected readonly computer: (context: C) => T) {
  }

  compute (context: C): T {
    return this.computer(context)
  }
}
