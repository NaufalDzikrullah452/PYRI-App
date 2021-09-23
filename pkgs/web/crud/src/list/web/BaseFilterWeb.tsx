/** @jsx jsx */
import { jsx } from '@emotion/react'
import { waitUntil } from 'libs'
import { Context, useContext, useEffect, useRef } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { useRender } from 'web.utils/src/useRender'
import { IBaseListContext } from '../../../../ext/types/__list'
import { BaseFilterTopBar } from './filter/BaseFilterTopBar'

declare const window: BaseWindow

export const BaseFilterWeb = ({ ctx }: { ctx: Context<IBaseListContext> }) => {
  const _ = useRef({
    init: false,
  })
  const meta = _.current
  const render = useRender()
  useEffect(() => {
    ;(async () => {
      await waitUntil(() => state.filter.columns)

      meta.init = true
      state.filter.render = render
      render()
    })()
  }, [])
  const state = useContext(ctx)
  if (!meta.init) return null

  if (state.filter.web.mode === 'topbar') return <BaseFilterTopBar ctx={ctx} />
  return null
}
