/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { useContext } from 'react'
import type { IBaseFieldProps } from '../../../../../ext/types/__form'

export const MSection = ({ ctx, name }: IBaseFieldProps) => {
  const form = useContext(ctx)
  const field = form.config.fields[name]

  if (!field) return null
  const state = field.state

  return (
    <div
      className="block-title form-section"
      css={css`
        width: 100%;
        background: white;
        margin: 0px;
        padding: 36px 16px 10px 16px;
      `}
    >
      {state.title}
    </div>
  )
}
