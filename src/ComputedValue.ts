export interface Context {

}

export default class ComputedValue<T> {
  constructor(protected readonly computer: () => T) {
  }

  compute(context: Context): T {
    return this.computer.bind(context)()
  }
}
