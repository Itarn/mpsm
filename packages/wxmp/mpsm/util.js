const ARRAYTYPE = '[object Array]'
const OBJECTTYPE = '[object Object]'
const FUNCTIONTYPE = '[object Function]'
const UNDEFINEDTYPE = '[object Undefined]'
const NULLTYPE = '[object Null]'
const BOOLEANTYPE = '[object Boolean]'
const STRINGTYPE = '[object String]'
const NUMBERTYPE = '[object Number]'
const ASYNCTYPE = '[object AsyncFunction]'
const GENERATORTYPE = '[object GeneratorFunction]'

function type(obj) {
  return Object.prototype.toString.call(obj)
}

function is(typeName, obj) {
  return type(obj) === typeName
}
export function isArray(obj) {
  return is(ARRAYTYPE, obj)
}

export function isObject(obj) {
  return is(OBJECTTYPE, obj)
}

export function isFunction(obj) {
  return typeof obj === 'function'
}

export function isAsyncFunction(obj) {
  return is(ASYNCTYPE, obj)
}

export function isGeneratorFunction(obj) {
  return is(GENERATORTYPE, obj)
}

export function isUndefined(obj) {
  return is(UNDEFINEDTYPE, obj)
}

export function isNull(obj) {
  return is(NULLTYPE, obj)
}

export function isBool(obj) {
  return is(BOOLEANTYPE, obj)
}

export function isString(obj) {
  return is(STRINGTYPE, obj)
}

export function isNumber(obj) {
  return is(NUMBERTYPE, obj) && obj === obj
}

export function isNaN(obj) {
  return obj !== obj
}

export function mergeOps(firstOps = {},secondOps = {}) {
  Object.keys(firstOps).forEach((key) => {
    if (firstOps[key] === secondOps[key]) {
      return
    }
    if (isUndefined(secondOps[key])) {
      secondOps[key] = firstOps[key]
    } else if (type(firstOps[key]) !== type(secondOps[key])) {
      console.warn(`common options ${key} = ${firstOps[key]} will be overwritten by page optopns ${secondOps[key]}!`)
    } else if (isFunction(firstOps[key])) {
      const rawSecOps = secondOps[key]
      secondOps[key] = function () {
        firstOps[key].apply(this, arguments)
        return rawSecOps.apply(this, arguments)
      }
    } else if (isObject(firstOps[key])) {
      mergeOps(firstOps[key], secondOps[key])
    }
  })
  return secondOps
}

export function mergeData(changedData, oldData) {
  Object.keys(changedData).forEach(key => {
    const kArr = (key + '[]').split(/\.|\[|\]\[|\]\./g)
    kArr.pop()
    kArr.reduce((t, k, i, arr) => {
      if (i === arr.length -1) {
        t[k] = changedData[key]
      } else if (!isObject(t[k]) && !isArray(t[k])) {
        t[k] = /^\d+$/.test(arr[i + 1]) ? [] : {}
      }
      return t[k]
    }, oldData)
  })
  return oldData
}

const PAGES = []

export function getPages() {
  return PAGES
}

export function addPage(pageIns) {
  PAGES.push(pageIns)
}

export function removePage(pageIns) {
  const index = PAGES.indexOf(pageIns)
  PAGES.splice(index, 1)
}

export function currPage() {
  const pages = getCurrentPages()
  return pages[pages.length - 1]
}

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export const prefix = '_mpsm_'