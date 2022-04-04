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
      if (key.indexOf('.') > 0) {
        const itemAux = item[key.split('.')[0]]
        const keyAux = key.split('.')[1]
        if (reg.test(itemAux[keyAux])) {
          newList.push(item)
          break
        }
      } else if (reg.test(item[key])) {
        newList.push(item)
        break
      }
    }
  }
  return newList
}
export default searchTextInArray