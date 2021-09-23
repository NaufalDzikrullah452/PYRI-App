import { IQLFilter, IQLTable, IQueryList } from './qlist'
import { IBaseFormProps } from './__form'
import { IBaseListContext, IBaseListProps } from './__list'
type DBTables = any

/** TYPE SEPARATOR - DO NOT DELETE THIS COMMENT **/

export type IAdminSingle = {
  title?: string
  table?: string
  mode?: 'form' | 'list'
  onInit?: ({ state: ICRUDContext }) => void
  list?: {
    query?: IBaseListProps['query']
    header?: IBaseListProps['header']
    title?: IBaseListProps['title']
    params?: IBaseListProps['params']
    onLoad?: IBaseListProps['onLoad']
    onInit?: IBaseListProps['onInit']
    filter?: IBaseListProps['filter']
    table?: Partial<IBaseListContext['table']>
  }
  form?: IBaseFormProps
}

interface IAdminCMSList {
  wrapper?: ({ children, list }) => React.ReactElement
  params?: IQueryList['params']
  onLoad?: IBaseListProps['onLoad']
  onInit?: IBaseListProps['onInit']
  table?: IQLTable
  filter?: IQLFilter
  props?: IQueryList
}

interface IAdminCMS {
  active?: string
  setActive?: (v: string) => void
  nav?: string[]
  platform?: 'web' | 'mobile'
  mobile?: {
    zIndex?: number
  }
  content?: Record<string, IAdminSingle | (() => any)>
}

export type admin = IAdminCMS
