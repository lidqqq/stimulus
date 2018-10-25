import { ControllerTestCase } from "../cases/controller_test_case"
import { ValueController } from "../controllers/value_controller"

export default class ValueTests extends ControllerTestCase(ValueController) {
  fixtureHTML = `
    <div data-controller="${this.identifier}"
      data-${this.identifier}-shadowed-boolean="true"
      data-${this.identifier}-numeric="123"
      data-${this.identifier}-string="ok"
      data-${this.identifier}-json='{"one":[2,3]}'>
    </div>
  `

  "test string values"() {
    this.assert.deepEqual(this.controller.stringValue, "ok")

    this.controller.stringValue = "cool"
    this.assert.deepEqual(this.controller.stringValue, "cool")
    this.assert.deepEqual(this.get("string"), "cool")
  }

  "test numeric values"() {
    this.assert.deepEqual(this.controller.numericValue, 123)

    this.controller.numericValue = 456
    this.assert.deepEqual(this.controller.numericValue, 456)
    this.assert.deepEqual(this.get("numeric"), "456")

    this.controller.numericValue = "789" as any
    this.assert.deepEqual(this.controller.numericValue, 789)

    this.controller.numericValue = 1.23
    this.assert.deepEqual(this.controller.numericValue, 1.23)
    this.assert.deepEqual(this.get("numeric"), "1.23")

    this.controller.numericValue = Infinity
    this.assert.deepEqual(this.controller.numericValue, Infinity)
    this.assert.deepEqual(this.get("numeric"), "Infinity")

    this.controller.numericValue = "garbage" as any
    this.assert.ok(isNaN(this.controller.numericValue))
    this.assert.equal(this.get("numeric"), "garbage")
  }

  "test boolean values"() {
    this.assert.deepEqual(this.controller.shadowedBooleanValue, true)

    this.controller.shadowedBooleanValue = false
    this.assert.deepEqual(this.controller.shadowedBooleanValue, false)
    this.assert.deepEqual(this.get("shadowed-boolean"), "false")

    this.controller.shadowedBooleanValue = "" as any
    this.assert.deepEqual(this.controller.shadowedBooleanValue, true)
    this.assert.deepEqual(this.get("shadowed-boolean"), "")

    this.controller.shadowedBooleanValue = 0 as any
    this.assert.deepEqual(this.controller.shadowedBooleanValue, false)
    this.assert.deepEqual(this.get("shadowed-boolean"), "0")

    this.controller.shadowedBooleanValue = 1 as any
    this.assert.deepEqual(this.controller.shadowedBooleanValue, true)
    this.assert.deepEqual(this.get("shadowed-boolean"), "1")
  }

  "test json values"() {
    this.assert.deepEqual(this.controller.jsonValue, { "one": [2, 3] })

    this.controller.jsonValue = "hello"
    this.assert.deepEqual(this.controller.jsonValue, "hello")
    this.assert.deepEqual(this.get("json"), '"hello"')

    this.controller.jsonValue = 123.45
    this.assert.deepEqual(this.controller.jsonValue, 123.45)
    this.assert.deepEqual(this.get("json"), "123.45")

    this.controller.jsonValue = [6, 7, [8, 9, 10]]
    this.assert.deepEqual(this.controller.jsonValue, [6, 7, [8, 9, 10]])
    this.assert.deepEqual(this.get("json"), "[6,7,[8,9,10]]")

    this.controller.jsonValue = false
    this.assert.deepEqual(this.controller.jsonValue, false)
    this.assert.deepEqual(this.get("json"), "false")

    this.controller.jsonValue = null
    this.assert.deepEqual(this.controller.jsonValue, null)
    this.assert.deepEqual(this.get("json"), "null")
  }

  "test accessing a string value returns the empty string when the attribute is not present"() {
    this.controller.stringValue = undefined as any
    this.assert.notOk(this.has("string"))
    this.assert.deepEqual(this.controller.stringValue, "")
  }

  "test accessing a numeric value returns zero when the attribute is not present"() {
    this.controller.numericValue = undefined as any
    this.assert.notOk(this.has("numeric"))
    this.assert.deepEqual(this.controller.numericValue, 0)
  }

  "test accessing a boolean value returns false when the attribute is not present"() {
    this.controller.shadowedBooleanValue = undefined as any
    this.assert.notOk(this.has("shadowed-boolean"))
    this.assert.deepEqual(this.controller.shadowedBooleanValue, false)
  }

  "test accessing a json value throws when the attribute is not present"() {
    this.controller.jsonValue = undefined as any
    this.assert.notOk(this.has("json"))
    this.assert.raises(() => this.controller.jsonValue)
  }

  "test accessing a value returns its specified default when the attribute is not present"() {
    this.assert.deepEqual(this.controller.stringWithDefaultValue, "hello")
    this.assert.notOk(this.has("string-with-default"))

    this.controller.stringWithDefaultValue = "goodbye"
    this.assert.deepEqual(this.controller.stringWithDefaultValue, "goodbye")
    this.assert.deepEqual(this.get("string-with-default"), "goodbye")

    this.controller.stringWithDefaultValue = undefined as any
    this.assert.deepEqual(this.controller.stringWithDefaultValue, "hello")
    this.assert.notOk(this.has("string-with-default"))
  }

  "test accessing a value throws when the default is undefined and the attribute is not present"() {
    this.assert.notOk(this.has("string-without-default"))
    this.assert.raises(() => this.controller.stringWithoutDefaultValue)

    this.controller.stringWithoutDefaultValue = "ok"
    this.assert.deepEqual(this.controller.stringWithoutDefaultValue, "ok")
    this.assert.deepEqual(this.get("string-without-default"), "ok")
  }

  async "test changed callbacks"() {
    this.assert.deepEqual(this.controller.loggedNumericValues, [123])

    this.controller.numericValue = 0
    await this.nextFrame
    this.assert.deepEqual(this.controller.loggedNumericValues, [123, 0])

    this.set("numeric", "1")
    await this.nextFrame
    this.assert.deepEqual(this.controller.loggedNumericValues, [123, 0, 1])
  }

  async "test default values trigger changed callbacks"() {
    this.assert.deepEqual(this.controller.loggedStringWithDefaultValues, ["hello"])

    this.controller.stringWithDefaultValue = "goodbye"
    await this.nextFrame
    this.assert.deepEqual(this.controller.loggedStringWithDefaultValues, ["hello", "goodbye"])

    this.controller.stringWithDefaultValue = undefined as any
    await this.nextFrame
    this.assert.deepEqual(this.controller.loggedStringWithDefaultValues, ["hello", "goodbye", "hello"])
  }

  has(name: string) {
    return this.element.hasAttribute(this.attr(name))
  }

  get(name: string) {
    return this.element.getAttribute(this.attr(name))
  }

  set(name: string, value: string) {
    return this.element.setAttribute(this.attr(name), value)
  }

  attr(name: string) {
    return `data-${this.identifier}-${name}`
  }

  get element() {
    return this.controller.element
  }
}
