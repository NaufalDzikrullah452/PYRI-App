/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import {
  Callout,
  DefaultButton,
  DirectionalHint,
  Icon,
  Label,
  PrimaryButton,
} from '@fluentui/react'
import { waitUntil } from 'libs'
import get from 'lodash.get'
import { Context, useContext, useEffect, useRef } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { useRender } from 'web.utils/src/useRender'
import { IBaseListContext } from '../../../../../ext/types/__list'
import { PureSelect } from '../../../form/web/fields/WSelect'
import { Actions } from '../../../form/web/WFormWrapper'
import { FilterSingle } from '../../filter/FilterSingle'

declare const window: BaseWindow

export const BaseFilterTopBar = ({
  ctx,
}: {
  ctx: Context<IBaseListContext>
}) => {
  const _ = useRef({
    el: {
      calloutBoxDiv: null as any,
      filterBtn: null as any,
    },
    picker: false,
    show: '',
    splitSize: 50,
    container: null as HTMLDivElement | null,
    orderedColumns: [] as string[],
    get visibleFilters() {
      return meta.orderedColumns.filter(
        (e) => state.filter.instances[e].visible
      )
    },
    renderedFilters: [] as any[],
  })
  const meta = _.current
  const state = useContext(ctx)
  const render = useRender()

  useEffect(() => {
    meta.orderedColumns = [] as string[]
    for (let v of state.filter.columns) {
      const col = typeof v === 'string' ? v : v[0]
      if (col.indexOf('__') == 0) continue
      if (get(state.filter.instances[col], 'value')) {
        meta.orderedColumns.unshift(col)
      } else {
        meta.orderedColumns.push(col)
      }
    }
    renderFilters()
  }, [])

  const renderFilters = () => {
    meta.renderedFilters = meta.visibleFilters.map((e, idx) => {
      return (
        <FilterSingle
          key={idx}
          filter={e}
          ctx={ctx}
          onSubmit={() => {
            meta.show = ''
            renderFilters()
          }}
        >
          {({
            ValueLabel,
            FilterInput,
            filter,
            submit,
            operators,
            def,
            name,
          }) => {
            if (filter.type === 'tab') {
              return <FilterInput {...filter} />
            }

            return (
              <div className="filter-item flex items-stretch">
                {meta.show === name && (
                  <Callout
                    target={meta.el[name]}
                    isBeakVisible={false}
                    onDismiss={() => {
                      meta.show = ''
                      renderFilters()
                    }}
                  >
                    <div className="p-2 flex flex-col items-stretch">
                      {operators.length > 1 && (
                        <div
                          css={css`
                            .pure-select {
                              margin: -5px 0px 2px 0px;
                              > i {
                                font-size: 12px;
                                font-weight: bold;
                                padding: 0px;
                                margin: 7px 4px;
                              }

                              .ms-TextField-fieldGroup {
                                border: 0px;
                                &::after {
                                  display: none;
                                }
                                input {
                                  font-size: 13px;
                                  font-weight: 600;
                                  padding: 0px;
                                }
                              }
                            }
                          `}
                        >
                          <PureSelect
                            value={filter.operator}
                            onChange={(e) => {
                              filter.operator = e
                              renderFilters()
                            }}
                            items={operators.map((e) => {
                              return {
                                label: e.label,
                                value: e.value,
                              }
                            })}
                          />
                        </div>
                      )}
                      <div
                        className="flex flex-row"
                        ref={(el) => {
                          if (el) {
                            meta.el.calloutBoxDiv = el
                          }
                        }}
                      >
                        <FilterInput {...filter} />
                        <PrimaryButton
                          css={css`
                            font-size: 12px;
                            margin-left: 5px;
                            min-width: 30px;
                          `}
                          onClick={() => {
                            submit()
                          }}
                        >
                          Go
                        </PrimaryButton>
                      </div>
                    </div>
                  </Callout>
                )}
                <div
                  ref={(e) => {
                    meta.el[name] = e
                  }}
                  onClick={() => {
                    meta.show = name
                    renderFilters()
                    waitUntil(() => meta.el.calloutBoxDiv).then(() => {
                      const input = meta.el.calloutBoxDiv.querySelector('input')
                      if (input) {
                        input.focus()
                      }
                    })
                  }}
                  className="flex flex-row ms-Button select-none"
                  css={css`
                    padding: 0px 10px;
                    min-width: 0px;
                    margin-left: 5px;
                    height: 30px;
                    align-items: center;
                    border: 1px solid #ddd;
                    overflow: hidden;
                    border-radius: 2px;
                    cursor: pointer !important;
                    outline: none !important;

                    &:hover {
                      border: 1px solid #0d4e98 !important;
                    }

                    ${!!filter.value &&
                    css`
                      border: 1px solid #0d4e98 !important;
                      background: rgb(255, 255, 255);
                      background: linear-gradient(
                        0deg,
                        rgba(255, 255, 255, 1) 30%,
                        #e4edf5 100%
                      );
                    `}
                    .ms-Button {
                      border: 0px;
                    }

                    > .ms-Dropdown-container > .ms-Dropdown-title {
                      background: transparent;
                    }

                    .ms-Label {
                      cursor: pointer !important;
                      white-space: nowrap;
                      font-weight: normal;
                      font-size: 14px;
                      color: ${!!filter.value ? '#0D4E98' : '#666'};
                    }
                    .filter-label {
                      margin-left: 5px;
                      font-weight: 600;
                    }
                  `}
                >
                  <Label>
                    {def.title}
                    {filter.value ? ':' : ''}
                  </Label>
                  {filter.value && <ValueLabel />}
                </div>

                {!!filter.value && (
                  <div
                    onClick={async () => {
                      filter.value = undefined
                      renderFilters()

                      await state.db.query()
                      renderFilters()
                    }}
                    className="flex items-center rounded-sm border cursor-pointer"
                    css={css`
                      margin-left: -2px;
                      border-top-left-radius: 0px;
                      border-bottom-left-radius: 0px;
                      padding: 0px 8px 0px 8px;
                      border-color: #0d4e98;
                      background: rgb(255, 255, 255);
                      background: linear-gradient(
                        0deg,
                        rgba(255, 255, 255, 1) 30%,
                        #e4edf5 100%
                      );

                      &:hover {
                        background: linear-gradient(
                          0deg,
                          rgba(255, 255, 255, 1) 30%,
                          #f5e4e4 100%
                        );
                        i {
                          color: #ff5101;
                        }
                      }
                    `}
                  >
                    <Icon
                      iconName="ChromeClose"
                      css={css`
                        color: #718cac;
                        font-weight: 600;
                        font-size: 9px;
                        padding-top: 2px;
                      `}
                    ></Icon>
                  </div>
                )}
              </div>
            )
          }}
        </FilterSingle>
      )
    })
    render()
  }

  return (
    <div className="flex flex-1 flex-row justify-between">
      <div className="flex items-center relative">
        <div
          ref={(e) => {
            if (e) {
              meta.el.filterBtn = e as any
            }
          }}
        >
          <DefaultButton
            iconProps={{ iconName: 'BacklogList' }}
            onClick={() => {
              meta.picker = true
              renderFilters()
            }}
            css={css`
              padding: 0px 8px 0px 5px;
              color: #555;
              border-color: #ccc;
              height: 30px;
              min-width: unset;
              border-top-left-radius: 0px;
              border-bottom-left-radius: 0px;
              border-left: 0px;
              .ms-Button-textContainer {
                display: flex;
                align-self: stretch;
                align-items: center;
              }
              .ms-Button-label {
                display: flex;
                font-size: 13px;
                align-items: center;
                padding: 0px 0px 2px 0px;
                margin: 0px;
              }
            `}
          >
            {meta.visibleFilters.length <= 0 && 'Filter'}
          </DefaultButton>
        </div>

        {meta.picker && (
          <Callout
            onDismiss={() => {
              meta.picker = !meta.picker
              renderFilters()
            }}
            directionalHint={DirectionalHint.bottomLeftEdge}
            isBeakVisible={false}
            target={meta.el.filterBtn}
          >
            <div
              css={css`
                min-width: 200px;
              `}
            >
              {meta.orderedColumns.map((col, idx) => {
                return (
                  <Label
                    key={idx}
                    className="px-2 py-1 select-none cursor-pointer border-gray-300 border-b flex items-center"
                    onClick={() => {
                      state.filter.instances[col].visible =
                        !state.filter.instances[col].visible

                      const visibleCachePath = `filter-visible-${
                        window.cms_id
                      }.${state.tree.getPath()}.${col}`

                      if (state.filter.instances[col].visible) {
                        localStorage[visibleCachePath] = 'y'
                      } else {
                        localStorage.removeItem(visibleCachePath)
                      }
                      renderFilters()
                    }}
                  >
                    <Icon
                      iconName={
                        state.filter.instances[col].visible
                          ? 'CheckboxCompositeReversed'
                          : 'Checkbox'
                      }
                      className="mr-2"
                    />
                    <span>{state.filter.instances[col].title}</span>
                  </Label>
                )
              })}
            </div>
          </Callout>
        )}
        {meta.renderedFilters}
      </div>
      <div
        className="flex flex-1 items-center justify-end"
        ref={(e) => {
          if (e && meta.container !== e) {
            meta.container = e
            renderFilters()
          }
        }}
      >
        {meta.container && (
          <Actions
            width={meta.container.offsetWidth}
            state={state}
            action={state.header?.action as any}
          />
        )}
      </div>
    </div>
  )
}
