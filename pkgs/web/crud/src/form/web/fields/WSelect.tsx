/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { Callout, Icon, Label, Spinner, TextField } from '@fluentui/react'
import { waitUntil } from 'libs'
import { ReactElement, useContext, useEffect, useRef } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { useRender } from 'web.utils/src/useRender'
import { BaseList } from '../../../list/BaseList'
import type { IBaseFieldProps } from '../../../../../ext/types/__form'
import { WBox } from './Winfo'
import set from 'lodash.set'
declare const window: BaseWindow

export const WSelect = ({ name, internalChange, ctx }: IBaseFieldProps) => {
  const form = useContext(ctx)
  const field = form.config.fields[name]

  if (!field) return null
  const state: any = field.state

  return (
    <PureSelect
      items={state.items || []}
      value={state.value}
      onChange={(value) => {
        set(form.db.data, name, value)

        if (typeof state.onChange === 'function')
          state.onChange(value, {
            state: form,
            row: form.db.data,
            col: name,
          })
        internalChange(value)
      }}
    />
  )
}

const getEl = (row: any) => {
  return typeof row === 'object' ? row.el : null
}
const getLabel = (row: any) => {
  return (typeof row === 'object' ? row.label || (row as any).text : row) + ''
}
const getValue = (row: any) => {
  return (typeof row === 'object' ? row.value || (row as any).key : row) + ''
}

export const PureSelect = (props: {
  value: string | number
  onChange: (value: string | number) => void
  onDropDown?: (value: string | number) => void
  loading?: boolean
  className?: any
  items: (string | { value: string; label: string })[]
}) => {
  const { items, value, loading, onDropDown, onChange } = props
  const render = useRender()
  const _ = useRef({
    init: false,
    label: '',
    el: null,
    open: false,
    picked: false,
    items: [] as (
      | string
      | { value: string; label: string; el?: ReactElement }
    )[],
    selectedIndex: -1,
    ref: null as null | HTMLDivElement,
    popout: null as null | HTMLDivElement,
  })
  const meta = _.current

  useEffect(() => {
    meta.items = items
    let found = false
    for (let [idx, row] of Object.entries(items)) {
      if (getValue(row) == value) {
        meta.selectedIndex = parseInt(idx)
        meta.label = getLabel(row)
        meta.el = getEl(row)
        found = true
        break
      }
    }
    if (!found) {
      meta.el = null
      meta.label = ''
    }
    render()
    meta.init = true

    if (meta.open && meta.ref) {
      const input = meta.ref.querySelector('input')
      if (input) {
        input.focus()
        input.setSelectionRange(0, input.value.length)
      }
    }
  }, [items, value])

  if (!meta.init) return null

  const focusSelected = () => {
    waitUntil(() => meta.popout).then(() => {
      if (meta.popout) {
        const active = meta.popout.querySelector('.active')
        if (active) active.scrollIntoView()
      }
    })
  }

  if (loading)
    return (
      <WBox className="pure-select">
        <div className="flex items-center">
          <Spinner />
          <Label className="text-xs text-blue-300 ml-2">Loading...</Label>
        </div>
      </WBox>
    )

  const list = meta.items.map((e) => {
    if (typeof e === 'object') {
      return {
        el: e.el || null,
        value: e.value || (e as any).key,
        label: e.label || (e as any).text,
      }
    }
    return {
      el: null,
      value: e,
      label: e,
    }
  })

  return (
    <div
      ref={(e) => {
        if (e) {
          meta.ref = e
        }
      }}
      className={`${
        props.className || ''
      } pure-select flex flex-1  relative items-stretch`}
      css={css`
        > div {
          flex: 1;
        }
        input {
          cursor: pointer;
        }
      `}
    >
      <Icon
        iconName="ChevronDown"
        className="absolute bg-white bottom-0 top-0 flex items-center justify-center right-0 m-1 pointer-events-none z-10"
        css={css`
          padding: 1px 8px;
        `}
      />
      {meta.el && (
        <div
          className="absolute inset-0 z-10 pointer-events-none flex bg-white"
          css={css`
            right: 40px;
            margin: 2px;
            label {
              font-size: 14px;
            }
          `}
        >
          <Label className="flex-1 flex self-stretch items-center px-2">
            {meta.el}
          </Label>
        </div>
      )}
      <TextField
        value={meta.label || ''}
        spellCheck={false}
        onFocus={(e) => {
          e.target.setSelectionRange(0, e.target.value.length)
          meta.el = null
          render()
        }}
        onBlur={() => {
          setTimeout(() => {
            if (!meta.picked) {
              meta.picked = false
              let sel: any = ''
              for (let i of items) {
                if (getValue(i) == value) sel = i
              }

              meta.open = false
              if (sel && getLabel(sel) !== meta.label) {
                if (meta.items !== items) {
                  meta.items = items
                }
                meta.label = getLabel(sel)
                meta.el = getEl(sel)
                render()
              } else {
                meta.el = getEl(sel)
                render()
              }
            }
          }, 500)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            if (!meta.open) {
              meta.open = true
              if (onDropDown) onDropDown(value)
            }
            e.preventDefault()
            e.stopPropagation()
            meta.selectedIndex =
              meta.selectedIndex <= 0
                ? meta.items.length - 1
                : meta.selectedIndex - 1
            render()

            focusSelected()
          } else if (e.key === 'ArrowDown') {
            if (!meta.open) {
              meta.open = true
            }
            e.preventDefault()
            e.stopPropagation()
            meta.selectedIndex =
              meta.selectedIndex < meta.items.length - 1
                ? meta.selectedIndex + 1
                : 0

            render()

            focusSelected()
          } else if (e.key === 'Enter') {
            e.preventDefault()
            e.stopPropagation()

            if (!meta.open) {
              meta.open = true
              if (onDropDown) onDropDown(value)
            } else {
              meta.open = false
              let sel = meta.items[meta.selectedIndex]
              if (!sel) {
                sel = meta.items[0]
              }

              if (sel) {
                if (onChange) {
                  onChange(getValue(sel))
                }
                meta.label = getLabel(sel)
              }
            }
            render()
          }
        }}
        onChange={(_, text) => {
          if (typeof text === 'string') {
            meta.open = true
            if (onDropDown) onDropDown(value)
            meta.label = text
            meta.el = null
            meta.items =
              text.length > 0
                ? items.filter((row) => {
                    return fuzzyMatch(meta.label, getLabel(row))
                  })
                : items
            render()
          }
        }}
        onClick={() => {
          meta.open = true
          if (onDropDown) onDropDown(value)
          render()

          setTimeout(() => {
            focusSelected()
          }, 300)
        }}
      />
      {meta.open && meta.ref && (
        <Callout
          isBeakVisible={false}
          target={meta.ref}
          minPagePadding={2}
          onDismiss={() => {
            meta.open = false
            render()
          }}
        >
          <div
            ref={(e) => {
              if (e) meta.popout = e
            }}
            className="flex items-stretch flex-1"
            css={css`
              width: ${meta.ref.offsetWidth}px;
              min-width: 170px;
              max-height: 300px;
              ${meta.items.length === 0
                ? css`
                    min-height: 80px;
                  `
                : css`
                    height: ${meta.items.length * 32}px;
                  `}
            `}
          >
            <BaseList
              filter={false}
              columns={({ row, index }) => {
                return (
                  <Label
                    onClick={() => {
                      meta.open = false
                      meta.picked = true
                      const value = row.value
                      if (onChange) {
                        onChange(value)
                      }
                      meta.label = row.label
                      meta.el = row.el
                      render()
                    }}
                    className={`flex flex-1 self-stretch px-2 cursor-pointer ${
                      meta.selectedIndex === index ? 'active' : ''
                    }`}
                    css={css`
                      &.active {
                        background-color: #f0faf3;
                        &::after {
                          content: '✓';
                          background: white;
                          border-radius: 5px;
                          border-top-right-radius: 0px;
                          border-bottom-right-radius: 0px;
                          color: green;
                          padding: 0px 10px;
                          position: absolute;
                          right: 0px;
                        }
                      }
                      &:hover {
                        background-color: #e7f3fd;
                      }
                    `}
                  >
                    {row.el || row.label}
                  </Label>
                )
              }}
              list={list}
            />
          </div>
        </Callout>
      )}
    </div>
  )
}

export const fuzzyMatch = function (needle, haystack) {
  if (needle === '' || haystack === '') return true

  needle = needle.toLowerCase().replace(/ /g, '')
  haystack = haystack.toLowerCase()

  // All characters in needle must be present in haystack
  var j = 0 // haystack position
  for (var i = 0; i < needle.length; i++) {
    // Go down the haystack until we find the current needle character
    while (needle[i] !== haystack[j]) {
      j++

      // If we reached the end of the haystack, then this is not a match
      if (j === haystack.length) {
        return false
      }
    }

    // Here, needle character is same as haystack character
    //console.log(needle + ":" + i + " === " + haystack + ":" + j);
  }

  // At this point, we have matched every single letter in the needle without returning false
  return true
}
