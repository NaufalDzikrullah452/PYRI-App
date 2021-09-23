/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { Label } from '@fluentui/react'
import { waitUntil } from 'libs'
import clone from 'lodash.clonedeep'
import get from 'lodash.get'
import { Fragment, useEffect, useRef } from 'react'
import CRUD from 'web.crud/src/CRUD'
import { TemplateCode } from 'web.dev/src/internal/TemplateCode'
import type { BaseWindow } from 'web.init/src/window'
import { api } from 'web.utils/src/api'
import { niceCase } from 'web.utils/src/niceCase'
import { removeCircular } from 'web.utils/src/removeCircular'
import { useRender } from 'web.utils/src/useRender'
import { fuzzyMatch } from '../../crud/src/form/web/fields/WSelect'
import { ICRUDContext } from '../../ext/types/__crud'
import { IBaseFormContext } from '../../ext/types/__form'
import { IBaseListContext } from '../../ext/types/__list'
import { FieldCode } from './internal/FieldCode'
import { Toolbar } from './libs/Toolbar'
import { templateActions } from './TemplateActions'
import { TemplateToolbar } from './TemplateToolbar'

declare const window: BaseWindow

export const Template = (props: {
  mode: 'web' | 'mobile'
  args: any
  showNav: boolean
  toggleNav: (nav: boolean) => void
  navigate: (opt: { tab: string; args: any }) => void
}) => {
  const _ = useRef({
    parents: [],
    state: {
      list: null as IBaseListContext,
      form: null as IBaseFormContext,
      crud: null as ICRUDContext['crud'],
      root: null as ICRUDContext,
    },
    monaco: { getCursor: () => {}, formatCode: () => {} },
    template: {
      listOri: null,
      listFilter: {
        title: '',
        type: localStorage['dev-template-filter-type'] || 'All',
        domain: '',
      },
    },
    saving: false,
    unsaved: false,
  })
  const meta = _.current
  const render = useRender()
  const form = meta.state.form
  const list = meta.state.list

  useEffect(() => {
    const keydown = function (e) {
      if (
        (window.navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey) &&
        e.keyCode == 83
      ) {
        if (window.devIsComponentEditorOpen) {
          return
        }
        e.preventDefault()
        save({ state: meta.state.root, meta, render })
      }
    }
    document.addEventListener('keydown', keydown, true)

    return () => {
      document.removeEventListener('keydown', keydown)
    }
  }, [])

  const doFilter = () => {
    const template = meta.template
    const state = meta.state.list
    const title = template.listFilter.title.toLowerCase()
    if (!title) {
      state.db.list = [...template.listOri]
    }
    state.db.list = state.db.list.filter((e) => {
      let result = true

      if (template.listFilter.domain !== '') {
        if (template.listFilter.domain === 'All Domain') {
          result = e.site === '*'
        } else {
          result = e.site === template.listFilter.domain
        }
      }
      if (template.listFilter.type !== 'All') {
        result = e.content.type === template.listFilter.type
      }
      if (result && template.listFilter.title !== '') {
        const label = `${e.title} ${e.id} ${e.slug}`
        result = fuzzyMatch(title, label)
      }

      return result
    })
    state.component.render()
    render()
  }

  return (
    <div
      className="flex flex-1 flex-col"
      css={css`
        label {
          font-size: 12px !important;
          margin: 0px !important;
          padding: 0px !important;
        }
      `}
    >
      {meta.state.crud && (
        <Toolbar
          id={meta.state.crud.mode === 'form' && get(meta, 'form.id', '')}
          unsaved={meta.state.crud.mode === 'form' && meta.unsaved}
          saving={meta.state.crud.mode === 'form' && meta.saving}
          title={
            meta.state.crud.mode === 'form' && form ? (
              <Fragment>
                {form.db.data.id && (
                  <div className="mr-2 py-1 px-2 rounded-md bg-blue-100">
                    {form.db.data.id}
                  </div>
                )}
                {form.db.data.id > 0
                  ? niceCase(form.db.data.title)
                  : 'Create New Template'}
              </Fragment>
            ) : (
              <div className="flex flex-row items-center">
                <TemplateToolbar
                  doFilter={doFilter}
                  state={list}
                  template={meta.template}
                />
              </div>
            )
          }
          actions={templateActions({
            state: meta.state.root,
            props,
            meta,
            save: async () => {
              await save({ state: meta.state.root, meta, render })
            },
          })}
          back={
            meta.state.crud.mode === 'form' &&
            (async () => {
              if (
                !meta.unsaved ||
                (meta.unsaved &&
                  confirm('Unsaved data will be lost, are you sure ?'))
              ) {
                meta.unsaved = false
                render()
              }

              const res = await api('/__cms/0/list-template')
              meta.template.listOri = res
              await meta.state.crud.setMode('list')
              localStorage.setItem('template-current-row-id', '')
            })
          }
        />
      )}

      <div className="flex flex-1 flex-row items-stretch">
        {meta.state.crud && meta.state.crud.mode === 'list' && (
          <div
            className="flex select-none flex-col items-end border-r border-gray-200 py-2"
            css={css`
              width: 30px;

              .tab {
                background: white;
                margin-right: -1px;
                border-color: #ececeb;

                label {
                  color: #bbb;
                  font-size: 13px !important;
                }
                &:hover {
                  opacity: 0.6;
                }
                &.active {
                  opacity: 1;
                }
                &.active,
                &:hover {
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
                    color: #0d4e98;
                  }
                }
              }
            `}
          >
            {[
              ['All', 40],
              ['Layout', 60],
              ['Page', 50],
              ['API', 40],
              ['WS', 40],
            ].map((e) => {
              return (
                <div
                  key={e[0]}
                  css={css`
                    height: ${e[1]}px;
                    width: 25px;
                    margin-bottom: 2px;
                  `}
                  className={`flex cursor-pointer items-center justify-center border p-1 tab ${
                    meta.template.listFilter.type === e[0] && 'active'
                  }`}
                  onClick={() => {
                    meta.template.listFilter.type = e[0] as any
                    localStorage['dev-template-filter-type'] = e[0]
                    doFilter()
                  }}
                >
                  <Label className="transform -rotate-90 cursor-pointer">
                    {e[0]}
                  </Label>
                </div>
              )
            })}
          </div>
        )}
        <CRUD
          content={{
            Template: {
              onInit: async ({ state }) => {
                if (!meta.state.root) {
                  meta.state.root = state
                  meta.state.crud = state.crud
                  const res = await api('/__cms/0/list-template')

                  meta.template.listOri = res
                  meta.parents = []
                  for (let i of res) {
                    if (i.content.type === 'Layout') {
                      meta.parents.push(i)
                    }
                  }
                  render()

                  if (localStorage['template-current-row-id']) {
                    state.crud.setMode('form', {})
                  }
                }
              },
              form: {
                header: {
                  enable: false,
                },
                alter: {
                  '*': ({ state, name }) => {
                    return {
                      onChange: (val: any, { row, col }) => {
                        if (col === 'title') {
                          row.title = row.title
                            .replace(/[^a-z0-9]/gim, '-')
                            .replace(/\-+/g, '-')
                            .toLowerCase()
                        } else if (col === 'slug') {
                          row.slug = row.slug
                            .replace(/[^a-z0-9\-\/]/gim, '-')
                            .toLowerCase()
                        }

                        meta.unsaved = true
                        render()
                      },
                    }
                  },
                  title: {
                    title: 'Name',
                    type: 'text',
                  },
                  'content.type': {
                    title: 'Type',
                    type: 'select',
                    items: ['Layout', 'API', 'Page', 'WS'],
                  },
                  parent_id: ({ row }) => {
                    return {
                      title: 'Parent Layout',
                      type: 'select',
                      items: meta.parents
                        .filter((e) => e.id !== row.id)
                        .map((e) => ({
                          value: e.id.toString(),
                          label: e.title,
                        })),
                    }
                  },
                  domain: {
                    title: 'Domain (without http://)',
                  },
                  server_on_load: ({ row, Component, props }) => {
                    return (
                      <Component {...props} title="Server on Load">
                        <FieldCode
                          value={row.content.server_on_load}
                          defaultValue={`
async ({template, params, render, db, req, reply, user, log, ext, isDev, api }: Server) => {
    await render(template, params)
}
                `.trim()}
                          onChange={(val) => {}}
                        />
                      </Component>
                    )
                  },
                },
                layout: [
                  ({ layout, row }) => {
                    const content = row.content

                    if (!content) return null
                    const hasLayout = content.type !== 'Layout' || !content.type

                    const filePath = `/app/web/cms/templates/${row.id}.html`
                    return (
                      <div
                        className={`flex flex-1 items-stretch ${
                          row.id
                            ? `items-stretch`
                            : `justify-center items-center`
                        }`}
                      >
                        <div
                          className="flex flex-col"
                          css={css`
                            flex-basis: 250px;
                          `}
                        >
                          {layout([
                            'title',
                            ['content.type', 'parent_id'],
                            'domain',
                            hasLayout && 'slug',
                            hasLayout &&
                              content.type === 'Page' &&
                              'server_on_load',
                          ])}
                        </div>
                        {row.id && (
                          <div
                            className="flex items-stretch flex-1 flex-col "
                            css={css`
                              padding-top: 12px;
                            `}
                          >
                            <div className="flex flex-1 border rounded-sm border-gray-500 my-2 ml-3 relative">
                              <Label
                                className="absolute"
                                css={css`
                                  top: -20px;
                                `}
                              >
                                {content.type === 'API'
                                  ? 'Server On Load'
                                  : 'Template'}
                              </Label>
                              <div className="absolute flex inset-0 overflow-hidden">
                                <TemplateCode
                                  figma={row.content.figma || {}}
                                  value={
                                    content.type === 'API'
                                      ? get(row, 'content.server_on_load', ``)
                                      : get(row, 'content.template', ``)
                                  }
                                  type={content.type}
                                  name={row.title}
                                  filePath={filePath}
                                  onChange={(v, figma) => {
                                    row.content.figma = figma
                                    if (content.type === 'API') {
                                      row.content.server_on_load = v
                                    } else {
                                      row.content.template = v
                                    }
                                    meta.unsaved = true
                                    render()
                                  }}
                                  setUnsaved={(unsaved) => {
                                    meta.unsaved = unsaved
                                    render()
                                  }}
                                  onMount={(getCursor, formatCode) => {
                                    meta.monaco = { getCursor, formatCode }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  },
                ],
                onInit: async (state) => {
                  meta.state.form = state as IBaseFormContext
                  const id = localStorage.getItem('template-current-row-id')

                  for (let i of meta.template.listOri) {
                    if (i.id === id) {
                      meta.state.form.db.data = i
                      break
                    }
                  }
                  render()
                },
              },
              list: {
                onInit: async (state) => {
                  meta.state.list = state as IBaseListContext

                  if (
                    !meta.state.list.db.list ||
                    meta.state.list.db.list.length === 0
                  ) {
                    meta.state.list.db.list = clone(meta.template.listOri)
                  }
                  doFilter()
                },
                filter: false,
                table: {
                  onRowClick: (row, idx, ev, state) => {
                    waitUntil(
                      () => get(meta, 'state.crud.mode') === 'form'
                    ).then(render)
                    localStorage.setItem('template-current-row-id', row.id)

                    const parent = state.tree.parent as ICRUDContext
                    if (parent) {
                      parent.crud.setMode('form', {})
                    }
                    return false
                  },
                  columns: [
                    ['id', { width: 30 }],
                    [
                      'parent_id',
                      {
                        title: 'Type',
                        width: 70,
                        value: (row) => {
                          let cls = ''
                          switch (row.content.type) {
                            case 'Layout':
                              cls = 'text-white bg-purple-600'
                              break
                            case 'API':
                              cls = 'text-white bg-yellow-500'
                              break
                            default:
                              cls = 'bg-gray-100'
                              break
                          }

                          return (
                            <div
                              className={
                                cls +
                                ' flex items-center justify-center w-full p-1 text-xs font-medium  rounded-sm'
                              }
                            >
                              {row.content.type || 'Page'}
                            </div>
                          )
                        },
                      },
                    ],
                    ['title', { width: 500 }],
                    [
                      'parent_id',
                      {
                        title: 'Layout',
                        width: 80,
                        value: (row) => {
                          if (row.content.type !== 'Page')
                            return <div className="flex-1 pl-2">&mdash;</div>

                          const st = meta.parents.find(
                            (e) => e.id === row.parent_id
                          )
                          if (!st) return null
                          return (
                            <Label className="p-0 px-2 border border-gray-200 rounded-sm">
                              {st && st.title}
                            </Label>
                          )
                        },
                      },
                    ],
                    [
                      'site',
                      {
                        title: 'Domain',
                        width: 100,
                        value: (row) => {
                          return (
                            <div className="w-full p-1 text-xs font-medium text-center bg-gray-100 rounded-sm ">
                              {row.site && row.site.trim() === '*'
                                ? 'All Domain'
                                : row.site || '-'}
                            </div>
                          )
                        },
                      },
                    ],
                    [
                      'slug',
                      {
                        title: 'Slug',
                        width: 300,
                        value: (row) => {
                          return row.content.type === 'Page' ||
                            row.content.type === 'API' ? (
                            <div className="flex text-xs font-medium ">
                              {row.slug}
                            </div>
                          ) : (
                            <div className=""></div>
                          )
                        },
                      },
                    ],
                  ],
                },
              },
            },
          }}
        />
      </div>
    </div>
  )
}

const save = async (props: {
  state: ICRUDContext
  meta: any
  render: () => void
}) => {
  const { state, meta, render } = props
  await waitUntil(() => state.tree.children.form)
  const formstate = state.tree.children.form as IBaseFormContext
  const form = formstate.db.data

  if (window.devFormatCode) {
    await window.devFormatCode()
  }

  if (form.content.type === 'API') {
    if (!form.content.server_on_load) {
      form.content.server_on_load = `
async ({template, params, render, db, req, reply, user, log, ext, isDev }: Server) => {
reply.send({
  hello: "world"
})
}`.trim()
      render()
    }
  }

  meta.unsaved = false
  meta.saving = true
  render()

  const formdata = {}
  for (let [k, v] of Object.entries(form)) {
    if (!k.startsWith('_')) formdata[k] = v
  }

  const res = await api('/__cms/0/save-template', formdata)

  await api(`/__cms/${form.id}/reload-template`, undefined, {
    raw: true,
  })

  api('/__cms/0/broadcast-reload', {
    id: form.id,
  })

  if (res && res.data) {
    for (let [k, v] of Object.entries(res.data)) {
      if (k.indexOf('__') === 0) continue
      form[k] = v
    }
  }
  meta.saving = false
  render()
}
