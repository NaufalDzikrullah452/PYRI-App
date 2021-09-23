/** @jsx jsx */
import F7Page from 'framework7-react/esm/components/page'
import { matchRoute } from 'libs'
import React, { FC, Fragment, useRef } from 'react'
import { api } from 'web.utils/src/api'
import { useRender } from 'web.utils/src/useRender'
import type { BaseWindow } from '../window'
import { generateLayout } from './gen-layout'
import { generatePage } from './gen-page'
import { findPage, loadPage } from './load-page'

declare const window: BaseWindow
export const renderCore = ({
  NotFound,
  afterRender,
}: {
  NotFound: FC
  afterRender?: () => void
}) => {
  let url = location.pathname

  const _ = useRef({
    page: findPage(url) as ReturnType<typeof findPage>,
    pageCache: null as null | ReturnType<typeof generatePage>,
    params: getUrlParams(url),
  })
  const render = useRender()
  const meta = _.current

  window.globalStateID = 1
  window.liveReloadPage = () => {
    window.globalStateID = 1
    const oldTitle = window.document.title
    window.document.title = 'Hot Reload ♨♨'
    meta.params = getUrlParams(url)
    loadPage(meta.page).then(() => {
      meta.pageCache = null
      render()
      setTimeout(() => {
        window.document.title = oldTitle
      }, 100)
    })
  }

  window.liveReloadLayout = async () => {
    window.cms_layouts = await api('/__cms/0/reload-layouts')
    for (let v of Object.values(window.cms_layouts)) {
      v.component = generateLayout(v.source)
    }
    window.liveReloadPage()
  }

  let Layout: React.FC<any> = ({ children }: any) => {
    const Wrapper = window.platform === 'mobile' ? F7Page : Fragment
    return <Wrapper>{children}</Wrapper>
  }
  const layoutArgs = {}
  layoutArgs['params'] = meta.params

  if (typeof meta.page === 'object') {
    window.cms_id = meta.page.id
    window.cms_page = meta.page
    window.cms_layout_id = meta.page.layout_id
    const layout = window.cms_layouts[meta.page.layout_id]
    if (layout) {
      Layout = layout.component // swap empty layout with correct layout
    }

    if (meta.page.source) {
      if (!meta.pageCache) {
        try {
          meta.pageCache = generatePage(meta.page.source, {
            params: { ...meta.params, url: url },
            updateParams: (newparams) => {
              meta.params = newparams
            },
          })
        } catch (e) {}
      }

      if (!matchRoute(url, meta.page.url)) {
        meta.params = getUrlParams(url)
        meta.page = findPage(url) as ReturnType<typeof findPage>
        loadPage(meta.page).then(() => {
          meta.pageCache = null
          render()
        })

        return <Layout {...layoutArgs}></Layout>
      }

      const Page = meta.pageCache

      if (afterRender) {
        afterRender()
      }

      return (
        <Layout {...layoutArgs}>
          <ErrorBoundary>
            <Page />
          </ErrorBoundary>
        </Layout>
      )
    }
  } else {
    return <NotFound />
  }

  loadPage(meta.page).then(() => {
    window.pageRendered = true
    render()
  })
  return <Layout {...layoutArgs} />
}

export const getUrlParams = (url: string) => {
  const route = Object.keys(window.cms_pages)
    .map((e) => ({ route: matchRoute(url, e) }))
    .filter((e) => e.route)

  if (route.length > 0) {
    return { ...route[0].route, url }
  }
  return {}
}

class ErrorBoundary extends React.Component<any, any> {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true })
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}
