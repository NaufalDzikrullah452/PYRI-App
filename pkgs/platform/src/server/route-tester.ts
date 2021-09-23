import { dirs } from 'boot'
import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  ensureDir,
  pathExists,
  writeFile,
  remove,
  readdir,
  readFile,
} from 'fs-extra'
import { join } from 'path'
export const serveTester = async (req: FastifyRequest, reply: FastifyReply) => {
  switch (true) {
    case req.url.startsWith('/__tester/save'): {
      const body: any = req.body

      if (!body.name) {
        return reply.send({
          status: 'failed',
          msg: 'Test Name cannot be empty!',
        })
      }

      const dir = join(dirs.app.web, 'cms', 'tests', body.page_id)
      await ensureDir(dir)

      if (await pathExists(join(dir, body.oldName + '.js'))) {
        await remove(join(dir, body.oldName + '.js'))
      }

      await writeFile(join(dir, body.name + '.js'), body.code)
      return reply.send({ status: 'success' })
    }
    case req.url.startsWith('/__tester/list'): {
      const arr = req.url.split('/')

      if (arr.length >= 4) {
        const id = arr.pop()
        if (parseInt(id) > 0) {
          const dir = join(dirs.app.web, 'cms', 'tests', id)
          if (await pathExists(dir)) {
            return reply.send(await readdir(dir))
          }
        }
      }
      return reply.send([])
    }
    case req.url.startsWith('/__tester/load'): {
      const arr = req.url.split('/')

      if (arr.length >= 5) {
        const name = arr.pop()
        const id = arr.pop()
        if (parseInt(id) > 0 && !!name) {
          const file = join(dirs.app.web, 'cms', 'tests', id, name + '.js')
          if (await pathExists(file)) {
            return reply.send({ code: await readFile(file, 'utf-8') })
          }
        }
      }
      return reply.send({ code: '' })
    }
    case req.url.startsWith('/__tester/del'): {
      const arr = req.url.split('/')

      if (arr.length >= 5) {
        const name = arr.pop()
        const id = arr.pop()
        if (parseInt(id) > 0 && !!name) {
          const file = join(dirs.app.web, 'cms', 'tests', id, name + '.js')
          if (await pathExists(file)) {
            await remove(file)
            return reply.send({ status: 'deleted' })
          }
        }
      }
      return reply.send({ code: '' })
    }
    case req.url.startsWith('/__tester/run'): {
      const arr = req.url.split('/')

      if (arr.length >= 5) {
        const name = arr.pop()
        const id = arr.pop()
        if (parseInt(id) > 0 && !!name) {
          const file = join(dirs.app.web);
        }
      }
    }
  }
  reply.send({ status: 'ok' })
}
