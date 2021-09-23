/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import Button from 'web.mobile/src/m-button'
import { Context, useContext, useEffect, useRef } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { useRender } from 'web.utils/src/useRender'
import { lang } from '../../lang/lang'
import type { IBaseFormContext } from '../../../../ext/types/__form'
import type { ICRUDContext } from '../../../../ext/types/__crud'
import type { IBaseListContext } from '../../../../ext/types/__list'

declare const window: BaseWindow

export const MFormWrapper = ({
  children,
  ctx,
}: {
  children: any
  ctx: Context<IBaseFormContext>
}) => {
  const _ = useRef({
    errorModal: true,
    init: false,
  })
  const meta = _.current
  const state = useContext(ctx)
  const render = useRender()
  useEffect(() => {
    meta.init = true
    render()
  }, [])
  const title = state.config.header.title

  if (!meta.init) return null

  return (
    <div
      className="flex flex-col flex-1 w-full h-full overflow-y-auto"
      css={css`
        margin: 0px 0px 0px 0px;
        .list ul {
          background-color: transparent !important;
        }
      `}
    >
      {title && <div className="block-title form-title">{title}</div>}

      <div className="flex flex-col h-full w-full">
        <div className="flex flex-1 flex-col pb-20 overflow-y-auto relative">
          {state.config.header.action &&
            state.config.header.action.save !== false && (
              <div
                className="absolute z-10 pointer-events-none bottom-0 inset-x-0"
                css={css`
                  height: 5px;
                  background: rgb(0, 0, 0, 0.05);
                  background: linear-gradient(
                    0deg,
                    rgba(2, 0, 36, 0.1) 0%,
                    rgba(255, 255, 255, 0) 100%
                  );
                `}
              ></div>
            )}
          <div
            className="absolute inset-0 overflow-x-hidden"
            css={css`
              background-color: #f9fafb;
            `}
          >
            {children}
          </div>

          {meta.errorModal &&
            (state.db.saveStatus === 'validation-error' ||
              state.db.saveStatus === 'failed') && (
              <div
                className="absolute bottom-0 right-0 z-10 bg-white border-2 m-3 mb-0 text-red-600 border-red-400 rounded-md p-2"
                onClick={() => {
                  meta.errorModal = false
                  render()
                }}
                css={css`
                  -webkit-animation: resize 0.5s; /* Chrome, Safari, Opera */
                  animation: resize 0.5s;
                  height: 90%;
                  width: 90%;
                  @keyframes resize {
                    from {
                      width: 0px;
                      height: 0px;
                      opacity: 0;
                    }
                    to {
                      width: 90%;
                      height: 90%;
                      opacity: 1;
                    }
                  }
                  .ms-Label {
                    color: red;
                  }
                `}
              >
                <div className="relative h-full overflow-auto">
                  <div className="absolute inset-0">
                    <div className="text-md flex flex-col">
                      <b className="py-1">
                        {lang('Mohon benahi kesalahan berikut:', 'id')}
                      </b>
                      <ul className="pl-2">
                        {state.db.errors.map((e, idx) => {
                          return (
                            <li
                              key={idx}
                              className="whitespace-pre-wrap font-mono text-xs"
                            >
                              &bull; {e}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        {state.config.header.action &&
          state.config.header.action.save !== false && (
            <div
              className="flex flex-row items-stretch"
              css={css`
                background-color: #f9fafb;
              `}
            >
              <Button
                onClick={async () => {
                  const shouldClose = await state.db.save()
                  if (
                    state.db.saveStatus === 'validation-error' ||
                    state.db.saveStatus === 'failed'
                  ) {
                    meta.errorModal = true
                    render()
                  }

                  const parent = state.tree.parent as ICRUDContext
                  if (shouldClose && parent && parent.crud) {
                    const list = parent.tree.children.list as IBaseListContext
                    if (parent.crud.formData.__listMeta) {
                      const row =
                        list.db.list[parent.crud.formData.__listMeta.idx]
                      for (let [k, v] of Object.entries(state.db.data)) {
                        if (!k.startsWith('_')) {
                          row[k] = v
                        }
                      }

                      if (row.__listMeta.f7row) {
                        delete row.__listMeta.f7row
                      }

                      await parent.crud.setMode('list')
                      list.table.render()
                    } else {
                      await parent.crud.setMode('list')
                      list.db.query()
                    }
                  }
                }}
                fill
                raised
                disabled={state.db.saveStatus === 'saving'}
                large
                className={'btn-save flex-1 submit-btn capitalize m-3 '}
                icon="ios:checkmark"
              >
                {state.db.saveStatus === 'saving'
                  ? lang('Menyimpan...', 'id')
                  : typeof state.config.header.action.save === 'string'
                  ? state.config.header.action.save
                  : lang('Simpan', 'id')}
              </Button>
              {(state.db.saveStatus === 'validation-error' ||
                state.db.saveStatus === 'failed') && (
                <>
                  <Button
                    raised
                    outline
                    animate
                    large
                    color="red"
                    className="flex items-center justify-center my-3 mr-3"
                    css={css`
                      font-size: 25px;
                    `}
                    onClick={() => {
                      meta.errorModal = !meta.errorModal
                      render()
                    }}
                  >
                    ⚠️
                  </Button>
                </>
              )}
            </div>
          )}
      </div>
    </div>
  )
}
