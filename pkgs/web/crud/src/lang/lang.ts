export const lang = (
  text: string,
  args: Record<string, string> | 'en' | 'id',
  currentLang?: 'id' | 'en'
) => {
  let result = text
  for (let [i, v] of Object.entries(args)) {
    result = replaceAll(result, `[${i}]`, v)
  }

  return result
}
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace)
}
function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}
