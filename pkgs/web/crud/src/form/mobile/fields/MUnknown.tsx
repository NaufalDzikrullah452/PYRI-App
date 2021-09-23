/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { List, ListInput } from 'framework7-react'
import { useContext } from 'react'
import type { IBaseFieldProps } from '../../../../../ext/types/__form'

import { removeCircular } from 'web.utils/src/removeCircular'
export const MUnknown = ({ ctx, name }: IBaseFieldProps) => {
  const form = useContext(ctx)
  const field = form.config.fields[name]

  if (!field) return null
  const state = field.state

  return (
    <List>
      <ListInput
        label={
          (
            <div className="flex flex-row">
              <svg
                height={16}
                viewBox="0 0 128 128"
                width={16}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M119.31 116.78H8.69a6.93 6.93 0 01-5.933-10.509l55.309-91.7a6.93 6.93 0 0111.868 0l55.309 91.7a6.93 6.93 0 01-5.933 10.509z"
                  fill="#f4d844"
                />
                <path
                  d="M14.128 106.779L64 24.096l49.872 82.683z"
                  fill="#de6246"
                />
                <g fill="#eaeaf0">
                  <path d="M60 51.45h8v30.219h-8zM60 90.208h8v7.219h-8z" />
                </g>
              </svg>
              <span className="text-red-700 px-1">[{state.type}]</span> {state.title}
            </div>
          ) as any
        }
        value={JSON.stringify(state.value, removeCircular())}
      ></ListInput>
    </List>
  )
}
