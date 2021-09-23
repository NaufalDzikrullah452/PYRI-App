/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { DefaultButton, Icon, Modal, Spinner } from '@fluentui/react'
import { setIconOptions } from '@fluentui/react/lib/Styling'
import { matchRoute, waitUntil } from 'libs'
import { memo, useEffect, useRef } from 'react'
import { BaseList } from 'web.crud/src/list/BaseList'
import { api } from 'web.utils/src/api'
import { useRender } from 'web.utils/src/useRender'
import { initFluent } from '../../web/initFluent'
import type { BaseWindow } from '../../window'
import { TesterForm } from './TesterForm'
declare const window: BaseWindow

// Suppress icon warnings.
setIconOptions({
  disableWarnings: true,
})

export interface ISingleTest {
  isNew: boolean
  page_id: string
  name: string
  code: string
  oldName?: string
}
export const smallBtnStyle = css`
  .ms-Button {
    height: 20px;
    min-width: 0px;
    i {
      font-weight: bold;
      font-size: 9px;
      line-height: 14px;
      height: 14px;
      margin: 0px;
    }
    .ms-Button-flexContainer {
      align-items: stretch;
    }
    .ms-Button-textContainer {
      flex-grow: 0;
      display: flex;
      align-items: center;
    }

    padding: 2px 5px;
    .ms-Button-label {
      font-size: 12px;
    }
  }
`

export const Tester = memo(() => {
  const pages = Object.entries(window.cms_pages)
    .map((e) => ({
      route: matchRoute(location.pathname, e[0]),
      url: e[0],
      detail: e[1],
    }))
    .filter((e) => e.route)
  const page = pages[0]

  const _ = useRef({
    current: null as null | ISingleTest,
    openingModal: false,
    loading: false,
    init: false,
    showAllPage: false,
    list: [] as {
      name: string
      status: 'ready' | 'running' | 'failed' | 'success'
    }[],
  })

  const meta = _.current
  const render = useRender()

  const reload = () => {
    meta.init = true
    meta.loading = true
    render()
    api(`/__tester/list/${page.detail.id}`).then((list) => {
      meta.list = list.map((e) => ({
        name: e.substr(0, e.length - 3),
        status: 'ready',
      }))
      meta.loading = false
      render()
    })
  }
  useEffect(() => {
    initFluent().then(() => {
      waitUntil(() => (window as any).fluentInit).then(reload)
    })
  }, [])
  if (!meta.init || !page) return null
  return (
    <div
      className="text-xs flex flex-col relative"
      css={css`
        min-width: 300px;
        height: 300px;
        margin-top: 1px;
        ${smallBtnStyle}
      `}
    >
      {meta.showAllPage ? (
        <TesterAllPages
          page={page}
          back={() => {
            meta.showAllPage = false
            render()
          }}
        />
      ) : (
        <TesterSinglePage
          page={page}
          meta={meta}
          render={render}
          newTest={() => {
            meta.current = {
              isNew: true,
              page_id: page.detail.id,
              name: '',
              code: '',
            }
            meta.openingModal = true
            render()
          }}
          reload={reload}
          back={() => {
            meta.showAllPage = true
            reload()
          }}
        />
      )}
    </div>
  )
})

const TesterAllPages = ({ page, back }) => {
  const _ = useRef({
    loading: false,
  })
  const meta = _.current
  useEffect(() => {}, [])
  return (
    <>
      <div className="flex flex-row items-stretch border-b border-gray-300">
        <div
          className="flex flex-1 text-xs flex-row items-stretch"
          css={css`
            font-size: 11px;
          `}
        >
          <>
            <div
              className="flex items-center overflow-x-auto flex-wrap px-1"
              css={css`
                margin-right: 5px;
                &::-webkit-scrollbar {
                  width: 1px; /* width of the entire scrollbar */
                  height: 1px;
                }

                &::-webkit-scrollbar-thumb {
                  background-color: #4b4b4b; /* color of the scroll thumb */
                }
                max-width: 300px;
              `}
            >
              All Pages{' '}
              <Icon
                iconName={'ChevronRight'}
                css={css`
                  font-size: 14px;
                  opacity: 0.6;
                  margin: 0px 3px -2px 0px;
                `}
              />{' '}
              <div className="cursor-pointer hover:underline" onClick={back}>
                [{page.detail.id}] {page.url}
              </div>
            </div>
          </>
        </div>
        <div className="flex p-1">
          <DefaultButton iconProps={{ iconName: 'Play' }}></DefaultButton>
        </div>
      </div>
      {meta.loading && (
        <div className="absolute z-10 bg-white bg-opacity-75 inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      <BaseList
        columns={({ row }) => {
          return (
            <div
              css={css`
                height: 32px;
              `}
              className="flex flex-row select-none justify-between self-stretch items-stretch border-b border-gray-300 hover:bg-gray-100"
              onClick={() => {
                const params = matchRoute(row.url, row.url)
                let keys = Object.keys(params)
                if (keys.length === 0) {
                  window.navigate(row.url)
                } else {
                  let url = row.url + ''
                  for (let i of keys) {
                    params[i] = prompt(`Set parameter [${i}]:`)
                    url = url.replace(`[${i}]`, params[i])
                  }
                  window.navigate(url)
                  setTimeout(() => {
                    back()
                  })
                }
              }}
            >
              <div className="flex items-center font-bold px-1 mr-1 border-r border-gray-300">
                {row.detail.id}
              </div>
              <div className="flex flex-1 cursor-pointer px-1 items-center">
                {row.url}
              </div>
            </div>
          )
        }}
        platform="web"
        list={Object.entries(window.cms_pages).map((e) => {
          return {
            url: e[0],
            detail: e[1],
            status: 'ready',
          }
        })}
      />
    </>
  )
}

const TesterSinglePage = ({ page, meta, render, newTest, reload, back }) => {
  return (
    <>
      <div className="flex flex-row items-stretch border-b border-gray-300">
        <div
          className="flex flex-1 text-xs flex-row items-stretch"
          css={css`
            font-size: 11px;
          `}
        >
          <>
            {false && (
              <div
                className="flex items-center font-bold px-1 mr-1 border-r border-gray-300 cursor-pointer"
                onClick={back}
              >
                <Icon iconName={'ChevronLeft'} />
              </div>
            )}
            <div className="flex items-center font-bold px-1 mr-1 border-r border-gray-300">
              {page.detail.id}
            </div>
            <div
              className="flex items-center overflow-x-auto flex-wrap"
              css={css`
                margin-right: 5px;
                &::-webkit-scrollbar {
                  width: 1px; /* width of the entire scrollbar */
                  height: 1px;
                }

                &::-webkit-scrollbar-thumb {
                  background-color: #4b4b4b; /* color of the scroll thumb */
                }
                max-width: 300px;
              `}
            >
              {page.url}
            </div>
          </>
        </div>
        <div className="flex p-1">
          <DefaultButton
            className="mr-1"
            disabled={meta.openingModal}
            iconProps={{ iconName: 'Add' }}
            onClick={newTest}
          ></DefaultButton>
          <DefaultButton iconProps={{ iconName: 'Play' }}></DefaultButton>
        </div>
      </div>
      {meta.loading && (
        <div className="absolute z-10 bg-white bg-opacity-75 inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      {meta.list.length > 0 && (
        <BaseList
          filter={false}
          web={{ showHeader: false }}
          columns={({ row }) => {
            return (
              <div
                css={css`
                  height: 32px;
                `}
                className="flex flex-row select-none justify-between self-stretch items-stretch border-b border-gray-300 hover:bg-gray-100"
              >
                <div
                  className="flex flex-1 cursor-pointer px-1 items-center"
                  onClick={async () => {
                    meta.loading = true
                    render()
                    const res = await api(
                      `/__tester/load/${page.detail.id}/${row.name}`
                    )
                    meta.current = {
                      isNew: false,
                      page_id: page.detail.id,
                      name: row.name,
                      code: res.code,
                    }
                    meta.loading = false
                    render()
                  }}
                >
                  {row.name}
                </div>
                <div className="flex items-center justify-center p-1">
                  {
                    {
                      ready: (
                        <DefaultButton
                          iconProps={{ iconName: 'Play' }}
                        ></DefaultButton>
                      ),
                    }[row.status]
                  }
                </div>
              </div>
            )
          }}
          platform="web"
          list={meta.list}
        />
      )}
      {meta.current && (
        <Modal
          isOpen={true}
          onDismiss={() => {
            meta.current = null
            reload()
          }}
        >
          <TesterForm
            test={meta.current}
            dismissAndReload={() => {
              meta.current = null
              reload()
            }}
            onOpen={() => {
              meta.openingModal = false
              render()
            }}
            onChange={(test) => {
              for (let [k, v] of Object.entries(test)) {
                meta.current[k] = v
              }
            }}
          />
        </Modal>
      )}
    </>
  )
}
