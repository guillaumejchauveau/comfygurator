import test from 'ava'

import Property, {PropertyKey} from '../lib/Property'
import NonHydratedPropertyError from '../lib/NonHydratedPropertyError'
import HydratedPropertyError from '../lib/HydratedPropertyError'
import ComputedValue, {Context} from '../lib/ComputedValue'
import ObjectValue from '../lib/ObjectValue'

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
  t.false(prop.status)
  t.throws(function() {
    prop.value
  }, NonHydratedPropertyError)
  t.notThrows(function() {
    prop.value = 'baz'
  })
  t.true(prop.hydrated)
  t.true(prop.status)
  t.notThrows(function() {
    prop.value
  })
  t.throws(function() {
    prop.value = 'baz2'
  }, HydratedPropertyError)

  const prop2 = new Property(['foo', 'bar'], request => true, false)
  t.false(prop2.required)
  t.true(prop2.status)
  t.notThrows(function() {
    t.is(undefined, prop2.value)
    prop2.value = 'baz'
  })
  t.true(prop.hydrated)
  t.true(prop.status)

  t.notThrows(function() {
    prop.value
  })
  t.throws(function() {
    prop.value = 'baz2'
  }, HydratedPropertyError)
})

test('property type check', t => {
  const prop = new Property('foo.bar', request => typeof request === 'string')

  t.true(prop.typeChecker('baz'))
  t.false(prop.typeChecker(42))
  t.throws(function() {
    prop.value = 42
  }, TypeError)
  t.notThrows(function() {
    prop.value = 'baz'
  })

  const prop2 = new Property('foo.bar2', request => typeof request === 'string')
  t.throws(function() {
    prop2.value = new ObjectValue(42)
  }, TypeError)
  t.notThrows(function() {
    prop2.value = new ObjectValue('baz')
  })

  const prop3 = new Property('foo.bar3', request => typeof request === 'string')
  t.notThrows(function() {
    prop3.value = new ComputedValue(function() { return 42 })
  })
  const prop4 = new Property('foo.bar4', request => typeof request === 'string')
  t.notThrows(function() {
    prop4.value = new ComputedValue(function() { return 'baz' })
  })
})
