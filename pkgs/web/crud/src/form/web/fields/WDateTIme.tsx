/** @jsx jsx */
import { jsx } from '@emotion/react'
import { DatePicker, MaskedTextField, TextField } from '@fluentui/react'
import { parseISO } from 'date-fns/esm'
import { useContext, useEffect, useRef } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { shortFormatDate } from 'web.utils/src/formatDate'
import type { IBaseFieldProps } from '../../../../../ext/types/__form'
import set from 'lodash.set'
import { useRender } from 'web.utils/src/useRender'
declare const window: BaseWindow

export const WDateTIme = ({ name, internalChange, ctx }: IBaseFieldProps) => {
  const render = useRender()
  const form = useContext(ctx)
  const field = form.config.fields[name]

  if (!field) return null
  const state = field.state

  const fieldProps = !!state.fieldProps ? state.fieldProps : {}
  const readOnly = !!fieldProps.readOnly ? fieldProps.readOnly : false

  const _ = useRef({
    date: new Date(),
    time: '00:00',
  })
  const meta = _.current

  useEffect(() => {
    const date = state.value
    if (!!date && !(date instanceof Date)) {
      meta.date = parseISO(date)
      meta.time = `${String(meta.date.getHours()).padStart(2, '0')}:${String(
        meta.date.getMinutes()
      ).padStart(2, '0')}`
    } else if (!!date && date instanceof Date) {
      meta.date = date
      meta.time = `${String(meta.date.getHours()).padStart(2, '0')}:${String(
        meta.date.getMinutes()
      ).padStart(2, '0')}`
    }

    render()
  }, [state.value])

  return (
    <div className="flex">
      <div className="w-full">
        <DatePicker
          value={!state.value ? null : meta.date}
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
          disabled={readOnly}
        />
      </div>
      <div className="ml-2" style={{ width: 62 }}>
        <MaskedTextField
          className="text-center"
          mask="99:99"
          value={meta.time}
          onBlur={(e: any) => {
            let val = e.target.value.replace('_', 0)

            let times = val.split(':')

            if (Number(times[0]) > 23) times[0] = 23
            if (Number(times[1]) > 59) times[1] = 59

            meta.time = times.join(':')

            meta.date.setHours(Number(times[0]))
            meta.date.setMinutes(Number(times[1]))

            set(form.db.data, name, meta.date)
            if (typeof state.onChange === 'function')
              state.onChange(meta.date, {
                state: form,
                row: form.db.data,
                col: name,
              })

            internalChange(meta.date)
            state.render()
          }}
          disabled={readOnly}
        />
      </div>
    </div>
  )
}
