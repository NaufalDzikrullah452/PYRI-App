import { ITableDefinitions } from './qlist'
import { IBaseContext } from './__context'
import { IFilterItem } from './__filter'
import {
  IAction,
  IBaseFieldContext,
  IBaseFormContext,
  IBaseFormRowMeta,
} from './__form'

/** TYPE SEPARATOR - DO NOT DELETE THIS COMMENT **/
export interface IBaseFilterDef {
  title: string
  type: string
  default: {
    value: any
    operator: any
  }
  modifyQuery: (props: {
    params: IBaseListContext['db']['params']
    instance: IFilterItem
    column: Partial<IBaseFilterDef>
    name: string
    state: IBaseListContext
  }) => Promise<void> | void
}

export interface IBaseListRowMeta extends IBaseFormRowMeta {
  idx: number
  data: any
  editable?: {
    state: IBaseFormContext
    ctx: React.Context<IBaseFormContext>
  }
  pos: 'start' | 'end'
  render: () => void
  meta: any
  columns: Record<string, { render: () => void }>
}

export type IColumnSingleDef =
  | string
  | [
      string,
      Partial<{
        title: string
        edit: Partial<IBaseFieldContext>
        width: number
        value: (
          row: Record<string, any>,
          state: IBaseListContext
        ) => React.ReactElement
      }>
    ]

export interface IBaseListContext extends IBaseContext {
  filter: {
    enable: boolean
    web: {
      mode: 'topbar' | 'sideleft' | 'sideright' | 'popup'
    }
    quickSearch?: string
    alter: Record<string, Partial<IBaseFilterDef>>
    instances: Record<string, IFilterItem>
    columns: (string | [string, Partial<IBaseFilterDef>])[]
    render: () => void
  }
  header?: {
    enable?: boolean
    title?: string
    action?: IAction
  }
  grid?: {
    colSize: number
  }
  table: {
    rowsMeta: WeakMap<any, IBaseListRowMeta>

    mobile: {
      mode: 'list' | 'slider'
      scroll: boolean
      swipeout:
        | boolean
        | ((row: any, comps: { Swipe: any; Edit: any; Delete: any }) => any)
    }

    web: {
      showHeader?: boolean
      checkbox?: boolean
    }

    editable: (props: {
      row: any
      col: string
      list: IBaseListContext['db']['list']
      idx: number
      state: IBaseListContext
    }) => boolean | object

    lastScroll?: number

    columns:
      | IColumnSingleDef[]
      | ((props: {
          row: any
          list: IBaseListContext['db']['list']
          index: number
          state: IBaseListContext
        }) => React.ReactElement)

    wrapList?: (props: {
      children: any
      list: any[]
      state: IBaseListContext
    }) => React.ReactElement

    wrapRow: (props: {
      children: any
      row: Record<string, any>
      state: IBaseListContext
    }) => React.ReactElement

    onRowClick?: (
      row: Record<string, any>,
      idx: number,
      ev: any,
      state: IBaseListContext
    ) => void | Promise<void | boolean> | boolean

    render: () => void

    customRenderRow?: (props: {
      row: any
      list: IBaseListContext['db']['list']
      index: number
      state: IBaseListContext
      children: React.ReactElement
    }) => React.ReactElement
  }
  db: {
    tableName: string
    lateQuery?:
      | Record<
          string,
          [
            string,
            (props: { rows: any; state: IBaseListContext }) => Promise<any[]>
          ]
        >
      | ((props: { rows: any; state: IBaseListContext }) => Promise<void>)
    list: Record<string, any & { __meta: IBaseListRowMeta }>[]
    params: any
    defaultParams: any
    loading: boolean
    sql: string | ((state: IBaseListContext) => Promise<string> | string)
    definition: ITableDefinitions | null
    setSort: (col: string) => boolean
    query: () => Promise<void>
  }
}
export interface IBaseListProps {
  id?: string
  parentCtx?: React.Context<IBaseContext>
  grid?: IBaseListContext['grid']
  action?: IBaseListContext['header']['action']
  title?: IBaseListContext['header']['title']
  header?: IBaseListContext['header']
  table?: IBaseListContext['db']['tableName']
  list?: IBaseListContext['db']['list']
  query?: IBaseListContext['db']['sql']
  params?: IBaseListContext['db']['params']
  filter?: IBaseListContext['filter'] | false
  mobile?: IBaseListContext['table']['mobile']
  web?: IBaseListContext['table']['web']
  wrapList?: IBaseListContext['table']['wrapList']
  wrapRow?: IBaseListContext['table']['wrapRow']
  platform?: 'web' | 'mobile'
  editable?: IBaseListContext['table']['editable']
  lateQuery?: IBaseListContext['db']['lateQuery']
  columns?: IBaseListContext['table']['columns']
  onRowClick?: IBaseListContext['table']['onRowClick']
  onInit?: (state: IBaseListContext) => void | Promise<void>
  checkbox?: boolean
  onLoad?: (
    list: IBaseListContext['db']['list'],
    state: IBaseListContext
  ) => void | Promise<void>
  children?: IBaseListContext['table']['customRenderRow']
}
