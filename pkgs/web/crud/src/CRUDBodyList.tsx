/** @jsx jsx */
import { jsx } from '@emotion/react'
import get from 'lodash.get'
import type { Context } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import type { IAdminSingle } from '../../ext/types/admin'
import type { ICRUDContext } from '../../ext/types/__crud'
import { weakUpdate } from './form/BaseForm'
import { BaseList } from './list/BaseList'

declare const window: BaseWindow

export const CRUDBodyList = ({
  content,
  ctx,
}: {
  content: IAdminSingle
  ctx: Context<ICRUDContext>
}) => {
  const action = weakUpdate(
    {
      create: true,
      other: {
        import: true,
        export: true,
      },
    },
    get(content, 'list.action', {})
  )
  if (get(content, 'list.table.create') !== undefined) {
    action.create = get(content, 'list.table.create')
  }

  let mobile = {
    ...{ mode: 'list' as any, swipeout: true },
    ...(get(content, 'list.table.mobile') || {}),
  }
  if (get(content, 'list.table.swipeout') !== undefined) {
    mobile.swipeout = get(content, 'list.table.swipeout')
  }

  return (
    <BaseList
      id={`list`}
      table={content.table}
      mobile={mobile}
      parentCtx={ctx as any}
      query={get(content, 'list.query')}
      header={get(content, 'list.header')}
      title={get(content, 'list.title')}
      params={get(content, 'list.params', {})}
      onLoad={get(content, 'list.onLoad') || get(content, 'list.table.onLoad')}
      onInit={get(content, 'list.onInit')}
      filter={get(content, 'list.filter')}
      lateQuery={get(content, 'list.lateQuery')}
      columns={get(content, 'list.table.columns')}
      editable={get(content, 'list.editable')}
      checkbox={get(content, 'list.checkbox')}
      wrapList={get(content, 'list.wrapper')}
      wrapRow={get(content, 'list.table.wrapRow')}
      action={action}
      onRowClick={async (row, idx, ev, state) => {
        const parent = state.tree.parent as ICRUDContext

        const onRowClick = get(content, 'list.table.onRowClick')
        if (onRowClick) {
          if (!(await onRowClick(row, idx, ev, state))) {
            return
          }
        }

        const onEdit = get(content, 'form.edit.onClick')
        if (onEdit) {
          await onEdit(row)
        }

        if (
          window.platform === 'web' &&
          !parent.tree.parent &&
          state.db.definition &&
          row[state.db.definition.pk]
        ) {
          location.hash = row[state.db.definition.pk]
        }
        parent.crud.setMode('form', row)
      }}
    />
  )
}
