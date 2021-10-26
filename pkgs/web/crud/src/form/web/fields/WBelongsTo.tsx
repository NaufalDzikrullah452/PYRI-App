/** @jsx jsx */
import { jsx } from '@emotion/react'
import { db } from 'libs'
import find from 'lodash.find'
import get from 'lodash.get'
import set from 'lodash.set'
import { useContext, useEffect, useRef } from 'react'
import { useRender } from 'web.utils/src/useRender'
import type { IBaseFieldProps } from '../../../../../ext/types/__form'
import { PureSelect } from './WSelect'

export const WBelongsTo = (props: IBaseFieldProps) => {
  const render = useRender()
  const _ = useRef({
    loading: false,
    rawItems: [] as any,
    items: [] as any,
    params: null as any,
    value: 0 as any,
    labelLoaded: false,
    async queryLabel() {
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
            const alter = form.config.alter[props.name] as any

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

            meta.loading = false
            render()

            setTimeout(() => {
              meta.labelLoaded = true
            }, 500)
          }
        }
      }
    },
    getParams() {
      let params = {}
      const alter = form.config.alter[props.name] as any
      if (alter) {
        if (typeof alter.params === 'function') {
          params = alter.params(form.db.data)
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
        meta.rawItems = await db[rel.modelClass].findMany(this.params)
        meta.items = meta.rawItems.map((e) => {
          const res = labelText({ e, alter, to })
          if (e[to] === meta.value) {
            set(
              form,
              `__belongsToLabelCache.${relName}.${to}.${meta.value}`,
              res.label
            )
          }
          return res
        })
        meta.loading = false
        render()
      }
    },
  })
  const meta = _.current
  const form = useContext(props.ctx)
  const relName =
    (props.name.indexOf('.') > 0
      ? props.name.split('.').shift()
      : props.name) || props.name

  const rel = form.db.definition?.rels[relName]
  const to = rel?.join.to.split('.').pop() || ''
  const from = rel?.join.from.split('.').pop() || ''
  const state = (form.config.fields[props.name] || {}).state

  useEffect(() => {
    meta.queryLabel()
  }, [])

  if (meta.labelLoaded) {
    const params = meta.getParams()
    if (JSON.stringify(params) !== JSON.stringify(meta.params)) {
      meta.params = params
      meta.query()
    }
  }

  return (
    <>
      <PureSelect
        onChange={(value) => {
          if (!state.value) {
            state.value = {}
          }
          if (typeof state.onChange === 'function')
            state.onChange(value, {
              state: form,
              row: form.db.data,
              col: props.name,
            })
          if (typeof form.db.data[relName] === 'object') {
            for (let row of meta.rawItems) {
              if (row[to] === value) {
                form.db.data[relName] = row
              }
            }
          }
          form.db.data[from] = value
          meta.value = value
          props.internalChange(value)
        }}
        loading={!!(meta.loading || !state)}
        onDropDown={() => {
          const params = meta.getParams()
          if (JSON.stringify(params) !== JSON.stringify(meta.params)) {
            meta.params = params
            meta.query()
          }
        }}
        value={meta.value}
        items={meta.items}
      />
    </>
  )
}

export const labelText = ({ e, alter, to }) => {
  let label = e.name || e.nama || e.value || e.text || ''

  if (!label) {
    for (let [k, v] of Object.entries(e)) {
      if (k.indexOf('_id') < 0 && k.indexOf('id_') < 0 && k !== 'id') {
        if (typeof v === 'string') {
          label = v
        }
        break
      }
    }
  }

  if (alter && alter.label) {
    label = alter.label(e)
  }

  return {
    value: e[to],
    label,
  }
}
