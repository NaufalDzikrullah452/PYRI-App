/** @jsx jsx */
import { jsx } from '@emotion/react'
import { waitUntil } from 'libs'
import get from 'lodash.get'
import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { BaseWindow } from '../../init/src/window'
import { useRender } from '../../utils/src/useRender'

declare const window: BaseWindow

export default (props) => {
  const _ = useRef({
    active: '',
    children: null,
    init: false,
    tabsContainer: null,
    firstTab: null,
  })
  const meta = _.current
  const render = useRender()
  const onClick = useCallback(
    function (e) {
      let el: HTMLDivElement = e.target
      while (!el.classList.contains('tab-link')) {
        if (el.parentElement) {
          el = el.parentElement as HTMLDivElement
        } else {
          break
        }
      }
      if (el) {
        const id = el.getAttribute('data-tab').substr(1)
        meta.active = id
        document
          .querySelectorAll('.page-current .tab-link-active')
          .forEach((e: any) => {
            e.classList.remove('tab-link-active')
          })

        document
          .querySelectorAll(`.page-current [data-tab="#${id}"]`)
          .forEach((el) => {
            el.classList.add('tab-link-active')
          })

        render()
      }
    },
    [meta.children]
  )

  const applyOnClick = () => {
    for (let i in props.children) {
      const id = get(props.children, i + '.props.children.props.id')

      if (id) {
        waitUntil(
          () =>
            document.querySelectorAll(`.page-current [data-tab="#${id}"]`)
              .length > 0
        ).then(() => {
          const els: NodeListOf<HTMLAnchorElement> = document.querySelectorAll(
            `.page-current [data-tab="#${id}"]`
          )

          for (let el of els) {
            if (el) {
              el.parentElement
                .querySelectorAll('.tab-link')
                .forEach((e, idx) => {
                  e.removeEventListener('click', onClick)
                  e.addEventListener('click', onClick)
                })

              if (i === '0') {
                meta.firstTab = el
              }
            }
          }
        })
      }
    }
  }

  useEffect(() => {
    applyOnClick()
  })
  useEffect(() => {
    if (!window.mobileTabsActive) {
      window.mobileTabsActive = {}
    }

    waitUntil(() => meta.firstTab).then(() => {
      const id = meta.firstTab.getAttribute('data-tab').substr(1)
      meta.active = id

      document
        .querySelectorAll('.page-current .tab-link-active')
        .forEach((e: any) => {
          e.classList.remove('tab-link-active')
        })

      document
        .querySelectorAll(`.page-current [data-tab="#${id}"]`)
        .forEach((el) => {
          el.classList.add('tab-link-active')
        })

      render()
    })
  }, [meta])

  for (let child of props.children) {
    const cid = get(child, 'props.children.props.id')
    if (meta.active === cid) {
      meta.children = child
    }
  }

  return (
    <div className="tabs-animated-wrap flex-1 items-stretch ">
      <div
        className="tabs"
        ref={(e) => {
          if (e) {
            meta.tabsContainer = e
          }
        }}
      ></div>
      {meta.tabsContainer && createPortal(meta.children, meta.tabsContainer)}
    </div>
  )
}
