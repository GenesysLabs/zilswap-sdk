import { BN, units } from '@zilliqa-js/util'

// The following code is based on: @zilliqa-js/util/src/unit.ts.
// toPositiveQa is modified from toQa to accept arbitrary number units,
// while not accepting negative inputs.

const unitMap = new Map<units.Units, string>([
  [units.Units.Qa, '1'],
  [units.Units.Li, '1000000'], // 1e6 qa
  [units.Units.Zil, '1000000000000'], // 1e12 qa
])

const numToStr = (input: string | number | BN) => {
  if (typeof input === 'string') {
    if (!input.match(/^-?[0-9.]+$/)) {
      throw new Error(
        `while converting number to string, invalid number value '${input}', should be a number matching (^[0-9.]+).`,
      )
    }
    return input
  } else if (typeof input === 'number') {
    return String(input)
  } else if (BN.isBN(input)) {
    return input.toString(10)
  }

  throw new Error(
    `while converting number to string, invalid number value '${input}' type ${typeof input}.`,
  )
}

export const toPositiveQa = (input: string | number | BN, unitOrDecimals: units.Units | number) => {
  let inputStr = numToStr(input)

  let base : BN
  let baseNumDecimals : number

  if (typeof(unitOrDecimals) === 'number')  { // decimals
    if (unitOrDecimals < 0 || unitOrDecimals % 1 !== 0) {
      throw new Error(`Invalid decimals ${unitOrDecimals}, must be non-negative integer.`)
    }

    baseNumDecimals = unitOrDecimals
    base = new BN(10).pow(new BN(baseNumDecimals))
  } else { // unit
    const baseStr = unitMap.get(unitOrDecimals)

    if (!baseStr) {
      throw new Error(`No unit of type ${unitOrDecimals} exists.`)
    }

    baseNumDecimals = baseStr.length - 1
    base = new BN(baseStr, 10)
  }

  if (inputStr === '.') {
    throw new Error(`Cannot convert ${inputStr} to Qa.`)
  }

  // Split it into a whole and fractional part
  const comps = inputStr.split('.')
  if (comps.length > 2) {
    throw new Error(`Cannot convert ${inputStr} to Qa.`)
  }

  let [whole, fraction] = comps

  if (!whole) {
    whole = '0'
  }
  if (!fraction) {
    fraction = '0'
  }
  if (fraction.length > baseNumDecimals) {
    console.log(fraction.length, baseNumDecimals)
    throw new Error(`Cannot convert ${inputStr} to Qa.`)
  }

  while (fraction.length < baseNumDecimals) {
    fraction += '0'
  }

  const wholeBN = new BN(whole)
  const fractionBN = new BN(fraction)
  let qa = wholeBN.mul(base).add(fractionBN)

  return new BN(qa.toString(10), 10)
}