export interface IBaseContext {
  component: {
    id: string
    type: 'crud' | 'form' | 'list'
    render: () => void
  }
  tree: {
    parent: IBaseContext | null
    root: IBaseContext
    children: Record<string, IBaseContext>
    getPath: () => string
  }
}
