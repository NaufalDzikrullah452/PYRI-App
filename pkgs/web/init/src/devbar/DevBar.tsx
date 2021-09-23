/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { useRef } from 'react'
import { useRender } from 'web.utils/src/useRender'
import useFps from './useFps'
import { Callout } from '@fluentui/react'
import { Tester } from './tester/Tester'

export const DevBar = () => {
  const _ = useRef({
    active: false,
    tester: {
      el: null as null | HTMLDivElement,
      show: false,
    },
    show: false,
  })
  const meta = _.current
  const { currentFps } = useFps()
  const render = useRender()

  if (!meta.show) return null

  return (
    <>
      <span
        className={`fixed top-0 left-0 flex flex-row border-b border-r border-gray-600 select-none  font-medium bg-white ${
          !meta.active ? `opacity-20 hover:opacity-95` : ``
        }`}
        css={css`
          font-size: 10px;
          z-index: 99999999;
          cursor: default;
          border-bottom-right-radius: 3px;
          > div {
            padding: 1px 3px;
          }
        `}
        onClick={() => {
          meta.active = true
          render()
        }}
      >
        <div className="border-r border-gray-600">
          <span className="text-green-600 font-bold">DEV</span>
          <span className="font-extralight">Base</span>
        </div>
        <div
          ref={(e) => {
            if (e) {
              meta.tester.el = e
            }
          }}
          onClick={() => {
            meta.tester.show = true
            render()
          }}
          className={`border-r font-semibold cursor-pointer border-gray-600 flex flex-row items-center ${
            meta.tester.show ? `bg-gray-600 text-white` : ``
          }`}
        >
          Test Suite
        </div>
        <div className="flex items-baseline">
          <div
            className="flex items-center justify-end overflow-hidden"
            css={css`
              width: 14px;
            `}
          >
            {currentFps || '...'}
          </div>
          <b
            css={css`
              font-size: 8px;
            `}
          >
            FPS
          </b>
        </div>
        <div
          className="flex items-center justify-center border-gray-600 border-l"
          onClick={() => {
            meta.show = false; 
            render()
          }}
        >
          <div
            css={css`
              font-size: 16px;
              line-height: 0px;
              margin-top: -4px;
              margin-left: -1px;
            `}
          >
            &times;
          </div>
        </div>
      </span>
      {meta.tester.show && meta.tester.el && (
        <Callout
          className="border border-gray-600"
          target={meta.tester.el}
          isBeakVisible={false}
          onDismiss={() => {
            meta.tester.show = false
            render()
          }}
        >
          <Tester />
        </Callout>
      )}
    </>
  )
}
