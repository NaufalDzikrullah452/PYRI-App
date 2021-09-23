/** @jsx jsx */
import { jsx } from '@emotion/react'
import get from 'lodash.get'
import { Context, useContext } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { niceCase } from 'web.utils/src/niceCase'
import type { IAdminSingle } from '../../ext/types/admin'
import { ICRUDContext } from '../../ext/types/__crud'
import { BaseForm } from './form/BaseForm'

declare const window: BaseWindow

export const CRUDBodyForm = ({
  content,
  ctx,
}: {
  content: IAdminSingle
  ctx: Context<ICRUDContext>
}) => {
  let layout = get(content, 'form.layout')
  if (typeof layout === 'function') {
    layout = [layout]
  }

  const state = useContext(ctx)

  return (
    <BaseForm
      id={'form'}
      parentCtx={ctx as any}
      table={content.table}
      alter={get(content, 'form.alter')}
      onSave={get(content, 'form.onSave')}
      onLoad={get(content, 'form.onLoad')}
      onInit={get(content, 'form.onInit')}
      layout={layout}
      tabs={get(content, 'form.tabs')}
      split={get(content, 'form.split', {})}
      data={state.crud.formData}
      header={{
        enable: get(content, 'form.header.enable', true),
        back: ({ row }) => {
          if (location.hash && !state.tree.parent) {
            location.hash = ''
          }
          state.crud.setMode('list', row)
        },
        title: niceCase(state.crud.title),
        action:
          get(content, 'form.action') || get(content, 'form.header.action', {}),
      }}
    />
  )
}
