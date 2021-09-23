/** @jsx jsx */
import { jsx, css } from '@emotion/react'
import { useContext } from 'react'
import type { IBaseFieldProps } from '../../../../../ext/types/__form'
import { WBox } from './Winfo'

export const WUnknown = ({ ctx, name }: IBaseFieldProps) => {
  const form = useContext(ctx)
  const field = form.config.fields[name]

  if (!field) return null
  const state = field.state

  return (
    <WBox>
      <span className="opacity-50">
        Field type <span className="text-red-700">[{state.type}]</span> dalam
        pengerjaan
      </span>
    </WBox>
  )
}
