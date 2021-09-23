import { FastifyReply, FastifyRequest } from 'fastify'
import { ParentThread } from '../../../builder/src/thread'
import { CustomGlobal } from '../server'
import { isCMS } from '../system/detect'
import { CMS } from '../system/main'
import { system } from '../system/prepare'
import { cmsRoutes } from '../system/routes'
import { serveFigmaImages } from './figma-imgs'
import { dataRouter } from './route-data'
import { serveTester } from './route-tester'
import { uploadRoute } from './route-upload'
import { serveStaticFile } from './staticfile'

declare const global: CustomGlobal

export const allRoutes = async function (
  this: { parent?: ParentThread; cms: typeof system },
  req: FastifyRequest,
  reply: FastifyReply
) {
  let url = req.url.split('?')[0]
  // if (url.indexOf('/__server') === 0) {
  //   return await serverRouteDev(req, reply)
  // }

  // if (await serverRoute(req, reply)) {
  //   return
  // }

  if (url.indexOf('/__tester/') === 0) {
    return await serveTester(req, reply)
  }

  if (url.indexOf('/fimgs/') === 0) {
    return await serveFigmaImages(req, reply)
  }

  if (req.url.indexOf('/__data') === 0) {
    await dataRouter(req, reply, global.mode, this.parent)
    return
  }

  if (await uploadRoute(req, reply)) {
    return
  }

  if (await serveStaticFile({ url, req, reply })) {
    return
  }

  const cmsfound = isCMS(url, req)
  if (cmsfound) {
    await cmsRoutes(global.mode, cmsfound, req, reply)
    return
  }

  reply.type('text/html')
  reply.send(
    await CMS.updateBodyPack({
      body: await system.root.html(req),
      req,
      user: {},
      ssr: null,
      params: null,
      id: null,
    })
  )
}
