/** @jsx jsx */
import { jsx } from '@emotion/react'
import { App, Page, View } from 'framework7-react'
import { waitUntil } from 'libs'
import { FC, memo, useEffect, useRef } from 'react'
import { useRender } from 'web.utils/src/useRender'
import { findPage } from '../core/load-page'
import { renderCore } from '../core/render'
import { DevBar } from '../devbar/DevBar'
import type { BaseWindow } from '../window'
import { MobileWrapper } from './mobile-wrapper'

declare const window: BaseWindow

export const MobileMain = () => {
  const _ = useRef({
    url: location.pathname,
    ready: false,
    f7params: {
      theme: 'ios',
    },
    view: {
      ref: null as HTMLDivElement,
    },
    idx: {
      current: 0,
      next: -1,
      prev: -1,
    },
    stack: [] as ({
      ref?: HTMLDivElement
      comp: FC<any>
      page: ReturnType<typeof findPage>
      rendered: boolean
    } | null)[],
    animating: false as boolean | ReturnType<typeof setTimeout>,
    next: { ref: null as HTMLDivElement, comp: null },
  })
  const render = useRender()
  const meta = _.current
  window.globalStateID = 1

  useEffect(() => {
    window.mobileApp.render = (url: string, opt = {}) => {
      const { afterRender, forward } = opt
      meta.url = url
      const page = findPage(url)
      if (typeof page !== 'boolean') {
        // type guard
        const pageItem = {
          page,
          rendered: false,
          comp: memo(() =>
            renderCore({
              NotFound: PageNotFound,
              afterRender: !!afterRender
                ? () => {
                    if (!pageItem.rendered) {
                      pageItem.rendered = true
                      afterRender()
                    }
                  }
                : undefined,
            })
          ),
        }
        for (let [k, item] of Object.entries(meta.stack)) {
          if (item && item.page && item.page.id === pageItem.page.id) {
            meta.stack[k] = null
          }
        }

        meta.stack[!!forward ? 'push' : 'unshift'](pageItem)
        render()
        return true
      }
      return page
    }
    window.mobileApp.render(location.pathname)
  }, [])

  let showAny = true
  meta.stack.map((e, idx) => {
    if (
      meta.idx.current === idx ||
      meta.idx.prev === idx ||
      meta.idx.next === idx
    ) {
      showAny = false
    }
  })

  return (
    <>
      {window.is_dev && <DevBar />}
      <MobileWrapper>
        <App {..._.current.f7params}>
          <View
            animate={true}
            stackPages={true}
            ref={
              ((e) => {
                if (e) {
                  meta.view.ref = e.el
                }
              }) as any
            }
            onViewInit={(e) => {
              if (e) {
                const mobileApp: typeof window['mobileApp'] = e as any
                const getLastPage = () => {
                  let lastPage = -1
                  meta.stack.filter((e, idx) => {
                    if (!!e) {
                      lastPage = idx
                      return true
                    }
                    return false
                  })
                  return lastPage
                }
                mobileApp.navigate = (href: string) => {
                  waitUntil(() => window.mobileApp).then(() => {
                    if (
                      window.mobileApp.render(href, {
                        forward: true,
                        afterRender: () => {
                          if (typeof meta.animating !== 'boolean') {
                            clearInterval(meta.animating)
                          }
                          meta.animating = setTimeout(() => {
                            meta.view.ref.classList.remove(
                              'router-transition-f7-push-forward'
                            )
                            const lastPage = getLastPage()
                            meta.idx.current = lastPage
                            meta.idx.prev = lastPage - 1
                            meta.idx.next = -1
                            render()
                          }, 300)
                        },
                      })
                    ) {
                      const lastPage = getLastPage()
                      meta.idx.current = lastPage - 1
                      meta.idx.next = lastPage
                      meta.idx.prev = -1
                      meta.view.ref.classList.add(
                        'router-transition-f7-push-forward'
                      )
                      render()
                    } else {
                      meta.stack.push(null)
                    }
                  })
                }

                mobileApp.back = (href: string) => {
                  waitUntil(() => window.mobileApp).then(() => {
                    let lastPage = getLastPage()
                    if (lastPage <= 0) {
                      meta.stack = []
                      meta.view.ref.classList.remove(
                        'router-transition-f7-push-forward'
                      )
                      meta.view.ref.classList.remove(
                        'router-transition-f7-push-backward'
                      )
                      meta.idx.current = 0
                      meta.idx.prev = -1
                      meta.idx.next = -1
                      window.mobileApp.render(location.pathname)
                      render()
                      return
                    }

                    meta.idx.current = lastPage
                    meta.idx.prev = lastPage - 1
                    render()

                    const res = meta.stack.length > 0 ? meta.stack.pop() : null
                    meta.idx.current = lastPage
                    meta.idx.prev = lastPage - 1
                    meta.idx.next = -1
                    if (!!res) {
                      meta.view.ref.classList.add(
                        'router-transition-f7-push-backward'
                      )
                      if (typeof meta.animating !== 'boolean') {
                        clearInterval(meta.animating)
                      }
                      meta.animating = setTimeout(() => {
                        meta.view.ref.classList.remove(
                          'router-transition-f7-push-backward'
                        )
                        meta.idx.current = meta.idx.prev
                        meta.idx.next = meta.idx.current
                        if (meta.idx.next === meta.idx.current) {
                          meta.idx.next = -1
                        }
                        meta.idx.prev = -1
                        render()
                      }, 500)
                    } else {
                      render()
                    }
                  })
                }

                window.mobileApp = mobileApp
              }
            }}
          >
            {meta.stack.map((e, idx) => {
              if (e === null) return null
              const Content = e.comp

              return (
                <Page
                  className={`
                    ${meta.idx.current === idx ? 'page-current' : ''}
                    ${meta.idx.prev === idx ? 'page-previous' : ''}
                    ${meta.idx.next === idx ? 'page-next' : ''}
                  `
                    .replace(/\s\s+/g, ' ')
                    .trim()}
                  key={idx}
                  tabs={true}
                  stacked={
                    showAny ||
                    (meta.idx.current !== idx &&
                      meta.idx.prev !== idx &&
                      meta.idx.next !== idx)
                  }
                >
                  <Content />
                </Page>
              )
            })}
          </View>
        </App>
      </MobileWrapper>
    </>
  )
}

const PageNotFound = () => {
  return <div>Page Not Found</div>
}
