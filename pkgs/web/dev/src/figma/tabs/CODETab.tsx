/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { DefaultButton, PrimaryButton } from '@fluentui/react'
import { runInAction, toJS } from 'mobx'
import { observer, useLocalObservable } from 'mobx-react-lite'
import { useEffect } from 'react'
import { GoArrowLeft } from 'react-icons/go'
import { RiShareForwardFill } from 'react-icons/ri'
import { Code } from '../components/Code'
import { sendParent } from '../ws'

const neverWrongTag = ['mform', 'qform']

export const CODETab = observer(({ node, frame, page, forceRender }: any) => {
  const meta = useLocalObservable(() => ({
    isWrong: false,
    backTo: (window as any).codeBackTo || { page: '', node: '' },
  }))

  useEffect(() => {
    runInAction(() => {
      if (neverWrongTag.indexOf(node.tag) < 0) {
        meta.isWrong =
          node.type !== 'INSTANCE' &&
          node.wrapCode &&
          node.wrapCode.indexOf('<<component>>') < 0
      }
    })
  }, [node])

  useEffect(() => {
    return () => {
      ;(window as any).codeBackTo = toJS(meta.backTo)
    }
  }, [])

  const goToComponent =
    !meta.backTo.node && node.type === 'INSTANCE' && node.component

  return (
    <div
      className="flex flex-col flex-1"
      css={css`
        .cursors-layer .monaco-mouse-cursor-text {
          background: black;
          position: absolute;
        }
      `}
    >
      {(goToComponent || meta.backTo.node) && (
        <div
          className={`flex items-center justify-between p-1 border-gray-300 border-b`}
        >
          <div className="flex flex-row">
            {goToComponent && (
              <PrimaryButton
                onClick={() => {
                  runInAction(() => {
                    meta.backTo = { node: node.id, page: page.id }
                  })
                  sendParent('focus-to', {
                    node_id: node.component.id,
                  })
                }}
              >
                Go To Component <RiShareForwardFill className="ml-1" />
              </PrimaryButton>
            )}
            {meta.backTo.node && (
              <DefaultButton
                onClick={() => {
                  sendParent('focus-to', {
                    node_id: meta.backTo.node,
                    page_id: meta.backTo.page,
                  })
                  runInAction(() => {
                    meta.backTo = {
                      node: '',
                      page: '',
                    }
                  })
                }}
              >
                <GoArrowLeft className="mr-1" /> Back To Instance
              </DefaultButton>
            )}
          </div>
        </div>
      )}

      {node && (
        <Code
          node={node}
          frame={frame}
          updateIsWrong={(isWrong: boolean) => {
            // if (neverWrongTag.indexOf(node.tag) < 0) {
            //   runInAction(() => {
            //     meta.isWrong = isWrong
            //   })
            // }
          }}
        />
      )}
    </div>
  )
})
