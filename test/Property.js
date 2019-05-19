import test from 'ava'

import Property from '../lib/Property'
import NonHydratedPropertyError from '../lib/NonHydratedPropertyError'
import HydratedPropertyError from '../lib/HydratedPropertyError'

test('property no type check', t => {
  const prop = new Property(['foo', 'bar'])
  t.true(prop.required)
  prop.require()
  t.true(prop.required)
  t.true(prop.typeChecker('baz'))
  t.false(prop.hydrated)
  t.throws(function () {
    prop.getValue()
  }, NonHydratedPropertyError)
  t.notThrows(function () {
    prop.setValue('baz')
  })
  t.true(prop.hydrated)
  t.notThrows(function () {
    prop.getValue()
  })
  t.throws(function () {
    prop.setValue('baz2')
  }, HydratedPropertyError)

  const prop2 = new Property(['foo', 'bar'], request => true, false)
  t.false(prop2.required)
  t.notThrows(function () {
    t.is(undefined, prop2.getValue())
    prop2.setValue('baz')
  })
  t.true(prop.hydrated)

  t.notThrows(function () {
    prop.getValue()
  })
  t.throws(function () {
    prop.setValue('baz2')
  }, HydratedPropertyError)
})

test('property type check', t => {
  const prop = new Property('foo.bar', request => typeof request === 'string')

  t.true(prop.typeChecker('baz'))
  t.false(prop.typeChecker(42))
})
