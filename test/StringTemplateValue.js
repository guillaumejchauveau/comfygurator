import test from 'ava'
import StringTemplateValue, { StringTemplateContext } from '../lib/StringTemplateValue'
import Schema from '../lib/Schema'
import Property from '../lib/Property'

test('isStringTemplate', t => {
  t.true(StringTemplateValue.isStringTemplate('my{var}template'))
  t.false(StringTemplateValue.isStringTemplate('myTemplate'))
})

test('StringTemplateValue', t => {
  /**
   * @type StringTemplateContext
   */
  let context = {
    aVar: 'A',
    b: 'B'
  }
  let value = new StringTemplateValue('{aVar}template{aVar}')
  t.is('AtemplateA', value.compute(context))
  t.throws(() => {
    new StringTemplateValue('{c}').compute(context)
  })
  t.throws(() => {
    new StringTemplateValue('{c')
  })
})

test('Schema string template conversion', t => {
  let schema = new Schema()
  schema.addProperty(new Property('prop'))
  schema.hydrateProperty('prop', 'string{a}Value')
  t.deepEqual(
    schema.compute({
      a: 'Template'
    }),
    {
      prop: 'stringTemplateValue'
    }
  )
})
