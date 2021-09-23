/** @jsx jsx */
import { jsx, css } from '@emotion/react'
import { useContext, useEffect, useRef } from 'react'
import { render } from 'react-dom'
import NiceValue from '../../../legacy/NiceValue'
import type { IBaseFieldProps } from '../../../../../ext/types/__form'

export const MInfo = ({ ctx, name }: IBaseFieldProps) => {
  const form = useContext(ctx)
  const field = form.config.fields[name]

  if (!field) return null
  const state = field.state

  return (
    <WBox disabled>
      {typeof state.value === 'object' ? (
        <NiceValue value={state.value} />
      ) : (
        state.value
      )}
    </WBox>
  )
}

export const WBox = ({
  children,
  className,
  disabled,
}: {
  children: any
  className?: string
  disabled?: boolean
}) => {
  return (
    <div
      className={`${className} flex flex-1 items-center border rounded-sm text-xs p-2
      ${disabled ? 'border-gray-300 bg-gray-50' : 'border-gray-700 bg-white'}
      `}
      css={css`
        height: 32px;
      `}
    >
      {children}
    </div>
  )
}

export const resolveValueAsync = async (opt: {
  definer: any | (() => Promise<any> | any)
  args: any[]
  default?: any
}) => {
  const definer = opt.definer

  if (typeof definer === 'function') {
    const res = definer(...opt.args)
    if (res instanceof Promise) {
      return await res
    } else {
      return res
    }
  }
  return definer || opt.default
}

export const resolveValue = (opt: {
  definer: any | (() => Promise<any> | any)
  render?: () => void
  args: any[]
  default?: any
}) => {
  const _ = useRef({
    init: false,
    value: opt.default,
  })
  const meta = _.current
  const definer = opt.definer

  useEffect(() => {
    if (meta.init === false) {
      if (typeof definer === 'function') {
        const res = definer(...opt.args)
        if (res instanceof Promise) {
          res.then((e) => {
            meta.value = e
            opt.render()
          })
        } else {
          meta.value = definer
        }
      } else {
        meta.value = definer
      }
      meta.init = true
      opt.render()
    }
  }, [])

  return meta.value
}
