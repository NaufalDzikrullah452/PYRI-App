/** @jsx jsx */
import { jsx } from '@emotion/react'
import { Label } from '@fluentui/react'
import { useContext } from 'react'

import { IFilterItemText, IFilterProp } from '../../../../ext/types/__filter'
import { IBaseFilterDef } from '../../../../ext/types/__list'
import { getFilterDef } from './FilterSingle'

export const queryFilterBlank: IBaseFilterDef['modifyQuery'] = (props) => {}

export const FilterBlank = ({
  ctx,
  name,
  children,
  onSubmit,
}: IFilterProp<any>) => {
  const state = useContext(ctx)
  const filter = state.filter.instances[name]
  const def = getFilterDef(name, state)

  const render = state.filter.instances[name].render
  return children({
    name,
    submit: () => {},
    FilterInput: (props) => {
      return (
        <>
          <Label>
            Filter <span className="text-red-700">[{props.type}]</span>
            <br /> dalam pengerjaan
          </Label>
        </>
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
