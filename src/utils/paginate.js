/**
 * 将数组分页，返回指定页码的数据片段
 * @param {Array} array - 原始数组
 * @param {number} pageSize - 每页最多项数（必须为正整数）
 * @param {number} pageNumber - 页码（从1开始）
 * @returns {Array} 对应页码的数据数组，如果页码超出范围则返回空数组
 */
export function paginate(array, pageSize, pageNumber) {
  // 参数校验：确保数组存在，且每页条数和页码为有效数字
  if (!Array.isArray(array) || pageSize <= 0 || pageNumber < 1) {
    return []
  }

  const startIndex = (pageNumber - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, array.length)

  // 如果起始索引超出数组长度，返回空数组
  if (startIndex >= array.length) {
    return []
  }

  return array.slice(startIndex, endIndex)
}

// 使用示例：
// const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// console.log(paginate(data, 3, 1)); // [1, 2, 3]
// console.log(paginate(data, 3, 2)); // [4, 5, 6]
// console.log(paginate(data, 3, 4)); // [10] （最后一页）
// console.log(paginate(data, 3, 5)); // [] （超出范围）
