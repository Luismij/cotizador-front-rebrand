/**
   * Filter object array with coincidence
   * @param {Array} list - Grid.useBreakpoint() from antd
   * @param {Array} keys - Grid.useBreakpoint() from antd
   * @param {String} text - Grid.useBreakpoint() from antd
   * @return {Array} array with coincidence
   */
const searchTextInArray = (list, keys, text) => {
  const reg = new RegExp(`${text}`, 'i')
  let newList = []
  for (const item of list) {
    for (const key of keys) {
      if (reg.test(item[key])) {
        newList.push(item)
        break
      }
    }
  }
  return newList
}
export default searchTextInArray