/**
   * Returns either ascending or descending value
   * @param {Object} a - antd Table sorter param a
   * @param {Object} b - antd Table sorter param b
   * @param {String} key - object key for compare
   * @return {any} a value minus b value
   */
const antdTableSorter = (a, b, key) => {
  if (typeof a[key] === 'number' && typeof b[key] === 'number') {
    return a[key] - b[key]
  }

  if (typeof a[key] === 'string' && typeof b[key] === 'string') {
    a = a[key].toLowerCase();
    b = b[key].toLowerCase();
    return a > b ? -1 : b > a ? 1 : 0;
  }

  if (typeof a[key] === 'boolean' && typeof b[key] === 'boolean') {
    return a ? true : false
  }
  return
}

export default antdTableSorter