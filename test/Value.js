import test from 'ava'

import ComputedValue from '../lib/ComputedValue'

test('computed value', t => {
  const context = {
    foo: 'bar'
  }
  const cv = new ComputedValue(c => c)
  t.deepEqual(context, cv.compute(context))
})
