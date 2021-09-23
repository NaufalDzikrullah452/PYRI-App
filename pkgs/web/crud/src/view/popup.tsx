/** @jsx jsx */
import { jsx, css } from '@emotion/react'
import { Modal } from '@fluentui/react'
import { ReactElement, useRef } from 'react'
import { useRender } from 'web.utils/src/useRender'

export const Popup = ({
  btn,
  opened,
  children,
}: {
  btn?: ReactElement
  opened?: boolean
  children: ReactElement | (({ close, render }) => ReactElement)
}) => {
  const _ = useRef({
    show: !!opened,
  })
  const meta = _.current
  const render = useRender()
  const modal = (
    <Modal
      isOpen={meta.show}
      allowTouchBodyScroll={true}
      onDismiss={() => {
        meta.show = false
        render()
      }}
    >
      {typeof children === 'function'
        ? children({
            close: () => {
              meta.show = false
              render()
            },
            render,
          })
        : children}
    </Modal>
  )

  if (btn) {
    return (
      <>
        <div
          className="flex items-stretch"
          onClick={() => {
            meta.show = true
            render()
          }}
        >
          {btn}
        </div>
        {meta.show && modal}
      </>
    )
  }

  return modal
}

export default Popup
