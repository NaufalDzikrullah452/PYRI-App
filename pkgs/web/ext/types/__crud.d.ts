import { IAdminSingle } from './admin'
import { IBaseFormContext } from './__form'
import { IBaseContext } from './__context'
import { ITableDefinitions } from './qlist'

/** TYPE SEPARATOR - DO NOT DELETE THIS COMMENT **/
interface ICRUD {
  id?: string
  nav?: string[]
  defaultMode?: 'form' | 'list'
  content: Record<string, IAdminSingle>
  parentCtx?: React.Context<IBaseFormContext>
}

export interface ICRUDContext extends IBaseContext {
  crud: {
    content: any
    path?: string
    onInit?: (props: { state: ICRUDContext }) => void
    title: string
    mode: 'list' | 'form'
    formData: any
    setMode: (mode: ICRUDContext['crud']['mode'], data?: any) => Promise<void>
    definition: ITableDefinitions
  }
}
