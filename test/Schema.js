import test from 'ava'
import {propertiesData, propertyKeys, A} from './fixtures'

import Schema from '../lib/Schema'
import Property, {PropertyData} from '../lib/Property'
import NonHydratedPropertyError from '../lib/NonHydratedPropertyError'
import HydratedPropertyError from '../lib/HydratedPropertyError'
import DuplicatePropertyError from '../lib/DuplicatePropertyError'
import RelatedPropertiesError from '../lib/RelatedPropertiesError'
import UnknownPropertyError from '../lib/UnknownPropertyError'
import ComputedValue, {Context} from '../lib/ComputedValue'
import ObjectValue from '../lib/ObjectValue'

test('schema', t => {
  const sch = new Schema([A])
  sch.addProperty(new Property('foo.bar', request => typeof request === 'string'))

  t.throws(function() {
    sch.addProperty(new Property('foo.bar'))
  }, DuplicatePropertyError)
  t.notThrows(function() {
    sch.addProperty(new Property('foo.baz'))
  })

  t.throws(function() {
    sch.addProperty(new Property('foo.bar.a'))
  }, RelatedPropertiesError)

  t.throws(function() {
    sch.addProperty(new Property('foo'))
  }, RelatedPropertiesError)

  t.throws(function() {
    sch.compute()
  }, NonHydratedPropertyError)
  t.notThrows(function() {
    sch.hydrateProperty('foo.bar', 'a')
  })
  t.throws(function() {
    sch.hydrateProperty('foo.bar', 'a')
  }, HydratedPropertyError)
  t.throws(function() {
    sch.hydrateProperty('unknown', 'a')
  }, UnknownPropertyError)

  sch.hydrateProperty('foo.baz', 'b')
  t.notThrows(function() {
    t.deepEqual(sch.compute(), {foo:{bar:'a',baz:'b'}})
  })

  const schI = new Schema()
  schI.addProperty(
    new Property('doe.computedI', request => typeof request === 'string')
    )
  sch.addProperty(
    new Property('doe.computed', request => typeof request === 'string')
    )

  schI.hydrateProperty('doe.computedI', new ComputedValue(function() {return 42}))
  sch.hydrateProperty('doe.computed', new ComputedValue(function() {return '42'}))

  t.throws(function() {
    schI.compute()
  }, Error)
  t.throws(function() {
    schI.compute({})
  }, TypeError)
  t.notThrows(function() {
    sch.compute({})
  })
})

test('schema from array', t => {
  const sch = Schema.fromArray(propertiesData)

  t.deepEqual(sch.propertyKeys, propertyKeys)
  t.true(sch.hasProperty(propertiesData[4].key))
  t.notThrows(function() {
    sch.hydrate({
      foo: {
        bar: 'a'
      },
      webpack: {
        port: 'b',
        historyApiFallback: 'c'
      }
    })
  })
  t.throws(function() {
    sch.hydrate({
      paths: {
        output: {
          path: {
            bar: 'd'
          }
        }
      }
    })
  }, UnknownPropertyError)
  t.notThrows(function() {
    sch.hydrate({
      paths: {
        output: {
          path: new ObjectValue({
            bar: 'd'
          })
        }
      }
    })
  })

  t.throws(function() {
    sch.hydrate({
      paths: {
        output: {
          publicPath: new A()
        }
      }
    })
  }, UnknownPropertyError)
  const sch2 = new Schema([A])
  sch2.addProperty(new Property('foo'))
  t.notThrows(function() {
    sch2.hydrate({
      foo: new A()
    })
  })

  sch.hydrateProperty(propertiesData[4].key, 42)
  t.notThrows(function() {
    t.deepEqual(sch.compute(), {
      foo: {
        bar: 'a'
      },
      webpack: {
        port: 'b',
        historyApiFallback: 'c'
      },
      paths: {
        output: {
          path: {
            bar: 'd'
          },
          publicPath: 42
        }
      }
    })
  })
})
