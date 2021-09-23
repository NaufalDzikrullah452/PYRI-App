/** @jsx jsx */
import { jsx } from '@emotion/react'
import { DatePicker } from '@fluentui/react'
import { parseISO } from 'date-fns/esm'
import { useContext } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { shortFormatDate } from 'web.utils/src/formatDate'
import type { IBaseFieldProps } from '../../../../../ext/types/__form'
import set from 'lodash.set'
declare const window: BaseWindow

export const WDate = ({ name, internalChange, ctx }: IBaseFieldProps) => {
  const form = useContext(ctx)
  const field = form.config.fields[name]

  if (!field) return null
  const state = field.state

  let type = 'text'
  if (['number'].indexOf(state.type) >= 0) type = state.type

  let date = state.value
  if (!(date instanceof Date)) {
    date = parseISO(date)
  }
  if (isNaN(date as any)) {
    date = new Date()
  }

  return (
    <DatePicker
      value={date}
      formatDate={(date: any) => {
        if (date instanceof Date && !isNaN(date as any)) {
          return shortFormatDate(date)
        }
      }}
      onSelectDate={(value) => {
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
