/** @jsx jsx */
import { jsx } from '@emotion/react'
import { Label, TextField } from '@fluentui/react'
import set from 'lodash.set'
import { useContext, useRef } from 'react'
import { IBaseFilterDef } from '../../../../ext/types/__list'
import { IFilterItemText, IFilterProp } from '../../../../ext/types/__filter'
import { getFilterDef } from './FilterSingle'

export const queryFilterNumber: IBaseFilterDef['modifyQuery'] = (props) => {
  const { params, instance, name } = props

  set(params.where, name, {
    [instance.operator]: instance.value * 1,
  })
}

export const FilterNumber = ({
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
        <TextField
          type="text"
          defaultValue={filter.value}
          onChange={(_, text) => {
            filter.value = text
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
    operators: [
      { label: 'Contains', value: 'contains' },
      { label: 'Ends With', value: 'endsWith' },
      { label: 'Starts With', value: 'startsWith' },
      { label: 'Equals', value: 'equals' },
      { label: 'Not Contains', value: 'not_contains' },
      { label: 'Not Ends With', value: 'not_endsWith' },
      { label: 'Not Starts With', value: 'not_endsWith' },
      { label: 'Not Equals', value: 'not_equals' },
    ],
    ValueLabel: () => {
      return <Label className="filter-label">{filter.value} </Label>
    },
  })
}
