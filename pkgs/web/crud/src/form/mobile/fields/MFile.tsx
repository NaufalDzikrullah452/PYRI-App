/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { Button, Progressbar } from 'framework7-react'
import set from 'lodash.set'
import { useContext, useEffect, useRef } from 'react'
import type { BaseWindow } from 'web.init/src/window'
import { useRender } from 'web.utils/src/useRender'
import { IBaseFieldProps } from '../../../../../ext/types/__form'
import { resolveValue } from './Minfo'

declare const window: BaseWindow

export const MFile = ({ ctx, internalChange, name }: IBaseFieldProps) => {
  const _ = useRef({
    loading: false,
    progress: 0,
    value: null,
    init: false,
    get isImage() {
      if (
        meta.value &&
        typeof meta.value === 'string' &&
        meta.value.match(/[^/]+(jpg|png|gif|jpeg|svg)$/)
      ) {
        return true
      }
      return false
    },
    get ext() {
      return this.value.split('.').pop()
    },
    get name() {
      return this.value.split('/').pop()
    },
    get path() {
      const a = this.value.split('/').filter((e) => e)
      a.pop()
      if (a[0] === 'upload') a.shift()

      return a.join('/')
    },
  })
  const meta = _.current
  const form = useContext(ctx)
  const field = form.config.fields[name]
  const state = field.state
  const render = useRender()

  const required = resolveValue({
    definer: state.required,
    args: [{ state: form, row: form.db.data, col: name }],
    render,
    default: false,
  })

  useEffect(() => {
    meta.init = true

    meta.value = state.value
    render()
  }, [state.value])

  if (!meta.init) return null

  const unggah = state.readonly ? null : (
    <div className=" relative flex-1">
      <Button fill bgColor="blue" className="capitalize">
        {meta.value ? 'UNGGAH FILE BARU ↑' : 'UNGGAH FILE ↑'}
      </Button>

      <input
        type="file"
        onChange={async (e) => {
          if (e.target.files?.length) {
            const files = e.target.files
            const ext = files[0].name.split('.').pop()

            let directory = 'public'

            if (form.db.definition.db.name) {
              directory = `${form.db.definition.db.name}/${name}`
            }
            const file = new File(
              [files[0].slice(0, files[0].size, files[0].type)],
              `${getUuid()}.${ext}`,
              {
                type: files[0].type,
              }
            )
            const url = `/upload/${directory}/${file.name}`
            const formData = new FormData()
            formData.append(directory, file)

            meta.loading = true
            render()
            await request(
              '/__upload',
              {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
                body: formData,
              },
              (event) => {
                const percent = (event.loaded / event.total) * 100
                meta.progress = percent
                render()
              }
            )

            meta.loading = false
            meta.value = url
            const value = meta.value
            set(form.db.data, name, value)

            if (typeof state.onChange === 'function')
              state.onChange(value, {
                state: form,
                row: form.db.data,
                col: name,
              })
            internalChange(value)
          }
        }}
        className="absolute inset-0 opacity-0 z-10"
      />
    </div>
  )

  return (
    <div className={`list ${required ? 'required' : ''} `}>
      <ul>
        <div
          className={`item-content item-input ${
            state.error
              ? 'item-input-with-error-message item-input-invalid'
              : ''
          }`}
        >
          <div
            className="item-inner"
            css={css`
              &:after {
                display: none !important;
              }
            `}
          >
            <div className="item-title item-label">{state.title}</div>
            <div className="item-input-wrap ">
              {meta.loading ? (
                <Progressbar progress={meta.progress} className="my-7" />
              ) : (
                <>
                  {meta.value ? (
                    <div
                      className="flex flex-row my-1 flex-1 items-center"
                      css={css`
                        margin-left: -8px;
                      `}
                    >
                      {meta.value && (
                        <FilePreview
                          ext={meta.ext}
                          path={meta.path}
                          name={meta.name}
                          hideImage={true}
                        />
                      )}
                      <div className="flex space-y-2 flex-col flex-1 items-start justify-center">
                        <Button
                          onClick={() => {
                            if (window.capacitor && window.capacitor.Browser) {
                              window.capacitor.Browser.open({
                                url: meta.value,
                              })
                            } else {
                              location.href = meta.value
                            }
                          }}
                          outline
                        >
                          Unduh file ↓
                        </Button>
                        {unggah}
                      </div>
                    </div>
                  ) : (
                    <div className="my-4">{unggah}</div>
                  )}
                </>
              )}
              {state.info && (
                <div className="item-input-info">{state.info}</div>
              )}
              {state.error && (
                <div className="item-input-error-message">{state.error}</div>
              )}
            </div>
          </div>
        </div>
      </ul>
    </div>
  )
}

function request(
  url: string,
  opts: {
    method?: 'POST' | 'GET'
    headers?: any
    body?: Parameters<XMLHttpRequest['send']>[0]
  } = {},
  onProgress: XMLHttpRequest['upload']['onprogress']
) {
  return new Promise((res, rej) => {
    const xhr = new XMLHttpRequest()
    xhr.open(opts.method || 'get', url, true)

    Object.keys(opts.headers || {}).forEach((headerKey) => {
      xhr.setRequestHeader(headerKey, opts.headers[headerKey])
    })

    xhr.onload = (e: any) => res(e.target.responseText)

    xhr.onerror = rej

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = onProgress // event.loaded / event.total * 100 ; //event.lengthComputable
    }

    xhr.send(opts.body)
  })
}
const getUuid = (a: string = ''): string =>
  a
    ? /* eslint-disable no-bitwise */
      ((Number(a) ^ (Math.random() * 16)) >> (Number(a) / 4)).toString(16)
    : `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, getUuid)

const join = (arr: string[]): string => {
  return arr.join('/').replace(/\/+/g, '/').replace(/\/+$/, '')
}

const fixPath = (path: string, name: string, args?: string) => {
  if (path.indexOf('http') === 0) {
    return path
  }

  return join(['/upload/', path, name]) + (args ? args : '')
}

export const FilePreview = (props: {
  ext
  path
  name
  hideImage?: boolean
}) => {
  const { ext, path, name, hideImage } = props
  return !hideImage &&
    ['jpg', 'svg', 'jpeg', 'png', 'gif'].indexOf(ext) >= 0 ? (
    <>
      <img
        className="rounded-md select-none"
        src={`${fixPath(path, name)}?h=150`}
      />
      <img
        css={css`
          pointer-events: none;
          height: 40px;
          position: absolute;
          bottom: -5px;
          right: -5px;
        `}
        src={`/__ext/icons/${ext}.png`}
      />
    </>
  ) : (
    <img
      css={css`
        pointer-events: none;
        height: 70px;
      `}
      src={`/__ext/icons/${ext}.png`}
      onError={(e: any) => {
        e.target.attributes['src'].value = `/__ext/icons/txt.png`
      }}
      className="m-2"
    />
  )
}
