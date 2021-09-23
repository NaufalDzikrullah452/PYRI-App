/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { DefaultButton, Spinner, TextField } from '@fluentui/react'
import Editor, { loader, useMonaco } from '@monaco-editor/react'
import { waitUntil } from 'libs/src/wait-until'
import { useEffect, useRef } from 'react'
import { api } from 'web.utils/src/api'
import { useRender } from 'web.utils/src/useRender'
import type { BaseWindow } from '../../window'
import type { ISingleTest } from './Tester'

declare const window: BaseWindow

loader.config({
  paths: { vs: '/__ext/monaco/vs' },
})
export const TesterForm = ({
  test,
  onChange,
  onOpen,
  dismissAndReload: dismissAndReload,
}: {
  test: ISingleTest
  onOpen: () => void
  dismissAndReload: () => void
  onChange: (newtest: ISingleTest) => void
}) => {
  const _ = useRef({
    code: test.code,
    saveStatus: 'ready' as 'ready' | 'saving' | 'saved' | 'failed',
    running: false,
    deleting: false,
    name: test.name,
  })
  const meta = _.current
  const render = useRender()
  const monaco = useMonaco()
  useEffect(() => {
    onOpen()
    const keydown = function (e) {
      if (
        (window.navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey) &&
        e.keyCode == 83
      ) {
        e.preventDefault()
        save()
      }
    }
    document.addEventListener('keydown', keydown, true)
    return () => {
      document.removeEventListener('keydown', keydown, true)
    }
  }, [])

  const run = () => {
    meta.running = true
    render()
  }
  const save = async () => {
    meta.saveStatus = 'saving'
    render()

    if (!test.isNew && test.oldName === undefined) {
      test.oldName = test.name
    }

    const res = await api('/__tester/save', {
      ...test,
      code: meta.code,
      name: meta.name,
    })

    if (res.status === 'success') {
      if (test.oldName) {
        test.oldName = undefined
        onChange(test)
      }

      meta.saveStatus = 'saved'
      onChange({ ...test, isNew: false })
    } else {
      meta.saveStatus = 'failed'
      alert('Save Failed:\n' + res.msg)
    }
    render()

    await waitUntil(500)
    meta.saveStatus = 'ready'
    render()
  }

  return (
    <div
      className="flex flex-col"
      css={css`
        width: 90vw;
        height: 90vh;
      `}
    >
      <div
        className={`border-b border-gray-300 flex flex-row items-stretch ${
          {
            ready: '',
            saving: 'bg-yellow-100',
            saved: 'bg-green-100',
            failed: 'bg-red-100',
          }[meta.saveStatus] || ''
        }`}
        css={css`
          .ms-Button {
            min-width: 0px;
            padding: 0px 5px;
            height: 24px;
          }

          .ms-TextField-fieldGroup {
            background-color: transparent;
          }
        `}
      >
        {!test.isNew && (
          <div className="flex p-1 bg-white border-gray-300 border-r">
            <DefaultButton
              tabIndex={1}
              iconProps={{ iconName: 'Trash', color: 'red' }}
              disabled={meta.deleting}
              onClick={async () => {
                if (confirm('Are you sure want to delete this test?')) {
                  meta.deleting = true
                  render()
                  await api(`/__tester/del/${test.page_id}/${test.name}`)
                  dismissAndReload()
                }
              }}
            />
          </div>
        )}
        <TextField
          tabIndex={0}
          className={`flex-1`}
          prefix={'Test Name'}
          value={meta.name}
          onChange={(ev) => {
            let result = ev.currentTarget.value
              .replace(/[^a-z0-9]/gim, '-')
              .replace(/\-+/g, '-')
              .toLowerCase()

            meta.name = result
            render()
          }}
          onBlur={() => {
            onChange({ ...test, name: meta.name })
          }}
          autoFocus={test.isNew}
          css={css`
            .ms-TextField-fieldGroup {
              border: 0px;
              border-radius: 0px;
              &::after {
                display: none;
              }
            }
            input {
              padding-left: 10px;
            }
          `}
        />
        <div className="flex flex-row items-center space-x-1 p-1">
          <DefaultButton
            tabIndex={1}
            iconProps={{
              iconName: {
                saving: 'HourGlass',
                failed: 'ReportWarning',
                ready: 'Save',
                saved: 'Checkmark',
              }[meta.saveStatus],
            }}
            disabled={meta.saveStatus === 'saving'}
            onClick={save}
          />
          {!test.isNew && (
            <>
              <DefaultButton
                tabIndex={1}
                iconProps={{ iconName: 'Play' }}
                disabled={meta.running}
                onClick={run}
              />
            </>
          )}
        </div>
      </div>
      <Editor
        css={css`
          .margin {
            margin: 0px !important;
          }
        `}
        className="flex-1"
        loading={<Spinner />}
        options={{
          tabIndex: 0,
          fontSize: 13,
          fontFamily:
            '"Jetbrains Mono","SF Mono",Monaco,Menlo,Consolas,"Ubuntu Mono","Liberation Mono","DejaVu Sans Mono","Courier New",monospace',
        }}
        onMount={async (editor, monaco) => {
          editor.updateOptions({ tabSize: 2, linkedEditing: true })
        }}
        onChange={(newval) => {
          meta.code = newval || ''
          render()
          onChange({
            ...test,
            code: meta.code,
          })
        }}
        defaultPath={'code.tsx'}
        defaultLanguage={'javascript'}
        language={'javascript'}
        defaultValue={test.code}
      />
    </div>
  )
}
