/** @jsx jsx */
import { jsx } from '@emotion/react'
import { Toggle } from '@fluentui/react'
import set from 'lodash.set'
import { useContext } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import type { IBaseFieldProps } from '../../../../../ext/types/__form'
declare const window: BaseWindow
export const WBoolean = ({ name, internalChange, ctx }: IBaseFieldProps) => {
  const form = useContext(ctx)
  const field = form.config.fields[name]

  if (!field) return null
  const state = field.state

  return (
    <Toggle
      defaultChecked={!!state.value}
      onText="Yes"
      offText="No"
      onChange={(_, value) => {
        set(form.db.data, name, value)
        if (typeof state.onChange === 'function')
          state.onChange(value, {
            state: form,
            row: form.db.data,
            col: name,
          })
        internalChange(value)
        state.render()
      }}
    />
  )
}
