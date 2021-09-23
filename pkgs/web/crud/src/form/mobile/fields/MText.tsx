/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { List, ListInput } from 'framework7-react'
import set from 'lodash.set'
import { useContext } from 'react'
import { useRender } from 'web.utils/src/useRender'
import type { IBaseFieldProps } from '../../../../../ext/types/__form'
import { resolveValue } from './Minfo'

export const MText = ({ ctx, internalChange, name }: IBaseFieldProps) => {
  const form = useContext(ctx)
  const field = form.config.fields[name]
  const state = field.state
  const render = useRender()

  const required = resolveValue({
    definer: state.required,
    args: [{ state: form, row: form.db.data, col: name }],
    render,
    default: false,
  })
  if (!field) return null

  let value = state.value
  let type = 'text'
  if (state.type === 'multiline') {
    type = 'textarea'
  } else if (state.type === 'password') {
    type = 'password'
  }

  return (
    <List
      className={`${required ? 'required' : ''} `}
      css={css`
        .list textarea {
          height: var(--f7-input-height);
        }
      `}
    >
      <ListInput
        label={state.title as any}
        placeholder={state.placeholder}
        required={required}
        type={type}
        value={value || ''}
        readonly={state.readonly}
        onFocus={
          type === 'money'
            ? (e) => {
              e.target.value = e.target.value.replace(/[\W_]+/g, '')
            }
            : undefined
        }
        onBlur={
          type === 'money'
            ? (e) => {
              setTimeout(() => {
                e.target.value = e.target.value
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
              })
            }
            : undefined
        }
        resizable={state.type === 'multiline'}
        onChange={(ev) => {
          let text = ev.target.value

          if (['number', 'money'].indexOf(state.type) >= 0) {
            text = parseInt(text.replace(/\D/g, ''))
          }

          set(form.db.data, name, text)
          if (typeof state.onChange === 'function')
            state.onChange(text, {
              state: form,
              row: form.db.data,
              col: name,
            })

          internalChange(text)
        }}
        errorMessageForce={true}
        errorMessage={state.error}
        ref={
          ((e) => {
            if (state.type === 'money' && e && e.el) {
              const input = e.el.querySelector('input')
              if (input && document.activeElement !== input) {
                input.value = input.value
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
              }
            }
          }) as any
        }
      ></ListInput>
    </List>
  )
}
