/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { List, ListItem, Sheet } from 'framework7-react'
import { db, waitUntil } from 'libs'
import find from 'lodash.find'
import get from 'lodash.get'
import set from 'lodash.set'
import { useContext, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { niceCase } from 'web.utils/src/niceCase'
import { useRender } from 'web.utils/src/useRender'
import type { IBaseFieldProps } from '../../../../../ext/types/__form'
import CRUD from '../../../CRUD'
import { deepUpdate, weakUpdate } from '../../BaseForm'
import { labelText } from '../../web/fields/WBelongsTo'
import { resolveValue } from './Minfo'

export const MBelongsTo = (props: IBaseFieldProps) => {
  const render = useRender()
  const _ = useRef({
    loading: false,
    items: [] as any,
    params: null as any,
    opened: false,
    value: 0 as any,
    labelLoaded: false,
    labelLoading: false,
    async queryLabel() {
      if (meta.labelLoading) return
      meta.labelLoading = true
      if (!meta.labelLoaded) {
        meta.value = get(form.db.data, from)

        const found = find(meta.items, { value: meta.value })

        if (!found && !meta.loading && !!meta.value && rel) {
          const cache = get(
            form,
            `__belongsToLabelCache.${relName}.${to}.${meta.value}`
          )

          if (cache) {
            meta.items = [...meta.items, { value: meta.value, label: cache }]
            return
          }

          if (!meta.loading) {
            meta.loading = true
            render()

            const res = (
              await db[rel.modelClass].findMany({
                where: {
                  [to]: meta.value,
                },
              })
            ).map((e) => {
              return labelText({ e, alter, to })
            })
            meta.items = [...meta.items, res[0]]
            set(
              form,
              `__belongsToLabelCache.${relName}.${to}.${meta.value}`,
              res[0].label
            )
          }
        }

        meta.loading = false
        meta.labelLoading = false
        meta.labelLoaded = true
        render()
      }
    },
    getParams() {
      let params = {}
      const alter = form.config.alter[props.name] as any
      if (alter) {
        if (typeof alter.params === 'function') {
          params = alter.params(form.db.data, form)
        } else if (typeof alter.params === 'object') {
          params = { ...alter.params }
        }
      }
      return params
    },
    async query() {
      if (rel) {
        meta.value = form.db.data[from]
        const alter = form.config.alter[props.name] as any

        meta.loading = true
        render()
        meta.items = (await db[rel.modelClass].findMany(this.params)).map(
          (e) => {
            const res = labelText({ e, alter, to })
            if (e[to] === meta.value) {
              set(
                form,
                `__belongsToLabelCache.${relName}.${to}.${meta.value}`,
                res.label
              )
            }
            return res
          }
        )
        meta.loading = false
        render()
      }
    },
  })
  const meta = _.current
  const form = useContext(props.ctx)
  const alter = form.config.alter[props.name] as any
  const relName =
    (props.name.indexOf('.') > 0
      ? props.name.split('.').shift()
      : props.name) || props.name

  const rel = form.db.definition?.rels[relName]
  const to = rel?.join.to.split('.').pop() || ''
  const from = rel?.join.from.split('.').pop() || ''
  const state = (form.config.fields[props.name] || {}).state

  const required = resolveValue({
    definer: state.required,
    args: [{ state: form, row: form.db.data, col: name }],
    render,
    default: false,
  })

  const selected = find(meta.items, { value: meta.value }) || { label: '' }

  const sheet = {
    class: `bt-${form.tree
      .getPath()
      .replace(/\W+/gi, '-')}-${props.name.replace(/\W+/gi, '-')}`,
    title: typeof state.title === 'string' ? state.title : niceCase(props.name),
  }

  useEffect(() => {
    if (!meta.labelLoaded) {
      meta.queryLabel()
    }
  }, [])

  if (!rel || !meta.labelLoaded) {
    return null
  }

  const crudlist = {
    title: sheet.title,
    onLoad: (list) => {
      meta.items = list.map((e) => {
        return labelText({ e, alter, to })
      })
    },
    table: {
      swipeout: (row, { Edit, Delete }) => {
        return (
          <>
            <Edit />
            <Delete />
          </>
        )
      },
    },
    params: meta.getParams(),
  } as any
  deepUpdate(crudlist, (state as any).list || {})
  crudlist.table.onRowClick = (row, idx, ev) => {
    const onRowClick = get(state, 'list.table.onRowClick')
    if (typeof onRowClick === 'function') {
      const result = onRowClick(row, idx, ev)
      if (result) return
    }
    if (idx < 0 || (ev && ev.mode === 'edit')) {
      // Create Button / Edit Button
      return true
    }

    const value = row[to]
    if (!state.value) {
      state.value = {}
    }

    if (typeof state.onChange === 'function')
      state.onChange(value, {
        state: form,
        row: form.db.data,
        col: props.name,
      })

    if (typeof form.db.data[relName] === 'object')
      form.db.data[relName][to] = value

    form.db.data[from] = value
    meta.value = value
    props.internalChange(value)
    meta.opened = false
    render()
  }
  const crudform = (state as any).form || undefined


  return (
    <>
      <List
        className={`${required ? 'required' : ''} flex flex-col `}
        mediaList
        css={css`
          .item-text {
            font-size: var(--f7-input-info-font-size);
            position: relative;
            margin-top: -8px;
          }
          .item-title {
            font-size: var(--f7-label-font-size) !important;
            font-weight: var(--f7-label-font-weight) !important;
            line-height: var(--f7-label-line-height) !important;
            color: var(--f7-label-text-color) !important;
          }
          .item-subtitle {
            height: var(--f7-input-height);
            color: var(--f7-input-text-color);
            font-size: var(--f7-input-font-size);
            background-color: var(--f7-input-bg-color, transparent);
            padding-left: var(--f7-input-padding-left);
            padding-right: var(--f7-input-padding-right);
            display: flex;
            align-items: center;
          }
        `}
      >
        <ListItem
          link={'#'}
          title={state.title as any}
          className={`${state.error ? 'pb-4' : ''}`}
          subtitle={selected.label || '—'}
          text={state.info}
          chevronCenter={true}
          disabled={state.readonly}
          onClick={() => {
            meta.opened = true
            render()
          }}
        ></ListItem>

        {state.error && (
          <div
            className="block item-input-error-message"
            css={css`
              margin-top: -23px !important;
            `}
          >
            {state.error}
          </div>
        )}
      </List>
      {createPortal(
        <Sheet
          opened={meta.opened}
          css={css`
            display: ${meta.opened ? 'none' : 'flex'};
            flex-direction: column;
            height: 90vh;

            > .sheet-modal-inner {
              display: flex;
              flex-direction: column;
              height: 100%;
            }
          `}
          onSheetClosed={() => {
            meta.opened = false
            render()
          }}
          swipeToClose
          className={`${sheet.class} h-full`}
          swipeHandler={`.${sheet.class} .form-title`}
        >
          <div className="block-title form-title">{sheet.title}</div>
          {meta.opened && rel && (
            <CRUD
              content={
                {
                  [sheet.title]: {
                    table: rel.modelClass,
                    list: crudlist,
                    form: crudform,
                  },
                } as any
              }
            />
          )}
        </Sheet>,
        document.getElementById('framework7-root') as any
      )}
    </>
  )
}
