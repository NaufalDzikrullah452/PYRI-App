/** @jsx jsx */
import { jsx, css } from '@emotion/react'
import { db } from 'libs'
import {
  Button,
  List,
  ListItem,
  Progressbar,
  SwipeoutButton,
  SwipeoutActions,
} from 'framework7-react'
import { waitUntil } from 'libs'
import get from 'lodash.get'
import { Context, isValidElement, useContext, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { BaseWindow } from 'web.init/src/window'
import { shortFormatDate } from 'web.utils/src/formatDate'
import { useRender } from 'web.utils/src/useRender'
import { ICRUDContext } from '../../../../ext/types/__crud'
import type {
  IBaseListContext,
  IColumnSingleDef,
} from '../../../../ext/types/__list'
import { lang } from '../../lang/lang'
import { Loading } from '../../view/loading'
import { searchObject } from './BaseFilterMobile'
import { MobileList } from './mode/MobileList'
import { MobileStatic } from './mode/MobileStatic'
declare const window: BaseWindow

export const BaseListMobile = ({ ctx }: { ctx: Context<IBaseListContext> }) => {
  const _ = useRef({
    init: false,
    hideInfo: false,
  })
  const meta = _.current
  const state = useContext(ctx)
  const render = useRender()
  useEffect(() => {
    meta.init = true
    render()
  }, [])
  state.table.render = render

  if (!meta.init) return null

  let items = state.db.list
  if (!!state.filter.quickSearch) {
    items = state.db.list.filter((row) => {
      return searchObject(row, state.filter.quickSearch || '')
    })
  }
  const columns = state.table.columns
  const canCreate = state.header?.action?.create
  let create = null
  if (canCreate !== false) {
    if (typeof canCreate === 'function') {
      create = canCreate({ state, save: null, data: null })
    } else if (typeof create === 'object') {
      if (isValidElement(canCreate)) {
        create = canCreate
      } else {
        create = (
          <Button
            fill
            large
            raised
            className="self-stretch capitalize"
            onClick={() => {
              const parent = state.tree.parent as ICRUDContext
              parent.crud.setMode('form', {})
              parent.component.render()
            }}
            children={
              typeof create === 'string'
                ? state.header.action.create
                : lang('Tambah Baru', 'id')
            }
            {...((typeof create === 'object' && !isValidElement(create)
              ? create
              : {}) as any)}
          />
        )
      }
    }
  }

  return (
    <>
      {state.db.loading && <Progressbar infinite />}
      <div
        className="base-list-mobile relative flex-1"
        css={css`
          > div > ul {
            &::before,
            &::after {
              display: none;
            }
          }
          .item-content {
            background: white;
          }
        `}
      >
        {items.length === 0 ? (
          <>
            {state.db.loading ? (
              <div className="flex flex-col items-center justify-center flex-1 p-10 space-y-5">
                <Loading />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 p-10 space-y-5">
                <img src="/__ext/icons/empty.svg" />
                <div className="font-medium text-center uppercase text-md">
                  {!state.filter.quickSearch &&
                    lang(
                      'Tidak ada [table]',
                      { table: state.header?.title || '' },
                      'id'
                    )}

                  <div className="capitalize whitespace-pre-wrap">
                    {state.filter.quickSearch &&
                      lang(
                        '[table] tidak ditemukan\n untuk pencarian "[search]"',
                        {
                          table: state.header?.title || '',
                          search: state.filter.quickSearch,
                        },
                        'id'
                      )}
                  </div>
                </div>
                {create}
              </div>
            )}
          </>
        ) : (
          <>
            {state.table.mobile.mode === 'list' ? (
              <MobileList
                columns={columns}
                items={items}
                meta={meta}
                render={render}
                state={state}
              />
            ) : (
              <MobileStatic
                columns={columns}
                items={items}
                meta={meta}
                render={render}
                state={state}
              />
            )}
          </>
        )}
      </div>
    </>
  )
}

export const columnized = (
  e?: IColumnSingleDef,
  row?: any,
  state?: IBaseListContext
) => {
  if (!e) return undefined

  if (typeof e === 'string') {
    return formatString(get(row, e), state, e)
  } else if (e[1]) {
    const p = e[1]

    if (p.value && state) {
      return p.value(row, state)
    } else {
      return formatString(get(row, 'e.0'), state, e[0])
    }
  }
}

const formatString = (val: any, state?: IBaseListContext, key?: string) => {
  let type = 'string'
  const def = state.db.definition.columns[key]
  if (def) {
    type = def.type
    switch (type) {
      case 'date':
        return shortFormatDate(val)
        break
    }
  }

  return val
}
