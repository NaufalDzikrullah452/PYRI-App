/** @jsx jsx */
import { jsx } from '@emotion/react'
import { db } from 'libs'
import get from 'lodash.get'
import set from 'lodash.set'
import {
  Context,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useRef,
} from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { niceCase } from 'web.utils/src/niceCase'
import { picomatch } from 'web.utils/src/picomatch'
import { removeCircular } from 'web.utils/src/removeCircular'
import { useRender } from 'web.utils/src/useRender'
import type {
  ITableColumn,
  ITableDefinitions,
  ITableRelation,
} from '../../../ext/types/qlist'
import { ICRUDContext } from '../../../ext/types/__crud'
import type {
  IBaseFieldContext,
  IBaseFormContext,
  IBaseFormProps,
  IFormAlterField,
  IFormLayout,
} from '../../../ext/types/__form'
import { IBaseListContext } from '../../../ext/types/__list'
import { initializeState } from '../context-state'
import { generateStateID } from '../CRUD'
import { lang } from '../lang/lang'
import { populateList } from '../list/BaseList'
import { detectType } from '../utils/detect-type'
import { Loading } from '../view/loading'
import { BaseField } from './BaseField'
import { extractColFromLayout, RecursiveLayout } from './BaseFormLayout'
import { resolveValueAsync } from './mobile/fields/Minfo'
import { MFormWrapper } from './mobile/MFormWrapper'
import { WFormWrapper } from './web/WFormWrapper'
declare const window: BaseWindow

export const BaseForm = (props: IBaseFormProps) => {
  const {
    id,
    parentCtx,
    table,
    data,
    split,
    alter,
    onLoad,
    header,
    tabs,
    layout,
    params,
  } = props
  const render = useRender()
  const _ = useRef({
    init: false,
    ctx: createContext({} as IBaseFormContext),
    state: {} as IBaseFormContext,
  })
  const meta = _.current
  const parent = parentCtx ? useContext(parentCtx) : null

  useEffect(() => {
    if (meta.init) {
      meta.state.db.data = data
      render()
    }
  }, [data])

  useEffect(() => {
    if (meta.init) {
      meta.state.config.header = header
      render()
    }
  }, [header])

  useEffect(() => {
    if (meta.init) {
      createFormContext(props, meta, render)
      initializeState(meta.state, parent)
      initializeForm(meta.state, meta.ctx, render).then(() => {
        render()
      })
    }
  }, [table, alter])

  useEffect(() => {
    ;(async () => {
      createFormContext(props, meta, render)
      if (meta.state.config.onInit) {
        meta.state.config.onInit(meta.state)
      }
      initializeState(meta.state, parent)
      await initializeForm(meta.state, meta.ctx, render)
      meta.init = true
      render()
    })()
  }, [])

  if (!meta.init) {
    if (meta.state.db && meta.state.db.loading) {
      return <Loading />
    }
    return null
  }

  if (typeof meta.state.db.data === 'object') {
    defineRowMeta(meta.state)
  }

  const FormWrapper = window.platform === 'web' ? WFormWrapper : MFormWrapper
  return (
    <meta.ctx.Provider value={meta.state}>
      <FormWrapper ctx={meta.ctx}>
        <RecursiveLayout
          layout={meta.state.config.layout}
          state={meta.state}
          ctx={meta.ctx}
          direction="col"
        />
      </FormWrapper>
    </meta.ctx.Provider>
  )
}

const defineRowMeta = (state: IBaseFormContext) => {
  state.db.data.__defineGetter__('__meta', function () {
    return {
      get isNew() {
        if (state.db.definition) {
          return !state.db.data[state.db.definition.pk]
        }
      },
      get pk() {
        if (state.db.definition) return state.db.data[state.db.definition.pk]
      },
      get state() {
        return state
      },
      get raw() {
        const data = {}
        for (let [k, v] of Object.entries(state.db.data)) {
          if (!k.startsWith('__')) data[k] = v
        }
        return data
      },
    }
  })
}

export const initializeForm = async (
  state: IBaseFormContext,
  ctx: Context<IBaseFormContext>,
  render: () => void
) => {
  const mdb = state.db
  const mf = state.config

  if (!state.fieldTypes) {
    if (window.baseFormFieldTypes) {
      state.fieldTypes = window.baseFormFieldTypes
    } else {
      if (window.platform === 'web') {
        state.fieldTypes = (await import('./web/fields')).default
      } else if (window.platform === 'mobile') {
        state.fieldTypes = (await import('./mobile/fields')).default
      }
      window.baseFormFieldTypes = state.fieldTypes
    }
  }

  if (!mdb.definition) {
    if (mdb.tableName) {
      mdb.definition = await db[mdb.tableName].definition()
    } else {
      const columns = {} as ITableDefinitions['columns']
      const layoutCols = await extractColFromLayout({
        layout: mf.layout,
        state,
        ctx,
      })

      for (let i of layoutCols) {
        columns[i] = {
          type: detectType(mdb.data[i]) || 'string',
          name: i,
          pk: false,
          nullable: true,
        }
      }

      mdb.definition = { columns, db: { name: '' }, pk: '', rels: {} }
    }
  }

  if (mdb.definition) {
    if (typeof mdb.data === 'object') {
      if (mdb.data.__crudLoad) {
        mdb.loading = true
        render()

        const type = mdb.definition.columns[mdb.definition.pk].type
        const row = await mdb.query((params) => {
          if (!params) {
            params = {}
          }

          if (params && !params.where) {
            params.where = {}
          }

          if (params && params.where) {
            params.where[mdb.definition.pk] =
              type === 'number'
                ? parseInt(mdb.data.__crudLoad)
                : mdb.data.__crudLoad
          }
          return params
        })

        if (row) {
          delete mdb.data.__crudLoad
          for (let [k, v] of Object.entries(row)) {
            if (k.indexOf('__') < 0) {
              mdb.data[k] = v
            }
          }
        }

        mdb.loading = false
        render()
      }

      for (let [k, v] of Object.entries(mdb.definition.rels)) {
        if (!mdb.data[k]) {
          mdb.data[k] = v.relation === 'Model.BelongsToOneRelation' ? {} : []
        }
      }
    } else if (mdb.data === undefined) {
      await mdb.query()
    }

    if (mf.layout.length === 0) {
      await generateDefaultLayout(state)
    }

    await generateFieldsForLayout(state.config.layout, state, ctx)
  }

  if (mf.onLoad) {
    if (!!mdb.data && !!mdb.data.__meta) {
      defineRowMeta(state)
    }
    mf.onLoad(mdb.data, state)
  }
}

export const deepUpdate = (
  obj: any,
  replacer: any,
  objectCache?: WeakSet<any>
) => {
  if (!objectCache) {
    objectCache = new WeakSet()
  }
  for (const key of Object.keys(replacer)) {
    if (key.startsWith('_')) continue

    const val = replacer[key]
    const dec = Object.getOwnPropertyDescriptor(obj, key)
    if (dec && !dec.writable) {
      continue
    }

    if (typeof val === 'object' && val !== null) {
      if (val instanceof Date) {
        obj[key] = val
      } else {
        if (!obj[key]) {
          obj[key] = val
        } else {
          if (!objectCache.has(val)) {
            objectCache.add(val)
            deepUpdate(obj[key], val, objectCache)
          }
        }
      }
    } else {
      obj[key] = val
    }
  }

  return obj
}

export const weakUpdate = (
  obj: any,
  replacer: any,
  objectCache?: WeakSet<any>
) => {
  if (!objectCache) {
    objectCache = new WeakSet()
  }
  for (const key of Object.keys(replacer)) {
    if (key.startsWith('_')) continue

    const val = replacer[key]
    const dec = Object.getOwnPropertyDescriptor(obj, key)
    if (dec && !dec.writable) {
      continue
    }

    if (typeof val === 'object' && val !== null) {
      if (val instanceof Date) {
        obj[key] = val
      } else {
        if (!obj[key]) {
          obj[key] = val
        } else {
          if (!objectCache.has(val)) {
            objectCache.add(val)
            weakUpdate(obj[key], val, objectCache)
          }
        }
      }
    } else if (typeof val === 'function') {
      if (typeof obj[key] !== 'function') {
        obj[key] = val
      }
      // skip function
    } else {
      obj[key] = val
    }
  }

  return obj
}

const generateDefaultLayout = async (state: IBaseFormContext) => {
  const result: string[] = []
  if (state.db.definition) {
    for (let [k, _] of Object.entries(state.db.definition.columns)) {
      if (k.indexOf('_id') >= 0 || k.indexOf('id_') >= 0 || k === 'id') {
        continue
      }

      result.push(k)
    }

    for (let [_, v] of Object.entries(state.db.definition.rels)) {
      if (v.relation === 'Model.BelongsToOneRelation') {
        result.push(v.join.from)
      }
    }
    const layout = state.config.layout
    layout.splice(0, layout.length)
    let cur: string[] = []
    for (let i of result) {
      if (cur.length < 2) {
        cur.push(i)
      } else {
        layout.push(cur)
        cur = []
      }
    }
  }
}

export const generateFieldsForLayout = async (
  layout: IFormLayout,
  state: IBaseFormContext,
  ctx: Context<IBaseFormContext>
) => {
  const fields = state.config.fields
  if (state.db.definition) {
    for (let s of layout) {
      if (typeof s === 'string') {
        let required = false
        let type = 'string'

        let colName = s
        if (!s.startsWith('::') && s.indexOf(':') > 0) {
          colName = s.split(':').shift()
        }
        const col = state.db.definition.columns[colName]
        if (col) {
          type = col.type
          required = !col.nullable
        }

        let colTitle = niceCase(colName)
        if (colName.indexOf('.') > 0 || state.db.definition.rels[colName]) {
          const frel = colName.split('.')
          colTitle = niceCase(frel[frel.length - 1])
          let lastRel = null as ITableRelation
          let lastDef = state.db.definition
          let relCol = null as ITableColumn
          for (let relName of frel) {
            if (lastDef) {
              const result = await getRelation(relName, lastDef)
              if (result) {
                lastRel = result.rel
                lastDef = result.def
              } else if (lastDef && lastDef.columns[relName]) {
                relCol = lastDef.columns[relName]
                break
              }
            }
          }

          if (relCol) {
            type = relCol.type
          } else {
            if (lastRel) {
              if (lastRel.relation === 'Model.HasManyRelation') {
                type = 'has-many'
                if (window.platform === 'web') {
                  const pk = state.db.definition.pk
                  if (!!state.db.data[pk]) {
                    if (state.config.tab.list.indexOf(colName) < 0) {
                      state.config.tab.list.push(colName)
                    }
                  }
                }
              } else if (lastRel.relation === 'Model.BelongsToOneRelation') {
                type = 'belongs-to'
              }
            }
          }
        }

        const fieldState: IBaseFieldContext = {
          title: colTitle,
          name: colName,
          ctx,
          error: '',
          required,
          type,
          get value() {
            if (typeof colName === 'string') {
              return get(state.db.data, colName)
            }
            return undefined
          },
          set value(newval) {
            if (typeof colName === 'string') {
              set(state.db.data, colName, newval)
            }
          },
          render: () => {},
        } as any

        const applyAlter = (name: string, alter: IFormAlterField) => {
          if (typeof alter === 'object') {
            deepUpdate(fieldState, alter)
          } else if (
            typeof alter === 'function' &&
            typeof colName === 'string'
          ) {
            const props = {
              name,
              ctx,
            }
            const alterResult = alter({
              name: colName,
              row: state.db.data,
              state,
              Component: BaseField,
              props,
            })

            if (typeof alterResult === 'object') {
              if (!isValidElement(alterResult)) {
                for (let i of Object.keys(props)) {
                  if (i !== 'name' && i !== 'ctx') {
                    alterResult[i] = props[i]
                  }
                }
                deepUpdate(fieldState, alterResult)
              } else {
                const newProps = {}
                for (let i of Object.keys(props)) {
                  if (i !== 'name' && i !== 'ctx') {
                    newProps[i] = props[i]
                  }
                }
                deepUpdate(fieldState, newProps)
                fieldState.customRender = alter as any
              }
            }
          }
        }

        if (state.config.alter) {
          if (state.config.alter['*']) {
            applyAlter('*', state.config.alter['*'])
          }

          for (let [k, v] of Object.entries(state.config.alter)) {
            if (k === '*') continue
            if (picomatch.isMatch(colName, k)) {
              applyAlter(k, v)
            }
          }
        }

        fields[colName] = {
          state: fieldState,
        }
      } else if (Array.isArray(s)) {
        generateFieldsForLayout(s, state, ctx)
      } else if (typeof s === 'function') {
        s({
          row: generateDummyData(state, state.db.tableName || ''),
          update: () => {},
          state,
          watch: () => {},
          layout: (l) => {
            generateFieldsForLayout(l, state, ctx)
            return <></>
          },
        })
      }
    }
  }
}

const generateDummyData = (state: IBaseFormContext, tableName: string) => {
  const def = state.db.definition
  const result = state.db.data
    ? state.db.data
    : new Proxy(
        {},
        {
          get(target, name) {
            const key = name.toString()
            if (def) {
              if (def.columns[key]) {
                return undefined
              } else if (def.rels[key]) {
                const rel = def.rels[key]
                if (rel.relation === 'Model.BelongsToOneRelation') {
                  return generateDummyData(state, rel.modelClass)
                }
              }
            }
            return []
          },
        }
      )
  return result
}

const getRelation = async (col: string, def: ITableDefinitions) => {
  if (def && def.rels[col]) {
    const rel = def.rels[col]
    return {
      def: (await db[rel.modelClass].definition()) as ITableDefinitions,
      rel,
    }
  }
}

export const defaultActions: any = {
  delete: true,
  save: true,
}

export const createFormContext = (
  props: IBaseFormProps,
  meta: { state: IBaseFormContext },
  render: () => void
) => {
  const {
    id,
    parentCtx,
    table,
    data,
    split,
    alter,
    onSave,
    onLoad,
    onInit,
    header,
    tabs,
    layout,
  } = props
  let params: any = parseParams(props)

  let action: any = table
    ? {
        delete: true,
        save: true,
      }
    : {}

  if (props.action) {
    if (typeof props.action === 'function') {
      action = props.action
    } else if (typeof props.action === 'object') {
      action = { ...action, ...(props.action as any) }
    }
  }

  const headerAction = get(props, 'header.action')
  if (headerAction) {
    if (typeof headerAction === 'function') {
      action = headerAction
    } else if (typeof props.action === 'object') {
      action = { ...action, ...(headerAction as any) }
    }
  }

  const finalHeader = weakUpdate(
    {
      enable: get(header, 'enable', !!table),
      title:
        get(header, 'title') ||
        (window.platform === 'web' ? niceCase('table') || '' : ''),
      back: (props as any).onBack || get(header, 'back'),
    },
    header || {}
  )
  finalHeader.action = action

  const state = meta.state
  const result: IBaseFormContext = {
    fieldTypes: meta.state.fieldTypes,
    config: {
      header: finalHeader,
      watches: {},
      split: {
        position: get(split, 'position', 'top') as any,
        size: get(split, 'size', '50%'),
      },
      tab: {
        position: get(split, 'tab', 'left'),
        list: [],
        modifier: tabs,
      },
      alter: alter || {},
      layout: layout || [],
      validate: () => {},
      onSave,
      onLoad,
      onInit,
      fields: {},
    },
    component: {
      id: id || generateStateID(),
      type: 'form' as any,
      render,
    },
    tree: {
      root: null as any,
      parent: null,
      children: {},
      getPath: () => {
        return ''
      },
    },
    db: {
      tableName: table,
      data: data,
      definition: null,
      loading: false,
      params,
      get errors() {
        if (state.db.saveErrorMsg) {
          return [state.db.saveErrorMsg]
        }

        let msg = []
        const errors = state.db.lastErrors || {}
        for (let [k, v] of Object.entries(errors)) {
          for (let e of v) {
            msg.push(e)
          }
        }
        return msg
      },
      query: async (params?: any) => {
        let finalParams = {}
        const parent = state.tree.parent as ICRUDContext
        if (parent && parent.crud) {
          const crudListParams = get(parent, 'crud.content.list.params')
          if (crudListParams) {
            finalParams = JSON.parse(JSON.stringify(crudListParams))
          }
        }

        if (params) {
          if (typeof params === 'function') {
            finalParams = params(finalParams, state)
          } else {
            finalParams = params
          }
        } else if (state.db.params) {
          finalParams = state.db.params
        }

        if (Object.keys(finalParams).length > 0) {
          const res = await db[state.db.tableName].findFirst(finalParams)
          if (!state.db.data) {
            state.db.data = {} as any
          }

          if (res) {
            for (let [k, v] of Object.entries(res)) {
              state.db.data[k] = v
            }
          }
          return res
        }
        return null
      },
      delete: async () => {
        if (state.db.definition) {
          if (confirm(lang('Apakah Anda Yakin ?', 'id'))) {
            state.db.loading = true
            render()

            await db[state.db.tableName || ''].delete({
              where: {
                [state.db.definition.pk]: state.db.data[state.db.definition.pk],
              },
            })

            state.db.loading = false

            const parent = state.tree.parent as ICRUDContext

            if (parent.crud) {
              parent.crud.setMode('list')
              const list = parent.tree.children.list as IBaseListContext

              if (list) {
                list.db.query()
              }
            }
          }
        }
      },
      validate: async () => {
        const errors = {}
        for (let [name, field] of Object.entries(state.config.fields)) {
          if (field.state.required) {
            const required = resolveValueAsync({
              definer: field.state.required,
              args: [{ state: state, row: state.db.data, col: name }],
              default: false,
            })

            const value = get(state.db.data, name)
            if (
              required &&
              (value === undefined || value === null || value === '')
            ) {
              if (!errors[name]) {
                errors[name] = []
              }
              errors[name].push(
                lang(
                  '[field] harus diisi.',
                  {
                    field:
                      typeof field.state.title === 'string'
                        ? field.state.title
                        : niceCase(name),
                  },
                  'id'
                )
              )
            }
          }
        }

        state.db.lastErrors = errors
        return errors
      },
      save: async () => {
        const pk = state.db.definition.pk

        const exposedSave = async (data?: any) => {
          state.db.saveErrorMsg = ''
          state.db.saveStatus = 'saving'
          if (state.config.header && state.config.header.render) {
            state.config.header.render()
          }
          render()
          const errors = await state.db.validate()
          if (Object.keys(errors).length > 0) {
            state.db.saveStatus = 'validation-error'
            for (let [k, v] of Object.entries(errors)) {
              if (state.config.fields[k]) {
                state.config.fields[k].state.error = v[0]
              }
            }
            render()
            return false
          }

          if (!data) {
            data = state.db.data.__meta.raw
          }
          let def = state.db.definition?.columns
          for (let [k, value] of Object.entries(data)) {
            if (
              !state.db.definition.rels[k] &&
              !state.db.definition.columns[k]
            ) {
              delete data[k]
            }
            if (def && def[k] && typeof data[k] !== def[k].type) {
              if (def[k].type === 'number') {
                let cols = parseFloat(data[k])
                set(state.db.data, k, cols)
                data[k] = cols
              } else if (def[k].type === 'boolean') {
                data[k] = data[k] === "true"
              }
            }
            if (
              value === null ||
              value === undefined ||
              (Array.isArray(value) && value.length === 0)
            ) {
              delete data[k]
            }
          }

          for (let [_, v] of Object.entries(state.db.definition.rels)) {
            if (v.relation === 'Model.BelongsToOneRelation') {
              const from = v.join.from.split('.').pop()
              const to = v.join.to.split('.').pop()
              delete data[from]

              const m = data[v.modelClass]
              if (m) {
                if (
                  m.disconnect ||
                  m.create ||
                  (m.connect && v.modelClass === _) ||
                  m.connectOrCreate
                ) {
                  if (m.disconnect && !data[from]) {
                    delete data[v.modelClass]
                  }
                  delete data[from]
                } else {
                  const rel = (await db[
                    v.modelClass
                  ].definition()) as ITableDefinitions

                  let key = Object.keys(data[v.modelClass])[0]
                  if (data[v.modelClass] && data[v.modelClass][rel.pk]) {
                    // if (Object.keys(data[v.modelClass]).length === 1) {
                    data[v.modelClass] = {
                      connect: {
                        [to]: data[v.modelClass][to],
                      },
                    }
                    // } else {
                    //   data[v.modelClass] = {
                    //     update: data[v.modelClass],
                    //   }
                    // }
                  } else if (
                    data[v.modelClass] &&
                    data[v.modelClass][key] &&
                    key !== 'connect'
                  ) {
                    data[v.modelClass] = {
                      connect: {
                        [to]: data[v.modelClass][key],
                      },
                    }
                  } else if (data[_] && data[_][rel.pk]) {
                    data[_] = {
                      connect: {
                        [to]: data[_][to],
                      },
                    }
                  }
                }
              }
            } else {
              delete data[v.modelClass]
            }
          }

          const pkVal = data[pk]
          delete data[pk]

          let savedData = null as any
          console.log('okeokoke', data)
          if (state.db.data.__meta.isNew) {
            savedData = await db[state.db.tableName].create({
              data: data,
            })
          } else {
            savedData = await db[state.db.tableName].update({
              data,
              where: {
                [pk]: pkVal,
              },
            })
          }

          if (savedData && savedData.status === 'failed') {
            state.db.saveStatus = 'failed'
            state.db.saveErrorMsg = savedData.reason
            render()
            return false
          } else {
            state.db.data[pk] = savedData[pk]
            state.db.saveStatus = 'success'
            render()

            if (state.tree.parent && (state.tree.parent as any).crud) {
              const crud = state.tree.parent as ICRUDContext
              if (crud.tree.children && crud.tree.children.list) {
                const list = crud.tree.children.list as IBaseListContext
                if (list.db.list) {
                  // for (let [idx, row] of Object.entries(list.db.list) as any) {
                  //   if (row[pk] === savedData[pk]) {
                  //     weakUpdate(list.db.list[idx], state.db.data)
                  //   }
                  // }
                  await list.db.query()
                }
              }
              crud.crud.setMode('list')
            }

            return true
          }
        }

        if (state.config.onSave) {
          const res: any = await state.config.onSave({
            state,
            data: state.db.data.__meta.raw,
            save: exposedSave,
            saving: (saving?: boolean) => {
              state.db.saveStatus =
                saving === undefined || !!saving ? 'saving' : 'ready'
              state.component.render()
            },
          })
          return !!res
        } else {
          return await exposedSave()
        }
      },
      saveStatus: 'ready',
    },
  }
  deepUpdate(meta.state, result)
}

const parseParams = (props: any) => {
  let params: any = {}
  if (props.params) {
    params = props.params
  }

  if ((props as any).where) {
    params.where = props.where
  }

  if ((props as any).include) {
    params.include = props.include
  }
  return params
}
