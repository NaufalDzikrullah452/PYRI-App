/** @jsx jsx */
import { jsx } from '@emotion/react'
import { Sheet } from 'framework7-react'
import { useRef, useEffect } from 'react'
import { useRender } from 'web.utils/src/useRender'
import { createPortal } from 'react-dom'

export default (rawProps) => {
  const root = document.querySelector(`#framework7-root`)

  const _ = useRef({ el: null })

  const meta = _.current

  const render = useRender()

  useEffect(() => {
    meta.el = null
    render()
  }, [rawProps.children])

  const props = { ...rawProps }
  const children = props.children
  delete props.children

  return (
    <>
      <Sheet
        backdrop={true}
        swipeToClose="to-bottom"
        containerEl={root}
        {...props}
      >
        {children && (
          <div className="flex flex-1 h-full flex-col">
            <div className="form-title no-line"></div>
            <div className="flex flex-1" ref={(e) => {
              if (e && !meta.el) {
                meta.el = e
                render()
              }
            }}></div>
          </div>
        )}
      </Sheet>
      {meta.el && createPortal(children, meta.el)}
    </>
  )
}
