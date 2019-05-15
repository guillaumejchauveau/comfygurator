export interface Context {

}

export default class ComputedValue<T> {
  constructor (protected readonly computer: (context: Context) => T) {
  }

  compute (context: Context): T {
    return this.computer(context)
  }
}
