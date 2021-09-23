/** @jsx jsx */

import { css, jsx } from '@emotion/react'
import { db, waitUntil } from 'libs'
import cloneDeep from 'lodash.clonedeep'
import get from 'lodash.get'
import { createContext, useContext, useEffect, useRef } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { niceCase } from 'web.utils/src/niceCase'
import { removeCircular } from 'web.utils/src/removeCircular'
import { useRender } from 'web.utils/src/useRender'
import type { ITableDefinitions } from '../../../ext/types/qlist'
import { ICRUDContext } from '../../../ext/types/__crud'
import { IBaseFormContext } from '../../../ext/types/__form'
import type {
  IBaseListContext,
  IBaseListProps,
} from '../../../ext/types/__list'
import { initializeState, saveState } from '../context-state'
import { generateStateID } from '../CRUD'
import { deepUpdate, weakUpdate } from '../form/BaseForm'
import { detectType } from '../utils/detect-type'
import { Loading } from '../view/loading'
import { initializeSingleFilter } from './filter/FilterSingle'

declare const window: BaseWindow

export const BaseList = (props: IBaseListProps) => {
  const {
    id,
    parentCtx,
    table,
    list,
    columns,
    editable,
    query,
    filter,
    wrapRow,
    grid,
    action,
    params,
    platform: platformProp,
    onLoad,
    lateQuery,
    wrapList,
    onInit,
    children,
    mobile,
    title,
    onRowClick,
    header,
    checkbox,
  } = props

  const render = useRender()

  const _ = useRef({
    init: false,
    queryOnInit: false,
    rawList: (props.list || []) as any[],
    ctx: createContext({} as IBaseListContext),
    component: {
      Table: null as any,
      Filter: null as any,
    },
    state: {} as IBaseListContext,
  })
  const meta = _.current
  const parent = parentCtx ? useContext(parentCtx) : null

  let platform: 'web' | 'mobile' = platformProp as any
  if (!platform) {
    platform = window.platform
  }

  useEffect(() => {
    ;(async () => {
      await initializeComponent(meta.component, platform)

      const crud = parent as ICRUDContext
      if (crud && crud.tree.children.list) {
        meta.init = true
        const list = crud.tree.children.list as IBaseListContext
        const result = createListContext({ ...props, platform }, meta, render)
        meta.state = result
        weakUpdate(meta.state, list)
        meta.state.db.list = list.db.list
      } else {
        const result = createListContext(props, meta, render)
        deepUpdate(meta.state, result)
        initializeState(meta.state, parent)
      }

      meta.queryOnInit = typeof onInit === 'undefined'
      if (typeof onInit === 'function') {
        await onInit(meta.state)
        meta.init = true

        if (meta.state.db.list.length > 0) {
          await initializeList(meta.state)
          meta.queryOnInit = true
          if (!meta.state.db.tableName && !meta.state.db.sql) {
            meta.state.db.loading = false
          }
          render()
          return
        } else {
          meta.queryOnInit = true
        }
      } else if (
        Array.isArray(meta.state.db.list) &&
        meta.state.db.list.length > 0
      ) {
        meta.init = true
        await initializeList(meta.state)
        meta.queryOnInit = true
        if (!meta.state.db.tableName && !meta.state.db.sql) {
          meta.state.db.loading = false
        }
        render()
        return
      }

      if (crud && crud.crud && meta.init) {
        if (crud.tree.children.form) {
          const form = crud.tree.children.form as IBaseFormContext
          if (form.db.saveStatus !== 'success') {
            meta.queryOnInit = false
            meta.state.db.loading = false
            render()
          }
        }
      }

      meta.init = true

      if (meta.queryOnInit) {
        await meta.state.db.query()
      }
    })()

    return () => {
      saveState(meta.state, parent)
    }
  }, [])

  useEffect(() => {
    if (meta.init) {
      meta.state.db.definition = null
    }
  }, [table, query])

  useEffect(() => {
    if (Array.isArray(list)) {
      waitUntil(() => meta.init).then(() => {
        if (!meta.state.db.tableName) {
          meta.state.db.list = list || []
          render()
        }
      })
    }
  }, [list])

  if (!meta.init) return null
  if (!meta.component.Table || !meta.component.Filter) {
    initializeComponent(meta.component, platform).then(render)
    return null
  }

  const Table = meta.component.Table
  const Filter = meta.component.Filter

  if (!meta.queryOnInit && !!meta.state.db.loading) return <Loading />

  let showFilter = meta.state.filter.enable && !!meta.state.table.columns

  const content = (
    <meta.ctx.Provider value={meta.state}>
      {showFilter ? (
        <>
          {platform === 'web' &&
            {
              topbar: (
                <div className="flex flex-col flex-1 self-stretch">
                  {showFilter && (
                    <div
                      className="flex items-stretch justify-between border-b border-gray-300"
                      css={css`
                        flex-grow: 0;
                        flex-basis: 40px;
                      `}
                    >
                      <Filter ctx={meta.ctx} />
                    </div>
                  )}
                  <div className="flex flex-1 item-center relative">
                    <Table ctx={meta.ctx} />
                  </div>
                </div>
              ),
            }[get(meta, 'state.filter.web.mode')]}
          {platform === 'mobile' && (
            <div className="flex flex-col flex-1 self-stretch relative">
              <Filter ctx={meta.ctx} />
              <Table ctx={meta.ctx} />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col flex-1 self-stretch relative">
          <Table ctx={meta.ctx} />
        </div>
      )}
    </meta.ctx.Provider>
  )

  if (typeof wrapList === 'function') {
    return wrapList({
      children: content,
      list: meta.state.db.list,
      state: meta.state,
    })
  }
  return content
}

const prepareFilter = async (state: IBaseListContext) => {
  const params = state.db.params
  const filter = state.filter
  const final = JSON.parse(JSON.stringify(params || {}, removeCircular())) || {}

  if (!filter.instances) {
    filter.instances = {}
  }

  for (let [k, f] of Object.entries(filter.instances)) {
    if (f.value) {
      if (!final.where) {
        final.where = {}
      }
      let column = {}
      for (let i of filter.columns) {
        if (Array.isArray(i) && i[1]) {
          column = i[1]
          break
        }
      }

      f.modifyQuery({ params: final, instance: f, column, name: k, state })
    }
  }
  return final
}

const initializeList = async (state: IBaseListContext) => {
  const mdb = state.db
  const mtbl = state.table
  const mflt = state.filter
  if (!mdb.definition) {
    if (mdb.tableName) {
      mdb.definition = await db[mdb.tableName].definition()
    } else {
      const columns: ITableDefinitions['columns'] = {}

      for (let [k, v] of Object.entries(mdb.list[0] || {})) {
        columns[k] = {
          name: k,
          nullable: true,
          pk: false,
          type: detectType(v),
        }
      }
      mdb.definition = {
        columns,
        rels: {},
        pk: '',
        db: {
          name: '',
        },
      }
    }
  }

  if (mdb.definition) {
    const defaultCols = await generateDefaultCols(mdb)

    if (!mtbl.columns) {
      mtbl.columns = defaultCols
    }

    if (!mflt.columns) {
      if (mtbl.columns && Array.isArray(mtbl.columns)) {
        mflt.columns = []
        for (let i of mtbl.columns) {
          const col = Array.isArray(i) ? i[0] : i + ''

          if (!mdb.definition.columns[col] && !mdb.definition.rels[col]) {
            if (col.indexOf('.') < 0) {
              continue
            }
          }

          if (typeof i === 'string') {
            mflt.columns.push([col, { title: niceCase(i) }])
          } else {
            mflt.columns.push([
              col,
              {
                title: get(i, '1.title') || niceCase(i[0]),
              },
            ])
          }
        }
      } else {
        mflt.columns = defaultCols
      }
      if (!mflt.instances) {
        mflt.instances = {}
      }
      for (let i of mflt.columns) {
        const col = Array.isArray(i) ? i[0] : i + ''
        const opt = initializeSingleFilter(
          state,
          col,
          () => {} // filter render is still not available yet
        )
      }
    }

    if (!mflt.instances) {
      mflt.instances = {}
    }

    if (mtbl.columns.length <= 1) {
      mtbl.web.showHeader = false
    }
  }
}

const initializeComponent = async (
  component,
  platform: typeof window['platform']
) => {
  if (!window.baseListComponent) {
    window.baseListComponent = {}
  }
  if (window.baseListComponent[platform]) {
    component.Table = window.baseListComponent[platform].Table
    component.Filter = window.baseListComponent[platform].Filter
  } else {
    if (platform === 'web') {
      if (!component.Table)
        component.Table = (await import('./web/BaseListWeb')).BaseListWeb
      if (!component.Filter)
        component.Filter = (await import('./web/BaseFilterWeb')).BaseFilterWeb
    } else {
      if (!component.Table)
        component.Table = (
          await import('./mobile/BaseListMobile')
        ).BaseListMobile

      if (!component.Filter)
        component.Filter = (
          await import('./mobile/BaseFilterMobile')
        ).BaseFilterMobile
    }
    window.baseListComponent[platform] = component
  }
}

export const populateList = (
  list: any[],
  old: any[],
  state: IBaseListContext
) => {
  const pk = get(state, 'db.definition.pk')
  if (!state.table.rowsMeta) {
    state.table.rowsMeta = new WeakMap()
  }

  const rm = state.table.rowsMeta
  const meta = {}
  old.forEach((row) => {
    for (let i of Object.keys(row)) {
      if (i.indexOf('__') === 0) {
        if (!meta[row[pk]]) {
          meta[row[pk]] = {}
        }

        meta[row[pk]][i] = row[i]
      }
    }
  })

  for (let [k, row] of Object.entries(list)) {
    const idx = Number(k)
    const columns: Record<string, { render: () => void }> = {}
    if (Array.isArray(state.table.columns)) {
      for (let i of state.table.columns) {
        const col = Array.isArray(i) ? i[0] : i
        columns[col] = {
          render: () => {},
        }
      }
    }
    const getRaw = () => {
      const raw = {}
      for (let [k, v] of Object.entries(row)) {
        if (!k.startsWith('__')) {
          raw[k] = v
        }
      }
      return JSON.parse(JSON.stringify(raw))
    }
    rm.set(row, {
      columns: { ...columns },
      idx,
      isNew: !row[pk],
      pk: row[pk],
      meta: meta[row[pk]] || {},
      pos: idx > list.length / 2 ? 'start' : 'end',
      render: () => {},
      get data() {
        return getRaw()
      },
      get raw() {
        return getRaw()
      },
    })

    if (typeof row === 'object') {
      row.__defineGetter__('__listMeta', function () {
        return rm.get(row)
      })
    }
  }

  return list
}

export const baseListFormatOrder = (e: any) => {
  if (!Array.isArray(e) && typeof e === 'object' && !!e) {
    return [e]
  }
  return e || []
}

const generateDefaultCols = async (mdb: IBaseListContext['db']) => {
  if (!mdb.definition) {
    return []
  }

  const result =
    Object.keys(mdb.definition.columns).filter((e) => {
      e = e.toLowerCase()
      if (e.startsWith('id') || e.endsWith('id')) {
        return false
      }

      return true
    }) || []

  for (let [_, v] of Object.entries(mdb.definition.rels)) {
    if (v.relation === 'Model.BelongsToOneRelation') {
      const rel = await db[v.modelClass].definition()
      let col = ''

      if (rel) {
        if (rel.columns.name) col = 'name'
        if (rel.columns.nama) col = 'nama'
        if (!col && rel.columns.value) col = 'value'
        if (!col) {
          for (let e of Object.keys(rel.columns)) {
            const elower = e.toLowerCase()
            if (elower.startsWith('id') || elower.endsWith('id')) {
              continue
            }
            col = e
            break
          }
        }

        if (col) {
          result.push(`${v.modelClass}.${col}`)
        }
      }
    }
  }

  return result
}

const createListContext = (
  props: IBaseListProps,
  meta: { state: IBaseListContext; rawList: any[] },
  render: () => void
) => {
  const {
    id,
    parentCtx,
    table,
    list,
    columns,
    editable,
    query,
    filter,
    wrapRow,
    grid,
    action,
    params,
    onLoad,
    lateQuery,
    wrapList,
    onInit,
    web,
    children,
    mobile,
    title,
    onRowClick,
    platform,
    header,
    checkbox,
  } = props

  const customRenderRow =
    typeof children === 'function'
      ? children
      : typeof columns === 'function'
      ? columns
      : undefined

  let enableFilter = !!filter

  if (filter === undefined) {
    if (platform === 'web') {
      enableFilter = !customRenderRow
    } else {
      enableFilter = true
    }
  }

  const result: IBaseListContext = {
    component: {
      id: id || generateStateID(),
      type: 'list',
      render,
    },
    filter: {
      ...{
        enable: enableFilter,
        web: {
          mode: 'topbar',
        },
        render: () => {},
      },
      ...filter,
    } as any,
    header: {
      ...{
        title: title || niceCase(table || ''),
        action: action || {},
      },
      ...(header ? header : {}),
    },
    grid,
    table: {
      mobile: { ...{ mode: 'list', swipeout: false }, ...mobile },
      web: {
        showHeader: !!customRenderRow ? false : true,
        checkbox,
        ...web,
      },
      editable,
      columns,
      onRowClick,
      wrapRow,
      customRenderRow,
      render: () => {},
    } as any,
    db: {
      definition: null,
      sql: query || '',
      lateQuery,
      query: async () => {
        const mdb = meta.state.db
        const mtbl = meta.state.table
        if (mtbl.customRenderRow) {
          mtbl.web.showHeader = false
        }

        const finalParams = await prepareFilter(meta.state)
        if (!!mdb.tableName) {
          // preparation
          mdb.loading = true
          if (!mdb.definition) {
            await initializeList(meta.state)
          }
          render()

          // load db result
          const result = await db[mdb.tableName].findMany(finalParams)
          mdb.list = result
        } else if (mdb.sql) {
          // preparation
          mdb.loading = true
          render()

          // load db result
          const sql =
            typeof mdb.sql === 'string' ? mdb.sql : mdb.sql(meta.state)

          const result = await db.query(
            typeof sql === 'string' ? sql : await sql
          )

          mdb.list = result
          if (!mdb.definition) await initializeList(meta.state)
        } else if (mdb.list !== undefined) {
        }

        if (onLoad) {
          onLoad(mdb.list, meta.state)
        }

        // done
        mdb.loading = false
        render()
      },
      setSort: (column) => {
        const mdb = meta.state.db

        const defaultOrderBy = baseListFormatOrder(
          get(mdb, 'defaultParams.orderBy')
        )

        const orderBy = baseListFormatOrder(get(mdb, 'params.orderBy'))

        if (column.indexOf('.') > 0) {
          const col = column.split('.')

          const ordLen =
            col.length === 3
              ? `0.${col[0]}.${col[1]}.${col[2]}`
              : `0.${col[0]}.${col[1]}`

          const ordering = get(orderBy, ordLen)
          if (ordering === 'desc') {
            mdb.params.orderBy = defaultOrderBy
            return true
          }

          mdb.params.orderBy = [
            {
              [col[0]]: {
                [col[1]]: ordering === 'asc' ? 'desc' : 'asc',
              },
            },
            ...defaultOrderBy,
          ]
        } else {
          if (!mdb.definition?.columns[column]) return false

          let sort = 'asc'
          const currentSort = Object.keys(orderBy[0] || {}).shift()
          if (currentSort === column) {
            if (get(orderBy, `0.${currentSort}`) === 'desc') {
              mdb.params.orderBy = defaultOrderBy
              return true
            } else {
              sort = 'desc'
            }
          }

          mdb.params.orderBy = [
            {
              [column]: sort,
            },
            ...defaultOrderBy,
          ]
        }
        return true
      },
      tableName: table || '',
      params,
      defaultParams: { ...params },
      get list() {
        return meta.rawList
      },
      set list(value: any[]) {
        meta.rawList = populateList(value, meta.rawList, meta.state)
      },
      loading: true,
    },
    tree: {
      root: null as any,
      parent: null,
      children: {},
    } as any,
  }

  return result
}
