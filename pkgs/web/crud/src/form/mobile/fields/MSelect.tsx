/** @jsx jsx */
import { jsx } from '@emotion/react'
import { List, ListInput } from 'framework7-react'
import set from 'lodash.set'
import { useContext } from 'react'
import { useRender } from 'web.utils/src/useRender'
import type { IBaseFieldProps } from '../../../../../ext/types/__form'
import { resolveValue } from './Minfo'

export const MSelect = ({ ctx, internalChange, name }: IBaseFieldProps) => {
  const form = useContext(ctx)
  const field = form.config.fields[name]

  if (!field) return null
  const state = field.state
  const render = useRender()

  const required = resolveValue({
    definer: state.required,
    args: [{ state: form, row: form.db.data, col: name }],
    render,
    default: false,
  })
  return (
    <List className={`${required ? 'required' : ''} `}>
      <ListInput
        label={state.title as any}
        placeholder={state.placeholder}
        required={required}
        value={state.value || ''}
        type="select"
        ref={
          ((e) => {
            if (e) {
              const el = e.el as HTMLDivElement
              const select = el.querySelector('select')
              if (select) {
                if (select.getAttribute('event-set') !== 'y') {
                  select.setAttribute('event-set', 'y')
                  select.addEventListener('change', (ev: any) => {
                    const value = ev.target.value
                    set(form.db.data, name, value)

                    if (typeof state.onChange === 'function')
                      state.onChange(value, {
                        state: form,
                        row: form.db.data,
                        col: name,
                      })
                    internalChange(value)
                  })
                }
              }
            }
          }) as any
        }
      >
        {state.items &&
          state.items.map((e: string | { value: any; label: string }, idx) => (
            <option value={typeof e === 'object' ? e.value : e} key={idx}>
              {typeof e === 'object' ? e.label : e}
            </option>
          ))}
      </ListInput>
    </List>
  )
}
