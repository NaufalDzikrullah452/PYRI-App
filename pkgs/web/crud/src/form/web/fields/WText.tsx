/** @jsx jsx */
import { jsx, css } from '@emotion/react'
import { TextField } from '@fluentui/react'
import { useContext, useEffect, useRef } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { useRender } from 'web.utils/src/useRender'
import type { IBaseFieldProps } from '../../../../../ext/types/__form'
import set from 'lodash.set'
import get from 'lodash.get'

declare const window: BaseWindow

export const WText = ({ name, internalChange, ctx }: IBaseFieldProps) => {
  const _ = useRef({
    init: false,
    value: '',
  })
  const meta = _.current
  const form = useContext(ctx)
  const field = form.config.fields[name]
  const render = useRender()
  if (!field) {
    return null
  }
  const state = field.state

  useEffect(() => {
    meta.value = state.value || ''
    if (state.type === 'money' && meta.init === false) {
      meta.value = money(meta.value)
    }
    meta.init = true
    render()
  }, [state.value])

  let type = 'text'
  let rows = 1
  let autoAdjustHeight = true
  if (state.type === 'password') type = 'password'
  if (!meta.init) return <>not init</>
  if(state.type === 'multiline' && (state.name === 'cctv' || state.name == 'ews')){
    rows = 20
    autoAdjustHeight = false
  }

  return (
    <>
      <TextField
        css={css`
          .ms-TextField-fieldGroup,
          textarea {
            min-height: 30px !important;
          }
        `}
        value={meta.value}
        type={type}
        multiline={state.type === 'multiline'}
        autoAdjustHeight={autoAdjustHeight}
        rows={rows}
        onBlur={() => {
          if (state.type === 'money') {
            meta.value = money(meta.value)
            state.render()
          }
        }}
        onFocus={() => {
          if (state.type === 'money') {
            meta.value = meta.value.replace(/\D/g, '')
            state.render()
          }
        }}
        onChange={(_, text) => {
          set(form.db.data, name, text)
          const value = get(form.db.data, name)

          if (typeof state.onChange === 'function')
            state.onChange(value, {
              state: form,
              row: form.db.data,
              col: name,
            })

          if (value && ['number', 'money'].indexOf(state.type) >= 0) {
            let cols = Number(value.replace(/\D/g, ''))
            set(form.db.data, name, cols)
          }

          if (value && ['decimal'].indexOf(state.type) >= 0) {
            // let cols = value.replace(/[^\d,-]/g, '')
            let cols = value
              .replace(',', '.')
              .replace(/[^\d\.]/g, '')
              .replace(/\./, 'x')
              .replace(/\./g, '')
              .replace(/x/, '.')
            set(form.db.data, name, cols)
            // console.log(cols, 'masuk', typeof res, cols === value)
          }
          internalChange(value)
        }}
      />
    </>
  )
}

export const money = (angka: string | number) => {
  let rupiah = ''

  if (!angka) return '-'
  const angkarev = angka.toString().split('').reverse().join('')
  for (var i = 0; i < angkarev.length; i++)
    if (i % 3 == 0) rupiah += angkarev.substr(i, 3) + '.'
  return rupiah
    .split('', rupiah.length - 1)
    .reverse()
    .join('')
}
