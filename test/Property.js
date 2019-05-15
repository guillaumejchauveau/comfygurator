import test from 'ava'

import Property, { PropertyKey } from '../lib/Property'
import NonHydratedPropertyError from '../lib/NonHydratedPropertyError'
import HydratedPropertyError from '../lib/HydratedPropertyError'

test('property key', t => {
  t.is('foo.bar', PropertyKey.format(['foo', 'bar']))
  t.is('foo.bar', PropertyKey.format('foo.bar'))
})

test('property no type check', t => {
  const key = 'foo.bar'
  const prop = new Property(['foo', 'bar'])
  t.is(key, prop.key)
  t.true(prop.required)
  prop.require()
  t.true(prop.required)
  t.true(prop.typeChecker('baz'))
  t.false(prop.hydrated)
  t.throws(function () {
    prop.value
  }, NonHydratedPropertyError)
  t.notThrows(function () {
    prop.value = 'baz'
  })
  t.true(prop.hydrated)
  t.notThrows(function () {
    prop.value
  })
  t.throws(function () {
    prop.value = 'baz2'
  }, HydratedPropertyError)

  const prop2 = new Property(['foo', 'bar'], request => true, false)
  t.false(prop2.required)
  t.notThrows(function () {
    t.is(undefined, prop2.value)
    prop2.value = 'baz'
  })
  t.true(prop.hydrated)

  t.notThrows(function () {
    prop.value
  })
  t.throws(function () {
    prop.value = 'baz2'
  }, HydratedPropertyError)
})

test('property type check', t => {
  const prop = new Property('foo.bar', request => typeof request === 'string')

  t.true(prop.typeChecker('baz'))
  t.false(prop.typeChecker(42))
})
