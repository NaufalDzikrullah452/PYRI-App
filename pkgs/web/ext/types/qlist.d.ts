/** TYPE SEPARATOR - DO NOT DELETE THIS COMMENT **/
export type IQLFilterInputSingle = string | [string, IInputFilter]

export interface IFilterDef {
  db: {
    name: string
    type: 'postgresql'
  }
  columns: ITableDef
  rels: ITableRelation
}

export type IQLFilter = {
  enable?: boolean
}

type ISpecificFilter =
  | {
      type: 'has-many'
      default?: string
    }
  | {
      type: 'belongs-to'
      rel: {
        modelClass: string
        join: {
          to: string
          from: string
        }
      }
      default?: string
    }
  | {
      type: 'Date'
      default?: string
    }
  | {
      type: 'string'
      default?: string
    }
  | {
      type: 'number'
      default?: number
    }
  | {
      type: 'select'
      items: string[]
      default?: string
    }
export type IInputFilter = {
  where?: [string, string]
  visible?: boolean
} & ISpecificFilter

export type IFilter = IColumnDetail & IInputFilter & ISpecificFilter

export type IColumnDetail = {
  key?: string
  title?: string
  width?: number
  value?: (row) => any
}

export type IColumn<K = any> =
  | keyof K
  | [keyof K, IColumnDetail]
  | ((row: K) => IColumnDetail & {
      value: any
    })

export interface IQLTable {
  onRowClick?: (row: any, idx: number, ev: any) => Promise<boolean>
  wrapper?: ({ children, row }) => React.ReactElement
  columns?:
    | IColumn[]
    | ((props: {
        row: Record<string, any>
        index: number
        list: Array<Record<string, any>>
      }) => any)
  create?: false | string
  className?: string
  onLoad?: (list) => void
  swipeout?: (
    row: any,
    components: { Swipe: any; Delete: any; Edit: any }
  ) => React.ReactElement
  title?: string
}

export type IQueryListChildren = (props: {
  Filter: React.FC<IQLFilter>
  filterProps: IQLFilter
  Table: React.FC<IQLTable>
  tableProps: IQLTable
  Paging: React.FC
  pagingProps: any
}) => React.ReactElement | null

export type IQueryListWhere = {
  columns: IQLFilterInputSingle[]
  values: Record<string, any>
  setValues: (vals: Record<string, any>) => void
  visibles: Record<string, boolean>
  setVisibles: (v: Record<string, boolean>) => void
}

export type ITableDefSingle = {
  name: string
  type: string
  pk?: boolean
  nullable?: boolean
  rel?: ITableRelation
}

export type ITableDef = Record<string, ITableDefSingle>

export interface ITableRelation {
  relation: 'Model.HasManyRelation' | 'Model.BelongsToOneRelation'
  modelClass: string
  join: {
    from: string
    to: string
  }
}

export interface ITableColumn {
  name: string
  type: string
  pk: boolean
  nullable: boolean
}
export interface ITableDefinitions {
  db: {
    name: string
  }
  pk: string
  columns: Record<string, ITableColumn>
  rels: Record<string, ITableRelation>
}

export interface IQueryList {
  db?: string
  table?: string
  title?: string
  className?: string
  platform?: 'web' | 'mobile'
  query?: string | (() => Promise<any>)
  deps?: any[]
  actions?: React.ReactElement
  shouldQuery?: boolean
  onLoad?: (list: any[]) => void
  metaRef?: (meta: any) => void
  params?: any
  children?: IQueryListChildren | never[]
}

export type qlist = IQueryList
