/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { Context, createContext, ReactElement, useContext, useRef } from 'react'
import { useRender } from 'web.utils/src/useRender'
import { IBaseFormContext } from '../../../../ext/types/__form'
import { IBaseListContext, IBaseListRowMeta } from '../../../../ext/types/__list'
import {
  createFormContext
} from '../../form/BaseForm'

export const BaseListWebRow = (props: {
  row: Record<string, any> & { __listMeta: IBaseListRowMeta }
  idx: number
  children: (props: any) => ReactElement
  ctx: Context<IBaseListContext>
  rowProps: any
}) => {
  const _ = useRef({
    cursorPointer: true,
    children: null as ReactElement,
  })
  const { row, children, ctx, idx } = props
  const state = useContext(ctx)
  const mtbl = state.table
  const meta = _.current
  const render = useRender()

  if (typeof state.table.editable === 'function' && !row.__listMeta.editable) {
    initEditable({ state, idx, row, render })
  }

  if (mtbl.customRenderRow) {
    meta.children = mtbl.customRenderRow({
      children: children(props.rowProps),
      index: idx,
      list: state.db.list,
      row,
      state,
    })
  } else {
    meta.children = children(props.rowProps)
  }

  if (!mtbl.onRowClick) {
    meta.cursorPointer = false
  }

  if (!row.__listMeta || !meta.children) {
    return null
  }

  row.__listMeta.render = () => {
    render()
    for (let col of Object.values(row.__listMeta.columns)) {
      col.render()
    }
  }

  let rowBody = (
    <>
      <div
        className={`flex flex-1 items-stretch ${
          meta.cursorPointer ? `cursor-pointer ` : ``
        }`}
        css={css`
          > div {
            flex: 1;
          }
        `}
        onClick={(ev) => {
          if (mtbl.onRowClick) {
            if (state.table.editable) {
              return true
            }

            mtbl.onRowClick(row, idx, ev, state)
          }
        }}
      >
        {!!mtbl.customRenderRow
          ? mtbl.customRenderRow({
              row: row,
              list: state.db.list,
              index: idx,
              state,
              children: meta.children,
            })
          : meta.children}
      </div>
    </>
  )

  let final = rowBody
  if (mtbl.wrapRow) {
    final = mtbl.wrapRow({ children: rowBody, row, state })
  }

  const editable = row.__listMeta.editable
  if (editable && editable.ctx && editable.ctx.Provider) {
    return (
      <editable.ctx.Provider value={editable.state}>
        {final}
      </editable.ctx.Provider>
    )
  }
  return final
}

const initEditable = ({
  row,
  state,
  render,
  idx,
}: {
  row: Record<string, any> & { __listMeta: IBaseListRowMeta }
  state: IBaseListContext
  render: () => void
  idx: number
}) => {
  row.__listMeta.editable = {
    ctx: createContext({} as IBaseFormContext),
    state: createFormContext(
      {
        table: state.db.tableName,
        data: row,
        alter: {},
        layout: [],
      },
      () => {}
    ),
  }

  const initForm = row.__listMeta.editable
  initForm.state.tree.parent = state
  initForm.state.component.render = () => {
    render()
    for (let v of Object.values(initForm.state.config.fields)) {
      if (v && v.state) v.state.render()
    }
  }
  initForm.state.db.definition = state.db.definition
}
