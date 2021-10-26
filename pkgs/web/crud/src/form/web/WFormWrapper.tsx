/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import {
  Callout,
  DefaultButton,
  Icon,
  Label,
  PrimaryButton,
} from '@fluentui/react'
import { initializeIcons } from '@fluentui/react/lib/Icons'
import { waitUntil } from 'libs'
import {
  Context,
  Fragment,
  isValidElement,
  ReactElement,
  useContext,
  useEffect,
  useRef,
} from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { useRender } from 'web.utils/src/useRender'
import { ICRUDContext } from '../../../../ext/types/__crud'
import type {
  IAction,
  IBaseFormContext,
  IBaseFormProps,
} from '../../../../ext/types/__form'
import { IBaseListContext } from '../../../../ext/types/__list'
import { lang } from '../../lang/lang'
import { Loading } from '../../view/loading'
import { defaultActions } from '../BaseForm'
import { WFormSplitter } from './WFormSplitter'
import { WFormTab } from './WFormTab'

declare const window: BaseWindow

export const WFormWrapper = ({
  children,
  ctx,
}: {
  children: any
  ctx: Context<IBaseFormContext>
}) => {
  const _ = useRef({
    split: {
      size: 0,
      unit: 'percent',
    },
    action: {
      container: null as null | HTMLDivElement,
    },
    init: false,
  })
  const meta = _.current
  const state = useContext(ctx)
  const render = useRender()
  useEffect(() => {
    if (window.platform === 'web' && !(window as any).iconInit) {
      ;(window as any).iconInit = true
      initializeIcons()
    }

    const ss = state.config.split.size
    meta.split.size = parseInt(ss.replace(/\D/g, ''))
    meta.split.unit = ss.replace(/\d+/g, '') === '%' ? 'percent' : 'pixel'
    meta.init = true
    render()
  }, [])

  if (!meta.init) return null

  const title = state.config.header.title
  const mainContent = (
    <div
      className="flex flex-1 items-stretch px-2 pt-1"
      css={css`
        > div {
          flex: 1;
        }
      `}
    >
      {children}
    </div>
  )

  return (
    <>
      <Loading show={state.db.loading} />
      <div className="flex flex-1 items-stretch self-stretch flex-col">
        {state.config.header.enable && (
          <WHeader
            state={state}
            title={title}
            meta={meta}
            parentRender={render}
          />
        )}
        <WFormSplitter
          mode={
            state.config.tab.list.length === 0
              ? 'none'
              : state.config.split.position
          }
          size={meta.split.size}
          unit={meta.split.unit as any}
          setSize={(v) => {
            meta.split.size = v
            state.component.render()
          }}
        >
          {mainContent}
          <WFormTab ctx={ctx} />
        </WFormSplitter>
      </div>
    </>
  )
}

const WHeader = ({
  state,
  title,
  meta,
  parentRender,
}: {
  state: IBaseFormContext
  title: IBaseFormProps['title']
  meta: any
  parentRender: () => void
}) => {
  const render = useRender()
  state.config.header.render = render
  return (
    <div
      className="flex items-stretch justify-between border-b border-gray-300"
      css={css`
        flex-grow: 0;
        flex-basis: 40px;
        min-height: 40px;
        ${state.db.saveStatus === 'changed' &&
        css`
          border-bottom: 2px solid red;
          background-image: linear-gradient(
            45deg,
            #ffdbdb 4.55%,
            #ffffff 4.55%,
            #ffffff 50%,
            #ffdbdb 50%,
            #ffdbdb 54.55%,
            #ffffff 54.55%,
            #ffffff 100%
          );
          background-size: 15.56px 15.56px;
        `}
      `}
    >
      <div className="flex-row flex flex-1 items-center pl-2">
        {state.config.header.back && (
          <Icon
            iconName="ChevronLeft"
            className={`cursor-pointer pr-2`}
            onClick={() => {
              if (state.config.header?.back) {
                state.config.header.back({ state, row: state.db.data })
              }
            }}
          />
        )}
        {title && (
          <Label
            className="cursor-pointer  whitespace-nowrap"
            onClick={() => {
              if (state.config.header?.back) {
                state.config.header.back({ state, row: state.db.data })
              }
            }}
          >
            {typeof title === 'function'
              ? title({ state, row: state.db.data })
              : title}
          </Label>
        )}
      </div>
      {state.db.saveStatus === 'changed' && (
        <div className="flex items-center px-6 my-1 ml-4 text-xs font-semibold text-red-500 bg-white border-2 border-red-500 rounded-md">
          {lang('UNSAVED', 'en')}
        </div>
      )}

      {state.db.saveStatus === 'saving' && (
        <div className="flex items-center px-6 my-1 ml-4 text-xs font-semibold text-blue-500 bg-white border-2 border-blue-300 rounded-md">
          {lang('SAVING', 'en')}
        </div>
      )}
      <div
        className="flex-row flex-1 flex"
        ref={(e) => {
          if (e) {
            if (meta.action.container === null) {
              meta.action.container = e
              parentRender()
            }
          }
        }}
      >
        {meta.action.container && (
          <Actions
            state={state}
            width={meta.action.container.offsetWidth}
            action={
              typeof state.config.header.action === 'function'
                ? { ...defaultActions, ...state.config.header.action(state) }
                : state.config.header.action
            }
          />
        )}
      </div>
    </div>
  )
}

export const Actions = ({
  width,
  action,
  state,
}: {
  width: number
  action: IAction
  state: IBaseFormContext | IBaseListContext
}) => {
  const _ = useRef({
    callout: false,
    mode: '' as 'dropdown' | 'menu' | '',
    el: {
      menu: null as null | HTMLDivElement,
      target: null as null | HTMLDivElement,
    },
    actionCount: 0,
    children: null as null | ReactElement,
    init: false,
  })
  const meta = _.current
  const render = useRender()

  useEffect(() => {
    if (!!meta.children && !meta.init) {
      waitUntil(
        () => meta.el && meta.el.menu && meta.el.menu.offsetWidth > 0
      ).then(async () => {
        setTimeout(() => {
          if (
            meta.el &&
            meta.el.menu &&
            meta.el.menu.offsetWidth > width &&
            meta.actionCount > 2
          ) {
            meta.mode = 'dropdown'
          } else {
            meta.mode = 'menu'
          }

          meta.init = true
          render()
        }, 300)
      })
    }
  }, [meta.children])

  let actionCount = 0
  if (typeof action === 'object') {
    const actions = Object.entries(action)
    if (action.custom) {
      for (let k of Object.keys(actions) as any) {
        if (actions[k] && actions[k][0] === 'custom') {
          actions.splice(k, 1)
          break
        }
      }
      actions.unshift(['custom', action.custom])
    }

    meta.children = (
      <>
        {actions
          .map(([name, result]) => {
            if (result === false) return null

            if (typeof result === 'function') {
              result = result({
                state,
                save: (state as IBaseFormContext).db.save,
                data: (state as IBaseFormContext).db.data,
              })
            }

            if (name === 'other') {
              return null
            }

            if (result === true || typeof result === 'string') {
              actionCount++
              switch (name) {
                case 'create':
                  return (
                    <PrimaryButton
                      className="create"
                      key={name}
                      iconProps={{ iconName: 'Add' }}
                      onClick={() => {
                        const parent = state.tree.parent as ICRUDContext
                        parent.crud.setMode('form', {})
                        parent.component.render()
                      }}
                    >
                      {typeof result === 'string' ? result : 'Create'}
                    </PrimaryButton>
                  )
                case 'save':
                  return (
                    <PrimaryButton
                      className="save"
                      key={name}
                      iconProps={{ iconName: 'Save' }}
                      onClick={() => {
                        const form: IBaseFormContext = state as any
                        if (form.db.save) {
                          form.db.save()
                        }
                      }}
                    >
                      {typeof result === 'string' ? result : 'Save'}
                    </PrimaryButton>
                  )
                case 'delete':
                  return (
                    <DefaultButton
                      className="delete"
                      key={name}
                      iconProps={{ iconName: 'Trash' }}
                      onClick={() => {
                        const form: IBaseFormContext = state as any
                        if (form.db.save) {
                          if (confirm('Are you sure ?')) {
                          }
                        }
                      }}
                    >
                      {meta.mode === 'dropdown' ? 'Delete' : undefined}
                    </DefaultButton>
                  )
              }
            }

            if (Array.isArray(result)) {
              return (
                <Fragment key={name}>
                  {result.map((e, idx) => {
                    if (typeof e === 'function') {
                      const customAction = e({
                        state: state,
                        save: state.db['save'],
                        data: state.db['data'],
                      })

                      if (isValidElement(customAction)) {
                        actionCount++
                      }
                      return <Fragment key={idx}>{customAction}</Fragment>
                    }

                    actionCount++
                    return <Fragment key={idx}>{e}</Fragment>
                  })}
                </Fragment>
              )
            }

            if (isValidElement(result)) {
              return <Fragment key={name}>{result}</Fragment>
            }

            actionCount++
            return <Fragment key={name}>{result}</Fragment>
          })
          .filter((e) => !!e)}
      </>
    )
  }
  meta.actionCount = actionCount

  return (
    <div
      className="flex flex-1 self-stretch relative"
      css={css`
        .ms-Button {
          padding: 0px 5px;

          .ms-Label {
            white-space: nowrap;
          }
          .ms-Button-flexContainer {
            &::before {
              content: '';
              height: 25px;
              width: 0px;
              display: flex;
            }
          }
        }
      `}
    >
      <div
        className={`absolute  inset-0 overflow-x-auto overflow-y-hidden text-right ${
          meta.mode === 'menu' ? 'opacity-1' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          ref={(e) => {
            if (e) {
              meta.el.menu = e
            }
          }}
          className="inline-flex self-stretch flex-row justify-end items-center flex-nowrap "
          css={css`
            height: 39px;
            padding-right: 8px;

            .ms-Button {
              padding: 0px 3px;
              max-height: 28px;
              min-width: 20px;
              height: 33px;

              .ms-Button-flexContainer {
                display: flex;
                align-items: stretch;

                .ms-Icon {
                  align-self: center;
                  margin-top: 1px;
                }
                .ms-Icon,
                .ms-Button-textContainer {
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  font-size: 13px;
                }
                .ms-Label {
                  font-size: 13px;
                  text-decoration: none;
                }
              }
              &:not(.ms-Button--primary) {
                &:not(.other) {
                  &:not(.delete) {
                    cursor: pointer;
                    padding-right: 5px;
                    &::after {
                      content: '';
                      position: absolute;
                      border-radius: 2px;
                      top: 0;
                      left: 0;
                      bottom: 0;
                      right: 0;
                      border: 1px solid #a3bee6;
                    }

                    &:hover {
                      background: #eef2ff;
                    }
                    .ms-Icon,
                    .ms-Label {
                      cursor: pointer;
                      color: #0078d4;
                    }
                  }
                }
              }

              &.delete {
                background: white;
                border-color: #d35a5a;
                color: #a53333;

                .ms-Icon {
                  color: red;
                }
                opacity: 0.8;
                &:hover {
                  opacity: 1;
                }
              }
            }
            > * {
              margin-left: 4px;
              margin-right: 0px;
            }
          `}
        >
          {meta.children}
          {action.other && <ActionOther mode={meta.mode} />}
        </div>
      </div>
      {meta.mode === 'dropdown' && (
        <div className="flex flex-1 items-center justify-end ">
          <div
            ref={(e) => {
              if (e) meta.el.target = e
            }}
          >
            <Label
              onClick={() => {
                meta.callout = !meta.callout
                render()
              }}
              className={`flex whitespace-nowrap items-center px-2 cursor-pointer border bg-white border-gray-300 relative select-none ${
                meta.callout ? 'active' : ''
              }`}
              css={css`
                border-right: 0px;
                &:hover,
                &.active {
                  border-color: #0d4e98;
                  background: rgb(255, 255, 255);
                  background: linear-gradient(
                    0deg,
                    rgba(255, 255, 255, 1) 30%,
                    #e4edf5 100%
                  );
                }
              `}
            >
              {meta.actionCount} Actions{' '}
              <Icon
                iconName="ChevronDown"
                css={css`
                  margin-left: 8px;
                  font-size: 12px;
                `}
              />
            </Label>
            {action.other && <ActionOther mode={meta.mode} />}
          </div>
          {meta.callout && (
            <Callout
              onDismiss={() => {
                meta.callout = false
                render()
              }}
              isBeakVisible={false}
              target={meta.el.target}
            >
              <div
                className="flex flex-col"
                css={css`
                  padding-bottom: 5px;
                  cursor: pointer;
                  .ms-Button {
                    border: 0px;
                    margin: 0px;
                    padding: 0px 8px 0px 0px;
                    background: none;
                    border: 0px;
                    border-bottom: 1px solid #ccc;
                    border-radius: 0px;
                    align-items: stretch;

                    &:last-child {
                      border-bottom: 0px;
                      margin-bottom: -5px;
                    }

                    &:hover {
                      background: #ececeb;
                    }

                    .ms-Button-flexContainer {
                      flex: 1;
                      justify-content: flex-start;
                    }
                    i {
                      width: 32px;
                      height: 32px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                    i,
                    .ms-Button-label,
                    label {
                      padding: 0px;
                      margin: 0px;
                      color: #333;
                      cursor: pointer;
                      text-align: left;
                      text-decoration: none;
                    }
                  }
                `}
              >
                {meta.children}
              </div>
            </Callout>
          )}
        </div>
      )}
    </div>
  )
}

const ActionOther = ({ mode }: { mode: '' | 'dropdown' | 'menu' }) => {
  return (
    <DefaultButton
      className="other"
      css={css`
        border-color: #fafafa;
        border-left-color: #ccc;
        border-radius: 0px;
        ${mode === 'menu' &&
        css`
          margin-right: -8px;
        `}
      `}
      iconProps={{ iconName: 'ChevronDown' }}
    ></DefaultButton>
  )
}
