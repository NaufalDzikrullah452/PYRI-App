/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { DefaultButton, Icon, IconButton, TooltipHost } from '@fluentui/react'
import { api } from 'web.utils/src/api'
import { ICRUDContext } from '../../ext/types/__crud'
import { IBaseFormContext } from '../../ext/types/__form'
import { ComponentBrowser } from './internal/ComponentBrowser'

export const templateActions = ({
  props,
  state,
  save,
  meta,
}: {
  props: any
  meta: any
  state: ICRUDContext
  save: () => Promise<void>
}) => {
  const crud = state.crud
  const form = state.tree.children.form as IBaseFormContext
  return [
    <TooltipHost key="side-menu" content="Toggle Side Menu">
      <div
        key="side-toggle"
        onClick={() => props.toggleNav(!props.showNav)}
        className="flex flex-row items-center px-3 mr-3 rounded-sm cursor-pointer hover:opacity-50"
      >
        <Icon
          iconName={props.showNav ? 'InsertColumnsLeft' : 'InsertColumnsRight'}
          className="bg-white rounded-sm"
          css={css`
            font-size: 15px;
            color: #333 !important;
          `}
        />
      </div>
    </TooltipHost>,
    crud.mode === 'form' && form && form.db.data.id && (
      <IconButton
        onClick={async () => {
          if (
            confirm(
              'WARNING: This cannot be undone\nAre you sure to delete this item ?'
            )
          ) {
            await api(`/__cms/${form.db.data.id}/del-template`)

            const res = await api('/__cms/0/list-template')
            meta.template.listOri = res
            crud.setMode('list')
          }
        }}
        key="delete"
        iconProps={{ iconName: 'Delete' }}
        className="bg-white rounded-sm"
        css={css`
          border: 1px solid #ffb6b6 !important;
          color: red !important;
          font-weight: bold;
        `}
      />
    ),
    crud.mode === 'list' && <ComponentBrowser key="comp-browser" />,
    crud.mode === 'form' && (
      <DefaultButton onClick={save} key="save" iconProps={{ iconName: 'Save' }}>
        <div
          css={css`
            font-size: 12px;
            font-weight: 600;
            margin-left: 4px;
          `}
        >
          Save
        </div>

        <div
          css={css`
            font-size: 10px;
            font-weight: 600;
            margin: 0 0 0 10px;
            border-left: 1px solid #ddd;
            padding: 10px 3px 10px 10px;
          `}
        >
          {/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)
            ? '⌘ S '
            : 'Ctrl + S '}
        </div>
      </DefaultButton>
    ),
    crud.mode === 'list' && (
      <DefaultButton
        onClick={() => {
          const data = JSON.parse(JSON.stringify(defaultData))

          if (meta.parents.length > 0) {
            data.parent_id = meta.parents[0].id
            data.content.type = 'Page'
          } else {
            data.content.type = 'Layout'
            data.content.template = `\
<div>
  {children}
</div>`
          }

          if (
            meta.template.listFilter.type !== 'All' &&
            meta.template.listFilter.type
          ) {
            data.content.type = meta.template.listFilter.type
          }
          meta.state.crud.setMode('form', data)
        }}
        key="add"
        iconProps={{ iconName: 'Add' }}
      >
        New Template
      </DefaultButton>
    ),
  ]
}

const defaultData = {
  title: '',
  type: 'cms-template',
  lang: '',
  status: 'SYSTEM',
  parent_id: null,
  content: {
    type: `layout`,
    structure: ``,
    template: `<div>
  <hello-world />
  <div>Ini Page Baru</div>
</div>`,
  },
  slug: '',
  site: '*',
}
