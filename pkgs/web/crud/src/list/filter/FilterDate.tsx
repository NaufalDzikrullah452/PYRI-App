/** @jsx jsx */
import { jsx, css } from '@emotion/react'
import { DatePicker, Label, TextField } from '@fluentui/react'
import add from 'date-fns/esm/add'
import setDate from 'date-fns/esm/set'
import { db } from 'libs'
import set from 'lodash.set'
import { useContext, useRef } from 'react'
import { shortFormatDate } from 'web.utils/src/formatDate'
import { IFilterItemText, IFilterProp } from '../../../../ext/types/__filter'
import { IBaseFilterDef } from '../../../../ext/types/__list'
import { getFilterDef } from './FilterSingle'

export const queryFilterDate: IBaseFilterDef['modifyQuery'] = (props) => {
  const { params, instance, name } = props

  if (instance.value instanceof Date) {
    if (instance.operator === 'equals') {
      const now = setDate(new Date(instance.value), {
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      })
      const next = add(now, { days: 1 })
      set(params.where, name, { gte: now, lt: next })
    }
  }
}

export const FilterDate = ({
  ctx,
  name,
  children,
  onSubmit,
}: IFilterProp<IFilterItemText>) => {
  const state = useContext(ctx)
  const filter = state.filter.instances[name]
  const def = getFilterDef(name, state)
  const _ = useRef({
    originalValue: filter.value,
  })
  const meta = _.current

  const render = state.filter.instances[name].render
  const submit = () => {
    onSubmit()
    render()
    if (meta.originalValue !== filter.value) {
      state.db.query()
    }
  }
  return children({
    name,
    submit,
    FilterInput: (props) => {
      return (
        <DatePicker
          css={css`
            .ms-TextField > span {
              display: none;
            }
          `}
          defaultValue={filter.value}
          formatDate={(date) => {
            return shortFormatDate(date)
          }}
          onSelectDate={(date) => {
            filter.value = date
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              submit()
            }
          }}
        />
      )
    },
    def,
    filter,
    operators: [{ label: 'Date', value: 'equals' }],
    ValueLabel: () => {
      return (
        <Label className="filter-label">{shortFormatDate(filter.value)} </Label>
      )
    },
  })
}
