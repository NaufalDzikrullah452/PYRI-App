export const waitUntil = (condition: number | (() => any)) => {
  return new Promise<void>(async (resolve) => {
    if (typeof condition === 'function') {
      if (await condition()) {
        resolve()
        return
      }
      let count = 0
      const c = setInterval(async () => {
        if (await condition()) {
          clearInterval(c)
          resolve()
        }
        if (count > 100) {
          clearInterval(c)
        }
      }, 100)
    } else if (typeof condition === 'number') {
      setTimeout(() => {
        resolve()
      }, condition)
    }
  })
}
