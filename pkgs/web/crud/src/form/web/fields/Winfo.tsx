/** @jsx jsx */
import { jsx, css } from '@emotion/react'
import { useContext } from 'react'
import NiceValue from '../../../legacy/NiceValue'
import type { IBaseFieldProps } from '../../../../../ext/types/__form'

export const WInfo = ({ ctx, name }: IBaseFieldProps) => {
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
