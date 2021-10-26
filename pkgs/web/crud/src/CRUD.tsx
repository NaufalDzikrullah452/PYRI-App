/** @jsx jsx */
import { jsx, css } from '@emotion/react'
import { waitUntil } from 'libs'
import get from 'lodash.get'
import set from 'lodash.set'
import { createContext, useContext, useEffect, useRef } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { niceCase } from 'web.utils/src/niceCase'
import { useRender } from 'web.utils/src/useRender'
import { ICRUD, ICRUDContext } from '../../ext/types/__crud'
import { initializeState, saveState } from './context-state'
import { CRUDBody } from './CRUDBody'
import { deepUpdate, weakUpdate } from './form/BaseForm'

declare const window: BaseWindow

export const CRUD = (props: ICRUD) => {
  const render = useRender()
  const parent = props.parentCtx ? useContext(props.parentCtx) : null
  const _ = useRef({
    current: {
      content: null as any,
    },
    init: false,
    content: props.content,
    ctx: createContext({} as ICRUDContext),
    selectedId: '',
    state: {
      component: {
        id: props.id || generateStateID(),
        type: 'crud',
        render,
      },
      crud: {
        content: {},
        setMode: async (mode, data) => {
          meta.state.crud.mode = mode
          if (!data && mode === 'form') {
            console.warn('[WARN] You set crud.setMode with empty data')
          }

          if (mode === 'form') {
            meta.state.tree.children.form = null
            for (let i of Object.keys(meta.state.crud.formData)) {
              delete meta.state.crud.formData[i]
            }
            deepUpdate(meta.state.crud.formData, data)
            for (let [k, v] of Object.entries(data)) {
              if (k.startsWith('_')) {
                meta.state.crud.formData[k] = v
              }
            }
          }
          meta.state.component.render()

          await waitUntil(() => {
            return meta.state.tree.children[mode]
          })

          return
        },
        mode: !props.defaultMode
          ? ((!parent && location.hash.length > 1 ? 'form' : 'list') as any)
          : props.defaultMode,
        title: '',
        formData:
          !parent && location.hash.length > 1
            ? {
                __crudLoad: location.hash.substr(1),
              }
            : {},
      },
      tree: {
        root: null as any,
        children: {},
        parent: null,
      },
    } as ICRUDContext,
  })

  const meta = _.current

  const current = meta.current

  useEffect(() => {
    ;(async () => {
      meta.init = true
      meta.content = props.content
      initializeState(meta.state, parent as any)
      initializeContent(props.content)

      // set title
      const title = Object.keys(props.content)[0]
      current.content = meta.content[title]

      meta.state.crud.content = current.content

      if (current.content.onInit) {
        await current.content.onInit({ state: meta.state })
      }

      meta.state.crud.title = title
      ;(window as any).r = render
      render()
    })()
    return () => {
      saveState(meta.state, parent as any)
    }
  }, [props.content])

  if (!meta.init) return null
  return (
    <>
      <meta.ctx.Provider value={meta.state}>
        {window.platform === 'mobile' ? (
          <CRUDBody content={current.content} ctx={meta.ctx} />
        ) : (
          <div className="flex flex-1 self-stretch items-stretch relative">
            <CRUDBody content={current.content} ctx={meta.ctx} />
          </div>
        )}
      </meta.ctx.Provider>
    </>
  )
}

const initializeContent = (contents: ICRUD['content']) => {
  for (let [k, ctn] of Object.entries(contents) as any) {
    if (!ctn.title) {
      ctn.title = niceCase(k)
    }

    // form.create
    const create = get(ctn, 'form.create', {
      title: 'Create',
      visible: true,
    })
    if (create.visible === undefined) {
      create.visible = true
    }
    set(ctn, 'form.create', create)
  }
}

export const generateStateID = () => {
  if (!window.globalStateID) {
    window.globalStateID = 1
  }

  return leftPad(window.globalStateID++ || 1, 6)
}

function leftPad(n, len) {
  return new Array(len - String(n).length + 1).join('0').concat(n)
}

export default CRUD
