/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import {
  CheckboxVisibility,
  ConstrainMode,
  DetailsList,
  Icon,
  ProgressIndicator,
  ScrollablePane,
  ScrollbarVisibility,
  SelectionMode,
  Spinner,
  SpinnerSize,
  Sticky,
  StickyPositionType,
  TooltipHost,
} from '@fluentui/react'
import { initializeIcons } from '@fluentui/react/lib/Icons'
import { waitUntil } from 'libs'
import get from 'lodash.get'
import throttle from 'lodash.throttle'
import { Context, useContext, useEffect, useRef } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { niceCase } from 'web.utils/src/niceCase'
import { useRender } from 'web.utils/src/useRender'
import { IBaseListContext } from '../../../../ext/types/__list'
import { Loading } from '../../view/loading'
import { baseListFormatOrder } from '../BaseList'
import { BaseListWebCol } from './BaseListWebCol'
import { BaseListWebRow } from './BaseListWebRow'

declare const window: BaseWindow

export const BaseListWeb = ({ ctx }: { ctx: Context<IBaseListContext> }) => {
  const _ = useRef({
    ref: null as any,
    onScroll: (ev) => {
      if (meta.init && ev && ev.scrollTop) {
        state.table.lastScroll = ev.scrollTop
        state.filter.render()
      }
    },
    renderedRowsIndex: new Set(),
    renderedRows: [] as { ts: number; row: any }[],
    lateQuery: (row) => {
      const ts = new Date().getTime()
      if (!meta.renderedRowsIndex.has(row)) {
        meta.renderedRows.push({ row, ts })
        meta.renderedRowsIndex.add(row)
      }
      meta.renderedRows = meta.renderedRows.filter((e) => {
        if (ts - e.ts > 1000) {
          meta.renderedRowsIndex.delete(e.row)
          return false
        }
        return true
      })
      if (meta.renderedRows.length > 1) {
        throttledLastQuery({ rows: meta.renderedRows.map((e) => e.row), state })
      }
    },
    init: false,
  })

  const meta = _.current
  const render = useRender()
  useEffect(() => {
    state.table.render = render
    ;(async () => {
      if (!(window as any).iconInit) {
        ;(window as any).iconInit = true
        initializeIcons()
      }

      await waitUntil(() => state.table.columns)
      meta.init = true
      render()
    })()
  }, [])

  const state = useContext(ctx)
  const throttledLastQuery = throttle(
    async (prop: { rows: any; state: IBaseListContext }) => {
      if (typeof state.db.lateQuery === 'function') {
        await state.db.lateQuery(prop)
      } else if (typeof state.db.lateQuery === 'object') {
        for (let [col, lateQuery] of Object.entries(state.db.lateQuery)) {
          const { rows } = prop
          const unqueried = rows.filter((e) => !e.a_asset)

          if (unqueried.length > 0) {
            for (let row of unqueried) {
              if (!row[col]) {
                row[col] = {}
              }
            }

            const res: any[] = await lateQuery[1](prop)

            const indexed = {}
            for (let i of res) {
              indexed[i[lateQuery[0]]] = i
            }

            for (let row of unqueried) {
              row[col] = indexed[row[lateQuery[0]]]
            }

            state.component.render()
          }
        }
      }
    },
    800,
    {
      trailing: true,
    }
  )

  if (!meta.init) return null

  let items = state.db.list || []
  const grid = state.grid
  if (grid && grid.colSize > 0) {
    items = []
    let row = []
    for (let i of state.db.list) {
      if (row.length < grid.colSize) {
        row.push(i)
      } else {
        items.push(row)
        row = [i]
      }
    }

    if (!state.table.customRenderRow) {
      console.error('[qlist] columns must be a function when using grid')
      return null
    }
  }

  const isEmpty = (items || []).length == 0

  return (
    <div
      className="flex flex-1 items-stretch"
      css={css`
        .ms-DetailsHeader {
          padding-top: 0px;
        }
        .ms-DetailsRow-cell {
          font-size: 14px;
          display: flex;
          align-items: center;
        }

        & * ::-webkit-scrollbar {
          width: 7px;

          height: 7px;
        }

        & * ::-webkit-scrollbar-thumb {
          background-color: rgba(1, 1, 1, 0.2);
          opacity: 0.7;
          margin: 2px;
        }
      `}
    >
      {state.db.loading && (
        <>
          <ProgressIndicator
            css={css`
              position: absolute !important;
              top: 0px;
              left: 0px;
              right: 0px;
              z-index: 20;
              pointer-events: none;
              > div {
                margin: 0px;
                padding: 0px;
              }
            `}
          />
        </>
      )}

      <Loading show={state.db.loading || isEmpty}>
        {isEmpty && !state.db.loading ? (
          <span className="text-gray-700 flex flex-col items-center">
            <Icon
              iconName="FileTemplate"
              css={css`
                font-size: 24px;
              `}
            />
            <>Data Not Found</>
          </span>
        ) : (
          <>
            {(state.db.tableName || state.db.sql) && (
              <>
                <Spinner size={SpinnerSize.large} className="pb-2" />
                {(!state.db.list || state.db.list.length === 0) && 'Loading'}
              </>
            )}
          </>
        )}
      </Loading>

      <ScrollablePane
        scrollbarVisibility={ScrollbarVisibility.auto}
        componentRef={(e: any) => {
          if (e) {
            e.unsubscribe(meta.onScroll)
            e.subscribe(meta.onScroll)
            setTimeout(() => {
              if (e.contentContainer)
                e.contentContainer.scrollTop = state.table.lastScroll
            })
          }
        }}
      >
        <DetailsList
          selectionPreservedOnEmptyClick
          selectionMode={
            state.table.web.checkbox
              ? SelectionMode.multiple
              : SelectionMode.none
          }
          items={items}
          componentRef={(e) => {
            if (!!e) meta.ref = e
          }}
          constrainMode={ConstrainMode.unconstrained}
          checkboxVisibility={
            state.table.web.checkbox
              ? CheckboxVisibility.onHover
              : CheckboxVisibility.hidden
          }
          // onActiveItemChanged={(props) => {
          //   console.log(props)
          // }}
          onRenderDetailsHeader={
            state.table.web.showHeader === false
              ? () => {
                  return null
                }
              : (props, defaultRender) => {
                  if (!props) {
                    return null
                  }
                  const onRenderColumnHeaderTooltip = (tooltipHostProps) => (
                    <TooltipHost {...tooltipHostProps} />
                  )
                  return (
                    <Sticky
                      stickyPosition={StickyPositionType.Header}
                      isScrollSynced
                    >
                      {defaultRender!({
                        ...props,
                        onRenderColumnHeaderTooltip,
                      })}
                    </Sticky>
                  )
                }
          }
          onColumnHeaderClick={(_, col) => {
            if (col && col.fieldName) {
              if (state.db.setSort(col.fieldName)) {
                state.db.query()
              }
            }
          }}
          columns={
            grid
              ? [
                  {
                    key: 0,
                    idx: 0,
                    fieldName: '_',
                    name: '_',
                    isResizable: false,
                    customRender: render,
                  },
                ]
              : convertColumns(state)
          }
          onShouldVirtualize={() => true}
          compact={true}
          onRenderRow={(rowProps, defaultRender) => {
            meta.lateQuery(rowProps.item)

            if (state.grid) {
              if (Array.isArray(rowProps.item)) {
                return (
                  <div
                    className="flex flex-row items-stretch"
                    css={css`
                      > div {
                        flex: 1;
                      }
                    `}
                  >
                    {rowProps.item.map((e, key) => {
                      return (
                        <BaseListWebRow
                          key={key}
                          ctx={ctx}
                          row={e}
                          idx={rowProps.itemIndex}
                          rowProps={rowProps}
                        >
                          {(rp) => defaultRender(rp)}
                        </BaseListWebRow>
                      )
                    })}
                  </div>
                )
              }
            }

            return (
              <BaseListWebRow
                ctx={ctx}
                row={rowProps.item}
                idx={rowProps.itemIndex}
                rowProps={rowProps}
              >
                {(rp) => defaultRender(rp)}
              </BaseListWebRow>
            )
          }}
          onRenderItemColumn={(row, idx, column) => {
            return (
              <BaseListWebCol ctx={ctx} row={row} idx={idx} colDef={column} />
            )
          }}
        />
      </ScrollablePane>
    </div>
  )
}

const convertColumns = (state: IBaseListContext) => {
  const columns = state.table.columns
  const params = state.db.params

  if (!Array.isArray(columns)) return []

  return columns
    .filter((e) => !!e)
    .map((column, idx) => {
      let colName = ''
      let title = ''
      let render: any = null

      const format = (col: any) => {
        if (col.key) {
          colName = col.key
        }
        if (col.title) {
          title = col.title
        } else {
          title = niceCase(colName)
        }
      }

      if (typeof column === 'function') {
      } else if (typeof column === 'string') {
        colName = column
        title = niceCase(colName)
      } else if (Array.isArray(column)) {
        colName = column[0] as any
        if (column[1]) {
          format(column[1])
        }
      }

      const result: any = {
        key: idx.toString(),
        idx,
        fieldName: colName,
        name: title,
        isResizable: true,
        minWidth: 60,
        maxWidth: 120,
        customRender: render,
      }

      if (Array.isArray(column)) {
        if (column[1] && column[1].width) {
          result.minWidth = column[1].width
          result.maxWidth = column[1].width
        }
      }

      const orderBy = baseListFormatOrder(get(params, 'orderBy') || [])
      if (orderBy && orderBy.length > 0) {
        const ord = orderBy[0]
        const [k, v] = Object.entries(ord)[0]

        if (colName.indexOf('.') > 0) {
          const col = colName.split('.')

          const ordLen =
            col.length === 3
              ? `${col[0]}.${col[1]}.${col[2]}`
              : `${col[0]}.${col[1]}`
          const ordering = get(ord, ordLen)
          if (ordering) {
            result.isSorted = true
            result.isSortedDescending = ordering !== 'asc'
          }
        } else if (colName === k) {
          result.isSorted = true
          result.isSortedDescending = v !== 'asc'
        }
      }

      return result
    })
}
