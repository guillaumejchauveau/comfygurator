import test from 'ava'

import ComputedValue, {Context} from '../lib/ComputedValue'

test('computed value', t => {
  /**
   * @implements {Context}
   */
  const context = {
    foo: 'bar'
  }
  const cv = new ComputedValue(function() {return this})
  t.deepEqual(context, cv.compute(context))
})
