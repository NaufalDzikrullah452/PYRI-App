/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { IColumn } from '@fluentui/react'
import format from 'date-fns/format'
import get from 'lodash.get'
import { Context, useContext } from 'react'
import { useRender } from 'web.utils/src/useRender'
import {
  IBaseListContext,
  IBaseListRowMeta
} from '../../../../ext/types/__list'
import { BaseField } from '../../form/BaseField'
import { initializeForm } from '../../form/BaseForm'
import NiceValue from '../../legacy/NiceValue'

export const BaseListWebCol = ({
  ctx,
  row,
  idx,
  colDef,
}: {
  ctx: Context<IBaseListContext>
  colDef: IColumn
  row: Record<string, any> & { __listMeta: IBaseListRowMeta }
  idx: number
}) => {
  const state = useContext(ctx)
  const render = useRender()
  const col = colDef.fieldName
  const colIdx = (colDef as any).idx
  row.__listMeta.columns[col].render = render

  if (typeof state.table.editable === 'function' && row.__listMeta.editable) {
    const form = row.__listMeta.editable

    const editable = state.table.editable({
      row,
      col,
      list: state.db.list,
      idx,
      state,
    })

    if (editable) {
      if (typeof editable === 'object') {
        form.state.config.alter[col] = {
          ...form.state.config.alter[col],
          ...editable,
        }
      }

      if (form.state.config.layout.indexOf(col) < 0) {
        form.state.config.layout.push(col)
        initializeForm(form.state, form.ctx, render).then(render)
      }

      if (form.state.config.fields[col] && form.state.fieldTypes) {
        return (
          <form.ctx.Provider value={form.state}>
            <>
              <BaseField
                wrapper={({ children }) => (
                  <div
                    className="flex flex-1 self-stretch items-center"
                    css={css`
                      > * {
                        flex: 1;
                      }
                    `}
                  >
                    {children}
                  </div>
                )}
                ctx={form.ctx}
                name={col}
              />
            </>
          </form.ctx.Provider>
        )
      }
    }
  }

  return (
    <>
      {renderValue({
        state,
        row,
        idx,
        colIdx,
        rowState: row.__listMeta,
      })}
    </>
  )
}

const renderValue = ({
  state,
  colIdx,
  row,
  idx,
  rowState,
}: {
  state: IBaseListContext
  row: any
  idx: number
  colIdx: number
  rowState: any
}) => {
  const mdb = state.db
  let colDef = state.table.columns[colIdx]
  if (colDef) {
    if (typeof colDef === 'function') {
      const result = colDef(row)
      return (
        <>
          <div className="ui-querylist-custom">{result.value}</div>
        </>
      )
    }
  }
  let colName = ''
  if (Array.isArray(colDef)) {
    colName = colDef[0]
    if (colDef[1] && typeof colDef[1].value === 'function') {
      return <>{colDef[1].value(row, idx, { list: state, row: rowState })}</>
    }
  }

  if (typeof colDef === 'string') {
    colName = colDef
  }

  const def = get(mdb, `definition.columns.${colName}`)
  let value = get(row, colName)

  if (value) {
    if (def) {
      switch (def.type.toLowerCase()) {
        case 'date':
          if (typeof value === 'string') {
            return format(new Date(value), 'dd MMM yyyy - HH:mm')
          }
          break
      }
    }

    if (typeof value === 'object')
      return <NiceValue value={value} compact={true} />
    return <>{value}</>
  }
  return '-'
}
