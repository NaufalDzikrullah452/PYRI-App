import startCase from 'lodash.startcase'

export const niceCase = (str: string) => {
  const res = startCase(str)
  return res
    .split(' ')
    .map((e) => {
      if (e.length <= 1) {
        return ''
      }
      if (e.length <= 2) return ''
      return e
    })
    .join(' ')
    .trim()
}
