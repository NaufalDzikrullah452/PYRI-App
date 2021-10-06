import find from 'lodash.find'
import { waitUntil } from 'libs/src/wait-until'
import get from 'lodash.get'
export const prepareDBClient = (dbname: string) => {
  let proxy = new Proxy(
    {},
    {
      get(_, name) {
        const post = async (params: any) => {
          const url = '/__data'

          const options = {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Sec-Fetch-Dest': 'script',
              'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify(params),
          }

          const res = await fetch(url, options)
          return await res.json()
        }

        if (name === 'query') {
          return async (q: string | [string, Record<string, any>]) => {
            // todo: process parameterized query
            if (Array.isArray(q)) return []

            const w: any = window
            w.global = w
            const sodium = (await import('sodium-universal')).default
            if (!w.Buffer) {
              w.Buffer = (await w.loadExt('dev/buffer.js')).buffer.Buffer
            }
            var nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES)
            var key = w.secret
            var message = Buffer.from(q)
            var result = Buffer.alloc(
              message.length + sodium.crypto_secretbox_MACBYTES
            )

            sodium.randombytes_buf(nonce)
            sodium.crypto_secretbox_easy(result, message, nonce, key)

            const url = '/__data/query'
            const options = {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Sec-Fetch-Dest': 'script',
                'Content-Type': 'application/base.query',
                'x-nonce': nonce.toString('hex'),
              },
              body: result,
            }

            const res = await fetch(url, options)
            return await res.json()

            return []
          }
        }

        return new Proxy(
          {},
          {
            get(_, sname) {
              return async (...params: any[]) => {
                const w = window as any

                const key = `${dbname}.${name.toString()}`
                if (sname === 'definition') {
                  if (!w.tableDefinitions) {
                    w.tableDefinitions = {}
                  }

                  if (
                    !(window as any).is_dev &&
                    localStorage[`dbdef-${name.toString()}`]
                  ) {
                    w.tableDefinitions[key] = JSON.parse(
                      localStorage[`dbdef-${name.toString()}`]
                    )
                  }

                  if (w.tableDefinitions[key]) {
                    await waitUntil(() => w.tableDefinitions[key] !== 'loading')
                    return w.tableDefinitions[key]
                  }

                  w.tableDefinitions[key] = 'loading'
                }

                // replaceNullWithUndefined(params)
                const result = await post({
                  table: name,
                  db: dbname,
                  action: sname,
                  params,
                })

                if (result && result.status === 'failed' && result.reason) {
                  console.error(
                    `db.${name.toString()}.${sname.toString()}() error: ${
                      result.reason
                    }`
                  )
                  return result
                }

                if (sname === 'definition') {
                  for (let [k, val] of Object.entries(result.columns) as any) {
                    val.type = val.type.toLowerCase()
                  }
                  const pk = find(result.columns, { pk: true })
                  result.pk = pk.name
                  w.tableDefinitions[key] = result
                  localStorage[`dbdef-${name.toString()}`] =
                    JSON.stringify(result)
                }

                return result
              }
            },
          }
        )
      },
    }
  )
  return proxy as any
}

export const prepareAllDBClient = (): any => {
  let proxy = new Proxy(
    {},
    {
      get(_, name: string) {
        return prepareDBClient(name)
      },
    }
  )
  return proxy as any
}

const replaceNullWithUndefined = (data: any) => {
  if (typeof data === 'object') {
    for (let [k, v] of Object.entries(data)) {
      if (v === null) {
        data[k] = undefined
      } else if (typeof v === 'object') {
        replaceNullWithUndefined(v)
      }
    }
  }
}
