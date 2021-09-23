/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { Button, Searchbar } from 'framework7-react'
import throttle from 'lodash.throttle'
import { Context, isValidElement, useContext, useEffect, useRef } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { useRender } from 'web.utils/src/useRender'
import { ICRUDContext } from '../../../../ext/types/__crud'
import { IBaseListContext } from '../../../../ext/types/__list'
import { lang } from '../../lang/lang'

declare const window: BaseWindow

export const BaseFilterMobile = ({
  ctx,
}: {
  ctx: Context<IBaseListContext>
}) => {
  const _ = useRef({
    init: false,
  })

  const state = useContext(ctx)
  const meta = _.current
  const render = useRender()
  useEffect(() => {
    meta.init = true
    render()
  }, [])

  if (!meta.init) return null

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
            raised
            large
            onClick={() => {
              const parent = state.tree.parent as ICRUDContext
              parent.crud.setMode('form', {})
              parent.component.render()
            }}
            className="flex flex-row items-center"
            css={css`
              margin: 10px 0px 10px 5px;
              width: 120px;
              border-radius: 5px;
              height: 30px;
              line-height: 30px;
            `}
            children={
              <>
                <span
                  css={css`
                    font-size: 22px;
                    line-height: 0px;
                    margin-top: -4px;
                  `}
                >
                  +
                </span>
                <span
                  css={css`
                    font-size: 14px;
                    text-transform: initial;
                  `}
                >
                  {typeof state.header.action.create === 'string'
                    ? state.header.action.create
                    : lang('Tambah', 'id')}
                </span>
              </>
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
      <Searchbar
        onClickClear={() => {
          state.filter.quickSearch = ''
          render()
          state.component.render()
        }}
        searchContainer=".search-list"
        searchIn=".item-link"
        placeholder="Cari"
        disableButton={false}
        clearButton={true}
        css={css`
          .searchbar-input-wrap input {
            border-radius: 5px !important;
          }
        `}
        onChange={(e) => {
          const text = e.target.value
          state.filter.quickSearch = text
          render()
          state.component.render()
        }}
      >
        {create}
      </Searchbar>
    </>
  )
}

export const searchObject = (row: any, text: string) => {
  let found = false
  for (let [k, v] of Object.entries(row) as any) {
    if (v && v.toString && v.toString().toLowerCase().indexOf(text) >= 0) {
      found = true
      break
    }
    if (typeof v === 'object' && !!v && !k.startsWith('_')) {
      if (searchObject(v, text)) {
        found = true
        break
      }
    }
  }

  return found
}
