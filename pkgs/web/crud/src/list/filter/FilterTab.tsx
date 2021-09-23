/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import set from 'lodash.set'
import { useContext, useRef } from 'react'
import type {
  IFilterItemTab,
  IFilterItemText,
  IFilterProp
} from '../../../../ext/types/__filter'
import { IBaseFilterDef } from '../../../../ext/types/__list'
import { PureTab } from '../../form/web/WFormTab'
import { getFilterDef } from './FilterSingle'

export const queryFilterTab: IBaseFilterDef['modifyQuery'] = (props) => {
  const { params, instance, name } = props
  set(params.where, name, instance.value)
}

export const FilterTab = ({
  ctx,
  name,
  children,
  onSubmit,
}: IFilterProp<IFilterItemText>) => {
  const state = useContext(ctx)
  const filter = state.filter.instances[name] as IFilterItemTab
  const def = getFilterDef(name, state)
  const operator = filter.operator || 'contains'
  const _ = useRef({
    originalValue: filter.value,
  })
  const meta = _.current

  const render = state.filter.instances[name].render
  const submit = async () => {
    onSubmit()
    render()
    await state.db.query()
  }

  return children({
    name,
    submit,
    FilterInput: (props) => {
      return (
        <div
          css={css`
            margin-bottom: -13px;
            .pure-tab {
              border-bottom: 0px !important;

              .tab-item {
                border-top-left-radius: 2px !important;
                border-top-right-radius: 2px !important;
                padding: 6px 10px 14px 10px !important;
              }
            }
          `}
        >
          <PureTab
            active={filter.value || ''}
            position="top"
            onChange={async (tab) => {
              if (filter.value === tab) {
                filter.value = ''
              } else {
                filter.value = tab
              }
              submit()
            }}
            tabs={filter.items.map((e) => {
              return {
                title: typeof e === 'string' ? e : e.label,
                component: null,
              }
            })}
          />
        </div>
      )
    },
    def,
    filter,
    operators: [],
    ValueLabel: () => {
      return <></>
    },
  })
}
