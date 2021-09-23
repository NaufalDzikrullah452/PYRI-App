/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { waitUntil } from 'libs'
import { memo, useEffect, useRef } from 'react'
import { useRender } from 'web.utils/src/useRender'
import { findPage } from '../core/load-page'
import { renderCore } from '../core/render'
import { DevBar } from '../devbar/DevBar'
import type { BaseWindow } from '../window'
declare const window: BaseWindow

export const WebMain = () => {
  const _ = useRef({
    url: location.pathname,
    current: 'page' as 'page' | 'next',
    page: {
      ref: null as any,
      comp: null as any,
    },
    next: { ref: null as any, comp: null as any },
  })
  const meta = _.current
  const render = useRender()
  window.globalStateID = 1

  useEffect(() => {
    window.webApp = {
      render: (url: string) => {
        meta.url = url
        const page = findPage(url)
        if (page) {
          if (meta.current === 'page') {
            meta.next.comp = memo(() => renderCore({ NotFound: PageNotFound }))
            render()

            waitUntil(() => !!meta.next.ref).then(() => {
              meta.page.ref.style.display = 'none'
              meta.next.ref.style.display = 'flex'
              meta.current = 'next'
              meta.page.comp = null
              render()
            })
          } else {
            meta.page.comp = memo(() => renderCore({ NotFound: PageNotFound }))
            render()

            waitUntil(() => !!meta.page.ref).then(() => {
              meta.next.ref.style.display = 'none'
              meta.page.ref.style.display = 'flex'
              meta.current = 'page'
              meta.next.comp = null
              render()
            })
          }
        }
      },
    }
  }, [])

  if (!meta.page.comp && !meta.next.comp) {
    meta.page.comp = memo(() => renderCore({ NotFound: PageNotFound }))
  }
  const Page = meta.page.comp
  const Next = meta.next.comp

  const rootCSS = css`
    > div {
      flex: 1;
    }
  `

  return (
    <>
      {Page && (
        <div
          ref={(e) => (meta.page.ref = e)}
          className={`web ${
            meta.current === 'page' ? 'flex' : 'hidden'
          } flex-1 items-stretch`}
          css={rootCSS}
        >
          <Page />
        </div>
      )}
      {Next && (
        <div
          ref={(e) => (meta.next.ref = e)}
          className={`web ${
            meta.current === 'next' ? 'flex' : 'hidden'
          } flex-1 items-stretch`}
          css={rootCSS}
        >
          <Next />
        </div>
      )}

      {window.is_dev && <DevBar />}
    </>
  )
}

const PageNotFound = () => {
  return <div>Page Not Found</div>
}
