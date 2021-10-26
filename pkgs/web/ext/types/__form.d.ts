import { ITableDefinitions } from './qlist'
import { IFieldType } from './qform'
import { IBaseContext } from './__context'

/** TYPE SEPARATOR - DO NOT DELETE THIS COMMENT **/
export type IBaseFieldMainProps = Partial<IBaseFieldContext> & {
  name: string
  ctx: React.Context<IBaseFormContext>
  wrapper?: React.FC
  children?: React.ReactElement
}

export interface IBaseFieldContext {
  name: string
  title:
    | string
    | React.ReactElement
    | (({ row: any, state: IBaseFormContext }) => string | React.ReactElement)
  value: any
  placeholder?: string
  info?: string
  type: IFieldType
  error: string
  required:
    | boolean
    | ((props: {
        state: IBaseFormContext
        row: any
        col: string
      }) => boolean | Promise<boolean>)
  readonly: boolean
  prefix:
    | React.ReactElement
    | string
    | (({ state, row, value }) => React.ReactElement)
  suffix:
    | React.ReactElement
    | string
    | (({ state, row, value }) => React.ReactElement)
  render: () => void
  onChange: (
    value: any,
    opt: { state: IBaseFormContext; row: any; rowIdx?: number; col: string }
  ) => void
  parent: IBaseFormContext | null
  items?: (string | { value: string; label: string })[]
  customRender?: (props: {
    row: any
    state: IBaseFormContext
    Component?: React.FC<IBaseFieldMainProps>
    props?: IBaseFieldMainProps
  }) => React.ReactElement
  fieldProps: any
}

type IFormTabs = (
  | string
  | {
      title: string
      component: (props: { state: IBaseFormContext }) => React.ReactElement
    }
)[]

type IActionSingle =
  | boolean
  | string
  | React.ReactElement
  | (
      | React.ReactElement
      | (({ state, save, data }) => React.ReactElement | boolean)
    )[]
  | (({ state, save, data }) => React.ReactElement | boolean)
  | undefined

export type IAction = Record<string, IActionSingle> & {
  create?: IActionSingle
  save?: IActionSingle
  other?: {
    import?: IActionSingle
    export?: IActionSingle
  }
  custom?: Record<string, IActionSingle> | IActionSingle
}

type IFormAlterField =
  | Partial<IBaseFieldContext>
  | ((props: {
      name: string
      row: any
      state: IBaseFormContext
      Component?: React.FC<IBaseFieldMainProps>
      props?: IBaseFieldMainProps
    }) => Partial<IBaseFieldContext> | React.ReactElement)
export interface IBaseFormContext extends IBaseContext {
  config: {
    header: {
      enable: boolean
      back?: (props: { state: IBaseFormContext; row: any }) => void
      title?:
        | string
        | ((props: { state: IBaseFormContext; row: any }) => string)
      action?: (state) => IAction | IAction
      render?: () => void
    }
    layout: IFormLayout
    watches: Record<string, Set<() => void>>
    split: {
      position: 'top' | 'bottom' | 'left' | 'right' | 'none'
      size: string
    }
    tab: {
      list: IFormTabs
      position: 'top' | 'left' | 'right' | 'bottom'
      modifier?: (props: { tabs: IFormTabs }) => IFormTabs
    }
    alter: Record<string, IFormAlterField>
    fields: Record<string, IFormField>
    onSave?: (props: {
      data: any
      save: () => Promise<boolean>
      state: IBaseFormContext
      saving: (status: boolean) => void
    }) => Promise<void> | void
    onInit?: (state: IBaseFormContext) => Promise<void> | void
    onLoad?: (data, state: IBaseFormContext) => Promise<void> | void
    validate: (data: any, state: IBaseFormContext) => Promise<void> | void
  }
  fieldTypes: any
  db: {
    tableName?: string
    data: Record<string, any> & { __meta: IBaseFormRowMeta }
    loading: boolean
    params: any
    errors: string[]
    definition: ITableDefinitions | null
    query: (params?: object | ((params: any) => object)) => Promise<object>
    delete: () => Promise<void>
    validate: () => Promise<Record<string, string[]>>
    saveStatus:
      | 'ready'
      | 'changed'
      | 'validation-error'
      | 'saving'
      | 'success'
      | 'failed'
    saveErrorMsg?: string
    lastErrors?: Record<string, string[]>
    save: (data?: any) => Promise<boolean>
  }
}

export interface IBaseFormRowMeta {
  pk: any
  isNew: boolean
  state?: IBaseFormContext
  raw: any
}

export interface IBaseFieldProps {
  name: string
  ctx: React.Context<IBaseFormContext>
  internalChange: (name: any) => void
}

export interface IFormField {
  state: IBaseFieldContext
}

export type IFormLayout = (
  | string
  | ((props: {
      row: any
      watch: (fields: string[]) => void
      update: (row: any) => void
      layout: (layout: any) => React.ReactElement | null
      state: IBaseFormContext
    }) => React.ReactElement)
  | IFormLayout
)[]

export interface IBaseFormProps {
  id?: string
  parentCtx?: React.Context<IBaseFormContext>
  table?: IBaseFormContext['db']['tableName']
  alter?: IBaseFormContext['config']['alter']
  action?: IBaseFormContext['config']['header']['action']
  split?: {
    position?: IBaseFormContext['config']['split']
    size?: IBaseFormContext['config']['split']['size']
    tab?: IBaseFormContext['config']['tab']['position']
  }
  onSave?: IBaseFormContext['config']['onSave']
  onInit?: IBaseFormContext['config']['onInit']
  onLoad?: IBaseFormContext['config']['onLoad']
  header?: IBaseFormContext['config']['header']
  title?: IBaseFormContext['config']['header']['title']
  layout?: IBaseFormContext['config']['layout']
  tabs?: IBaseFormContext['config']['tab']['modifier']
  params?: any
  data?: any
}
