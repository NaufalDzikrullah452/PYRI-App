/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { useContext, useEffect, useRef } from 'react'
import type { IBaseFieldProps } from '../../../../../ext/types/__form'

import { List, ListInput } from 'framework7-react'
import { resolveValue } from './Minfo'
import { useRender } from 'web.utils/src/useRender'

import set from 'lodash.set'
import get from 'lodash.get'

export const MDate = ({ ctx, internalChange, name }: IBaseFieldProps) => {
  const _ = useRef({
    init: false,
    value: null as null | Date,
  })
  const meta = _.current
  const form = useContext(ctx)
  const field = form.config.fields[name]

  const state = field.state
  const render = useRender()

  useEffect(() => {
    meta.value =
      !!state.value && !(state.value instanceof Date)
        ? new Date(state.value)
        : state.value

    meta.init = true
    render()
  }, [])

  const required = resolveValue({
    definer: state.required,
    args: [{ state: form, row: form.db.data, col: name }],
    render,
    default: false,
  })

  if (!field || !meta.init) return null
  return (
    <List className={`cal-1 ${required ? 'required' : ''} ${state.readonly ? 'pointer-events-none' : ''}`}>
      <ListInput
        label={state.title as any}
        placeholder={state.placeholder}
        type="datepicker"
        required={required}
        value={!!meta.value ? [meta.value] : undefined}
        clearButton={!required && !state.readonly}
        calendarParams={
          {
            backdrop: true,
            closeOnSelect: true,
            header: true,
            openIn: 'popover',
            locale: 'id-ID',
            // sheetSwipeToClose: true,
            dateFormat: 'dd M yyyy',
            on: {
              change: function (ev, date: any) {
                const value = date[0] ? date[0] : null

                try {
                  if (
                    !!value && value instanceof Date
                  ) {
                    meta.value = value
                    set(form.db.data, name, value)

                    if (typeof state.onChange === 'function')
                      state.onChange(value, {
                        state: form,
                        row: form.db.data,
                        col: name,
                      })
                    internalChange(value)
                  }
                } catch (e) {
                  meta.value = new Date()
                  render()
                }
              },
            },
          } as any
        }
      ></ListInput>
    </List>
  )
}
