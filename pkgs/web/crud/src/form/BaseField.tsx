/** @jsx jsx */
import { jsx, css } from '@emotion/react'
import { Context, FC, ReactElement, useContext, useEffect, useRef } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { useRender } from 'web.utils/src/useRender'
import type {
  IBaseFieldContext,
  IBaseFieldMainProps,
  IBaseFormContext,
  IFormField,
} from '../../../ext/types/__form'
import { MFieldWrapper } from './mobile/MFieldWrapper'
import { WFieldWrapper } from './web/WFieldWrapper'
declare const window: BaseWindow

export const BaseField = (props: IBaseFieldMainProps) => {
  const render = useRender()
  const _ = useRef({
    init: false,
    required: {
      promise: null as null | Promise<boolean>,
      result: false,
    },
  })
  const meta = _.current
  const parent = useContext(props.ctx)
  const state = parent.config.fields[props.name].state

  state.render = render
  useEffect(() => {
    ;(async () => {
      for (let [k, v] of Object.entries(props)) {
        if (['name', 'ctx', 'wrapper', 'children'].indexOf(k) < 0) {
          state[k] = v
        }
      }

      meta.init = true
      render()
    })()
  }, [])

  if (!meta.init || state.type === 'has-many') return null
  if (parent.config.tab.list.indexOf(state.name) >= 0) return null

  let FieldWrapper = window.platform === 'web' ? WFieldWrapper : MFieldWrapper
  if (props.wrapper) {
    FieldWrapper = props.wrapper
  }

  let Field = parent.fieldTypes[state.type]
  let isSection = false
  if (state.name.indexOf('::') === 0) {
    isSection = true
    Field = parent.fieldTypes['section']
  }

  if (!Field) {
    Field = parent.fieldTypes['unknown']
  }

  const internalChange = (value: any) => {
    parent.db.saveStatus = 'changed'
    if (parent.config.header && parent.config.header.render)
      parent.config.header.render()

    if (value !== undefined && value !== null && value !== '') {
      state.error = ''
    }

    render()
    if (parent.config.watches[state.name]) {
      parent.config.watches[state.name].forEach((renderField) => {
        renderField()
      })
    }
  }

  const renderField: any = (
    <PrefixSuffix
      state={parent}
      prefix={state.prefix}
      suffix={state.suffix}
      name={props.name}
    >
      {props.children ? (
        props.children
      ) : (
        <Field
          name={state.name}
          internalChange={internalChange}
          ctx={props.ctx}
        />
      )}
    </PrefixSuffix>
  )

  if (typeof state.required === 'function') {
    if (meta.required.promise) {
      meta.required.promise = null
    } else {
      const res = state.required({
        state: parent,
        row: parent.db.data,
        col: props.name,
      })

      if (res instanceof Promise) {
        meta.required.promise = res
        res.then((e) => {
          meta.required.result = e
          render()
        })
        return null
      } else {
        meta.required.result = res
      }
    }
  } else {
    meta.required.result = state.required
  }

  let renderedTitle =
    typeof state.title === 'function'
      ? state.title({ row: parent.db.data, state })
      : state.title

  return isSection ? (
    renderField
  ) : (
    <FieldWrapper
      state={state}
      title={renderedTitle}
      required={meta.required.result}
      error={state.error}
      type={state.type}
      readonly={state.readonly}
    >
      {renderField}
    </FieldWrapper>
  )
}

const PrefixSuffix = ({
  children,
  suffix,
  prefix,
  state,
  name,
}: {
  state: IBaseFormContext
  children: ReactElement
  name: string
  prefix?: IFormField['state']['prefix']
  suffix?: IFormField['state']['suffix']
}) => {
  if (suffix || prefix) {
    return (
      <div
        className="flex flex-1 relative items-stretch"
        css={css`
          height: 32px;
        `}
      >
        {prefix && (
          <FieldFix mode="prefix" state={state} name={name}>
            {prefix}
          </FieldFix>
        )}
        <div
          className="flex items-stretch flex-1"
          css={css`
            > * {
              flex: 1;
            }
          `}
        >
          {children}
        </div>
        {suffix && (
          <FieldFix mode="suffix" state={state} name={name}>
            {suffix}
          </FieldFix>
        )}
      </div>
    )
  }
  return children
}

const FieldFix = ({
  children,
  state,
  mode,
  name,
}: {
  mode: 'suffix' | 'prefix'
  state: IBaseFormContext
  name: string
  children: IFormField['state']['suffix']
}) => {
  let el: ReactElement | null = null

  if (typeof children === 'function') {
    el = children({ state, row: state.db.data, value: state.db.data[name] })
  } else {
    el = <>{children}</>
  }

  if (el) {
    return (
      <div
        className="flex items-center border px-2 border-gray-700 bg-white rounded-sm"
        css={
          mode === 'prefix'
            ? css`
                border-top-right-radius: 0px;
                border-bottom-right-radius: 0px;
                border-right: 0px;
                margin-right: -2px;
              `
            : css`
                border-top-left-radius: 0px;
                border-bottom-left-radius: 0px;
                border-left: 0px;
                margin-left: -2px;
              `
        }
      >
        {el}
      </div>
    )
  }
  return null
}
