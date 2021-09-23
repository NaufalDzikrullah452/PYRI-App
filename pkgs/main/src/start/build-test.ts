import { dirs, log, timeSince } from 'boot'
import { BuilderPool, Watcher } from 'builder'
import { copy, pathExists, readJSON, remove } from 'fs-extra'
import { join } from 'path'
import type { CustomGlobal } from '../start'
import { copyDir } from '../utils/copyDir'
import { cssLoader } from '../utils/cssLoader'
import { webFiles, webPkgs } from '../utils/devFiles'
import { ensureProject } from '../utils/ensureProject'
import { overrideWebIndex } from '../utils/overrideWebIndex'
import fetch from 'node-fetch'

declare const global: CustomGlobal

export const buildTest = async (
  shouldYarn: Record<string, boolean>,
  pool: BuilderPool,
  mode: 'dev' | 'prod'
) => {
  if (!(await pathExists(join(dirs.test, 'disabled')))) {
    process.stdout.write(' • Test')

    await remove(join(dirs.test, 'build', 'web'))

    if (mode === 'prod') {
      console.log('')
    }

    let shouldCopy = true

    const changed = {
      src: '',
      type: 'change',
      tstamp: new Date().getTime(),
    }

    let external: string[] = []
    if (await pathExists(join(dirs.test, 'build', 'deps.json'))) {
      await readJSON(join(dirs.test, 'build', 'deps.json'))
    }

    const ins = [join(dirs.test, 'src', 'index.tsx')]

    await pool.add('test', {
      root: dirs.test,
      platform: 'browser',
      in: ins,
      buildOptions: {
        minify: true,
        treeShaking: true,
        outdir: join(dirs.test, 'build', 'web'),
        external,
        target: 'es6',
        watch:
          mode === 'dev'
            ? {
                async onRebuild(error, result) {
                  if (!error && result) {
                    ;(async () => {
                      await waitUntil(() => global.platform.ready)
                      global.platform.metafile = result.metafile

                      const changedFile = changed.src
                        .substr(dirs.root.length)
                        .replace(/\\/gi, '/')

                      if (changedFile) {
                        await pool.send('platform', {
                          action: 'hmr',
                          metafile: result.metafile,
                          type: changed.type,
                          path: changed.src
                            .substr(dirs.root.length)
                            .replace(/\\/gi, '/'),
                        })
                        log(
                          'refresh',
                          `${changedFile} - ${timeSince(changed.tstamp)}`
                        )
                      } else {
                        log('refresh', 'Test rebuilt.')
                        try {
                          fetch(
                            `http://localhost:${global.port}/__cms/0/reload-all`
                          )
                        } catch (e) {}
                      }
                      changed.src = ''
                    })()
                  }
                },
              }
            : undefined,
      },
      plugins: [cssLoader(mode)],
    })
  }
}

const waitUntil = (condition: number | (() => any)) => {
  return new Promise<void>(async (resolve) => {
    if (typeof condition === 'function') {
      if (await condition()) {
        resolve()
        return
      }
      const c = setInterval(async () => {
        if (await condition()) {
          clearInterval(c)
          resolve()
        }
      }, 100)
    } else if (typeof condition === 'number') {
      setTimeout(() => {
        resolve()
      }, condition)
    }
  })
}
