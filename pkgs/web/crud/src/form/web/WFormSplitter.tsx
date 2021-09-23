/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { ReactElement, useEffect, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useRender } from 'web.utils/src/useRender'

import { DndProvider } from 'react-dnd'
import { TouchBackend } from 'react-dnd-touch-backend'

interface IWFormSplitter {
  size: number
  enabled?: boolean
  unit?: 'pixel' | 'percent'
  setSize: (v: number) => void
  children: [ReactElement, ReactElement]
  mode: 'top' | 'bottom' | 'left' | 'right' | 'none' // position of the first element
}

export const WFormSplitter = (props: IWFormSplitter) => {
  return (
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
      <WFormSplitterInternal {...props} />
    </DndProvider>
  )
}

const WFormSplitterInternal = ({
  children,
  size,
  mode,
  enabled,
  unit: inputUnit,
  setSize,
}: IWFormSplitter) => {
  const _ = useRef({
    master: children[0],
    slave: children[1],
    size: {
      current: size,
      last: 0,
      container: 0,
    },
    id: Math.floor(Math.random() * 1000000000),
  })
  const meta = _.current
  const render = useRender()
  const unit = inputUnit === undefined ? 'percent' : inputUnit
  const [{ isDragging }, drop] = useDrop({
    accept: `split-${meta.id}`,
    hover: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset() as {
        x: number
        y: number
      }

      const con = meta.size.container
      const d = delta[mode === 'top' || mode === 'bottom' ? 'y' : 'x']
      if (unit === 'percent') {
        const cur = (meta.size.last / 100) * con
        const dif = ((cur + d) / con) * 100
        meta.size.current = size + dif
      } else {
        meta.size.current = size + d
      }
      render()
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isOver(),
    }),
    drop: () => {
      meta.size.container = size
      setSize(meta.size.current)
    },
  })

  useEffect(() => {
    meta.master = children[0]
    meta.slave = children[1]
    render()
  }, [children])

  return (
    <div
      className={`flex flex-1 items-stretch w-full h-full self-stretch overflow-hidden ${
        {
          top: 'flex-col',
          bottom: 'flex-col-reverse',
          left: 'flex-row',
          right: 'flex-row-reverse',
          none: 'flex-col',
        }[mode]
      }`}
      ref={(r) => {
        if (r) {
          meta.size.container =
            r[
              mode === 'top' || mode === 'bottom'
                ? 'offsetHeight'
                : 'offsetWidth'
            ]
        }
        return drop(r)
      }}
      css={css`
        & * ::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }

        & * ::-webkit-scrollbar-thumb {
          background-color: rgba(1, 1, 1, 0.2);
          opacity: 0.7;
          margin: 2px;
        }

        ${isDragging &&
        css`
          cursor: ${{
            top: 'ns-resize',
            bottom: 'ns-resize',
            left: 'ew-resize',
            right: 'ew-resize',
            none: 'default',
          }[mode]};
        `}

        .split-divider {
          cursor: ${enabled === undefined || !!enabled
            ? {
                top: 'ns-resize',
                bottom: 'ns-resize',
                left: 'ew-resize',
                right: 'ew-resize',
                none: 'default',
              }[mode]
            : 'default'};
        }
      `}
    >
      <div
        className="flex relative"
        css={css`
          flex-basis: ${mode === 'none'
            ? '100%'
            : meta.size.current + (unit === 'percent' ? '%' : 'px')};
        `}
      >
        <div className="split-master flex flex-1 absolute inset-0 overflow-auto">
          {meta.master}
        </div>
      </div>
      {mode !== 'none' && (
        <>
          <SplitDivider enabled={enabled} id={meta.id} />
          <div className="flex flex-1 items-stretch self-stretch relative">
            <div
              className="absolute inset-0 overflow-auto flex flex-1 items-stretch"
              css={css`
                > div {
                  flex: 1;
                }
              `}
            >
              {meta.slave}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const SplitDivider = ({ id, enabled }) => {
  const [_, drag] = useDrag({
    type: `split-${id}`,
    item: { type: 'split' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  })
  return (
    <div
      className="split-divider flex items-stretch relative bg-gray-300"
      css={css`
        flex-basis: 1px;
      `}
      ref={enabled === undefined || !!enabled ? drag : undefined}
    >
      {(enabled === undefined || !!enabled) && (
        <div
          className="absolute inset-0 z-10"
          css={css`
            margin: -10px;
          `}
        ></div>
      )}
    </div>
  )
}
