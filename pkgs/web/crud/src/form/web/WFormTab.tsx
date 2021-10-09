/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { Icon, Label } from '@fluentui/react'
import { Context, FC, useContext, useEffect, useRef } from 'react'
import { niceCase } from 'web.utils/src/niceCase'
import { useRender } from 'web.utils/src/useRender'
import type { IAdminSingle } from '../../../../ext/types/admin'
import type { ITableRelation } from '../../../../ext/types/qlist'
import CRUD from '../../CRUD'
import { weakUpdate } from '../BaseForm'
import type { IBaseFormContext } from '../../../../ext/types/__form'
import { WFormSplitter } from './WFormSplitter'

export const WFormTab = ({ ctx }: { ctx: Context<IBaseFormContext> }) => {
  const state = useContext(ctx)
  const _ = useRef({
    init: false,
    tabs: [] as string[],
    contents: [] as (FC | null)[],
  })
  const meta = _.current
  const render = useRender()

  useEffect(() => {
    meta.init = true

    let tabs = state.config.tab.list
    if (typeof state.config.tab.modifier === 'function') {
      tabs = state.config.tab.modifier({ tabs })
    }
    meta.tabs = []
    meta.contents = []
    tabs.map((e) => {
      if (typeof e === 'string' && state.db.definition) {
        const rel: ITableRelation = { ...state.db.definition.rels[e] }
        if (rel) {
          let title = niceCase(rel.modelClass)
          const alter: any = state.config.alter[e]
          if (typeof alter === 'object') {
            title = alter.title
          }
          meta.tabs.push(title)
          meta.contents.push(() => {
            let pk = ''
            for (let v of Object.values(state.db.definition?.columns || {})) {
              if (v.pk) {
                pk = v.name
              }
            }
            if (pk) {
              const toTable = rel.join.to.split('.').shift() || ''
              const to = rel.join.to.split('.').pop() || ''
              const from = rel.join.from.split('.').pop() || ''
              const fromId = state.db.data[from]

              const crudProp: IAdminSingle = {
                table: rel.modelClass,
                form: {
                  onLoad: async (row, opt) => {
                    if (typeof row[toTable] !== 'object') row[toTable] = {}
                    row[toTable][to] = fromId
                    // row[from] = fromId
                  },
                },
                list: {
                  params: {
                    where: {
                      [to]: fromId,
                    },
                  },
                },
              }
              weakUpdate(crudProp, alter.fieldProps || {})

              if (fromId) {
                return (
                  <CRUD
                    content={{
                      [title]: crudProp,
                    }}
                    parentCtx={ctx}
                    id={e}
                  />
                )
              }
              return (
                <div className="flex flex-1 items-center flex-col justify-center opacity-75">
                  <Icon
                    iconName="PageLink"
                    css={css`
                      font-size: 32px;
                    `}
                  />
                  <Label className="text-center">Tab Not Available</Label>
                </div>
              )
            }
            return null
          })
        }
      } else if (typeof e === 'object') {
        meta.tabs.push(e.title)
        meta.contents.push(() => {
          const TabComponent = e.component
          return <TabComponent state={state} />
        })
      }
      return null
    })

    render()
  }, [state.config.tab.list, state.config.tab.list.length])
  if (!meta.init) return null

  return (
    <PureTab
      tabs={meta.tabs
        .map((e, idx) => {
          if (meta.contents[idx])
            return {
              title: e,
              component: meta.contents[idx],
            }
          return {
            title: '',
            component: () => {
              return <></>
            },
          }
        })
        .filter((e) => !!e.title)}
      position={state.config.tab.position}
    />
  )
}

export const PureTab = ({
  active,
  tabs,
  onChange,
  position,
}: {
  active?: string
  onChange?: (tab: string) => void
  tabs: {
    title: string
    component: FC | null
  }[]
  position: IBaseFormContext['config']['tab']['position']
}) => {
  const _ = useRef({
    init: false,
    current: {
      tab: '',
      index: -1,
    },
    el: null as HTMLDivElement | null,
    tabs: tabs.map((e) => {
      return typeof e === 'string' ? e : e.title
    }),
  })

  const meta = _.current
  const render = useRender()
  useEffect(() => {
    meta.tabs = tabs.map((e) => {
      return typeof e === 'string' ? e : e.title
    })
    render()

    if (position === 'left' || position === 'right') {
      setTimeout(() => {
        if (meta.el) {
          const el = meta.el
          const c = meta.el.children[0] as HTMLDivElement
          if (
            el.parentElement &&
            el.parentElement.parentElement &&
            el.offsetWidth < c.offsetWidth + 20
          ) {
            el.parentElement.parentElement.style.minWidth =
              c.offsetWidth + 10 + 'px'
          }
          c.style.position = 'absolute;'
        }
      }, 100)
    }
  }, [tabs])

  useEffect(() => {
    let c = -1
    if (typeof active !== 'undefined') {
      for (let [idx, tab] of Object.entries(meta.tabs)) {
        if (tab === active) {
          c = parseInt(idx)
          break
        }
      }
    } else {
      c = 0
    }

    if (c >= 0) {
      meta.current.tab = meta.tabs[c]
      meta.current.index = c
    }
    meta.init = true
    render()
  }, [active])

  if (!meta.init) return null

  const pos = position || 'top'

  const Content = tabs[meta.current.index]
    ? tabs[meta.current.index].component
    : null
  const children = Content !== null ? <Content /> : <></>
  if (meta.tabs.length === 1) {
    return (
      <div className="flex flex-row items-stretch">
        <div
          className="flex select-none flex-col items-end border-r border-gray-200 py-2"
          css={css`
            width: 30px;

            .tab {
              background: white;
              opacity: 0.7;
              margin-right: -1px;
              border-color: #ececeb;
              border-color: #cecece;
              border-right-color: white;
              border-left-color: #0d4e98;
              background: rgb(255, 255, 255);
              background: linear-gradient(
                -90deg,
                rgba(255, 255, 255, 1) 30%,
                #e4edf5 100%
              );
              label {
                font-size: 13px !important;
                color: #0d4e98;
              }
            }
          `}
        >
          <div
            css={css`
              width: 25px;
              white-space: nowrap;
              margin-bottom: 2px;
              overflow: hidden;
            `}
            ref={(e) => {
              if (e && e.children.length > 0) {
                e.style.height = `${(e.children[0] as any).offsetWidth + 20}px`
              }
            }}
            className={`flex items-center justify-center border p-1 tab active`}
          >
            <Label className="transform -rotate-90 cursor-pointer">
              {meta.tabs[0]}
            </Label>
          </div>
        </div>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    )
  }

  const tabEl = (
    <div
      ref={(e) => {
        if (e) {
          meta.el = e
        }
      }}
      className={
        `pure-tab ${pos} flex-1 flex relative ` +
        {
          left: 'flex-col items-end',
          right: 'flex-col items-start',
          top: 'flex-row items-end',
          bottom: 'flex-row items-start',
        }[pos]
      }
      css={css`
        .tab-item {
          cursor: pointer;
          user-select: none;
          position: relative;
        }

        &.top {
          border-bottom: 1px solid #0d4e98;
          .tab-item {
            border-bottom: 0px;
            margin: 0px 0px 0px 5px;
            padding: 3px 8px;
            color: #777;

            &.active {
              border-color: #0d4e98;
              background: rgb(255, 255, 255);
              background: linear-gradient(
                0deg,
                rgba(255, 255, 255, 1) 30%,
                #e4edf5 100%
              );
              color: #0d4e98;
            }
            &.active::after {
              content: '';
              position: absolute;
              bottom: -2px;
              left: 0px;
              right: 0px;
              height: 2px;
              background: white;
            }
          }
        }

        &.right {
          border-left: 1px solid #0d4e98;

          .tab-inner {
            align-self: stretch;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            overflow-y: auto;
            overflow-x: hidden;
          }
          .tab-item {
            width: 97%;
            height: 35px;
            line-height: 28px;
            color: #777;
            border-left: 0px;
            padding: 3px 10px;
            margin-top: 3px;
            align-items: center;
            text-align: left;

            &.active {
              border-color: #0d4e98;
              background: rgb(255, 255, 255);
              background: linear-gradient(
                90deg,
                rgba(255, 255, 255, 1) 30%,
                #e4edf5 100%
              );
              color: #0d4e98;
            }
            &.active::after {
              content: '';
              position: absolute;
              left: -2px;
              top: 0px;
              bottom: 0px;
              width: 2px;
              background: white;
            }
          }
        }
        &.left {
          border-right: 1px solid #0d4e98;
          .tab-inner {
            display: flex;
            align-self: stretch;
            flex-direction: column;
            align-items: flex-end;
            overflow-y: auto;
            overflow-x: hidden;
          }
          .tab-item {
            width: 97%;
            height: 35px;
            line-height: 28px;
            color: #777;
            border-right: 0px;
            margin-top: 3px;
            padding: 3px 10px;
            align-items: center;
            text-align: right;

            &.active {
              border-color: #0d4e98;
              background: rgb(255, 255, 255);
              background: linear-gradient(
                270deg,
                rgba(255, 255, 255, 1) 30%,
                #e4edf5 100%
              );
              color: #0d4e98;
            }
            &.active::after {
              content: '';
              position: absolute;
              right: -2px;
              top: 0px;
              bottom: 0px;
              width: 2px;
              background: white;
            }
          }
        }

        &.bottom {
          border-top: 1px solid #0d4e98;
          .tab-item {
            border-top: 0px;
            margin: 0px 0px 0px 5px;
            padding: 3px 8px;

            &.active {
              border-color: #0d4e98;
              background: rgb(255, 255, 255);
              background: linear-gradient(
                180deg,
                rgba(255, 255, 255, 1) 30%,
                #e4edf5 100%
              );
            }
            &.active::after {
              content: '';
              position: absolute;
              top: -2px;
              left: 0px;
              right: 0px;
              height: 2px;
              background: white;
            }
          }
        }
        &.right .tab-item {
          width: 90%;
          margin: 2px 0px 0px 0px;
          padding: 3px 3px;
          text-align: left;
          border-left: 0px;
        }
      `}
    >
      <div className="tab-inner inset-0">
        {meta.tabs.map((e, idx) => {
          return (
            <Label
              key={idx}
              onClick={() => {
                meta.current.tab = e
                meta.current.index = idx
                render()

                if (onChange) {
                  onChange(e)
                }
              }}
              className={`${
                meta.current.tab === e ? 'active' : ''
              } tab-item whitespace-nowrap border border-gray-300 hover:bg-blue-100`}
            >
              {e}
            </Label>
          )
        })}
      </div>
    </div>
  )

  return (
    <div
      className={`flex flex-1 self-stretch items-stretch ${
        {
          left: 'flex-row',
          top: 'flex-col',
          right: 'flex-row-reverse',
          bottom: 'flex-col-reverse',
        }[pos]
      }`}
      css={css`
        .split-divider {
          background: transparent;
        }

        .split-master {
          ${{
            left: css`
              overflow-x: hidden;
              overflow-y: auto;
            `,
            right: css`
              overflow-x: hidden;
              overflow-y: auto;
            `,
            bottom: css`
              overflow-y: hidden;
              overflow-x: auto;
            `,
            top: css`
              overflow-y: hidden;
              overflow-x: auto;
            `,
          }[pos]}
        }
      `}
    >
      {Content === null || !tabs[meta.current.index] ? (
        tabEl
      ) : (
        <WFormSplitter
          size={
            {
              left: 100,
              right: 100,
              top: 40,
              bottom: 40,
            }[pos]
          }
          unit={'pixel'}
          enabled={pos === 'left' || pos === 'right'}
          mode={pos as any}
          setSize={() => {}}
        >
          {tabEl}
          {children}
        </WFormSplitter>
      )}
    </div>
  )
}
