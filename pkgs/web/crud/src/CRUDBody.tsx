/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { Context, useContext, useEffect, useRef } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { useRender } from 'web.utils/src/useRender'
import { IAdminSingle } from '../../ext/types/admin'
import { ICRUDContext } from '../../ext/types/__crud'
import { CRUDBodyForm } from './CRUDBodyForm'
import { CRUDBodyList } from './CRUDBodyList'
import { Sheet } from 'framework7-react'
import { createPortal } from 'react-dom'

declare const window: BaseWindow

export const CRUDBody = ({
  content,
  ctx,
}: {
  content: IAdminSingle
  ctx: Context<ICRUDContext>
}) => {
  const _ = useRef({
    init: false,
  })
  const state = useContext(ctx)
  const meta = _.current
  const render = useRender()
  useEffect(() => {
    if (!state.crud.title) state.crud.title = content.title
    if (!state.crud.mode)
      state.crud.mode = content.mode || ('list' as 'list' | 'form')
    meta.init = true
    render()
  }, [])

  if (!meta.init) return null
  if (window.platform === 'mobile') {
    return (
      <div className="admin-cms flex flex-1 flex-col self-stretch">
        <CRUDBodyList ctx={ctx} content={content} />
        <MobileFormWrapper state={state}>
          {state.crud.mode === 'form' && (
            <CRUDBodyForm ctx={ctx} content={content} />
          )}
        </MobileFormWrapper>
      </div>
    )
  }

  return (
    <div
      className={state.crud.mode + ' admin-cms flex flex-1 absolute inset-0'}
      css={css`
        .admin-list,
        .admin-form {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        &.form {
          > .admin-list {
            visibility: hidden;
          }
        }

        &.list {
          > .admin-form {
            visibility: hidden;
          }
        }
      `}
    >
      {state.crud.mode === 'list' && (
        <div className="admin-list flex flex-col">
          <CRUDBodyList ctx={ctx} content={content} />
        </div>
      )}
      {state.crud.mode === 'form' && (
        <div className="admin-form flex flex-col items-stretch">
          <CRUDBodyForm ctx={ctx} content={content} />
        </div>
      )}
    </div>
  )
}

const MobileFormWrapper = ({ children, state }) => {
  const _ = useRef({ el: null as HTMLDivElement | null })
  const meta = _.current
  const render = useRender()

  return (
    <>
      <Sheet
        style={{
          height: '95vh',
          borderTopLeftRadius: '15px',
          borderTopRightRadius: '15px',
        }}
        backdrop={true}
        containerEl={document.querySelector('#framework7-react')}
        opened={state.crud.mode === 'form'}
        onSheetClosed={() => state.crud.setMode('list')}
        swipeToClose={true}
        swipeHandler={`.form-title`}
      >
        <div
          ref={(e) => {
            if (e) {
              meta.el = e
            }
          }}
          className={`base-form-sheet flex flex-1 absolute inset-0 `}
          css={css`
            .form-title {
              background: #efeff4;
              border-bottom: 1px solid #c7c7c7;
              color: black;
              margin: 0px 0px 0px 0px;
              padding: 15px 16px 0px 16px;
              height: 50px;
              line-height: 50px;
              user-select: none;
              min-height: 60px;
              border-top-left-radius: 15px;
              border-top-right-radius: 15px;
              &::before {
                display: block;
                position: absolute;
                top: 11px;
                left: 50%;
                content: '«';
                color: transparent;
                pointer-events: none;
                border-radius: 99px;
                width: 44px;
                height: 7px;
                background: #cdcdcd;
                margin-left: -22px;
              }
            }
          `}
        ></div>
      </Sheet>
      {meta.el && createPortal(children, meta.el)}
    </>
  )
}
