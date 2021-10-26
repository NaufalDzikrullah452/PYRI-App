/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import {
  Icon,
  Modal,
  ProgressIndicator,
} from '@fluentui/react'
import { Fragment, useContext, useEffect, useRef } from 'react'
import { useRender } from 'web.utils/src/useRender'
import { IBaseFieldProps } from '../../../../../ext/types/__form'
import set from 'lodash.set'

export const WFileUpload = (props: IBaseFieldProps) => {
  const render = useRender()
  const form = useContext(props.ctx)
  const field = form.config.fields[props.name]
  if (!field) {
    return null
  }
  const state = field.state

  const _ = useRef({
    value: '',
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
    modal: false,
    progress: 100,
    showBrowse: false,
    loading: false
  })

  const meta = _.current
  const fieldProps = state.fieldProps

  useEffect(() => {
    meta.value = state.value;
    render()
  }, [state.value])


  const _onChange = async (e) => {
    if (e.target.files.length) {
      if (e.target.files.length) {
        const files = e.target.files
        const ext = files[0].name.split('.').pop()

        let directory = 'public'
        if (form.db.tableName) {
          directory = `${form.db.tableName}/${props.name}`
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
        render();

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
        render()

        set(form.db.data, props.name, url)
        if (typeof state.onChange === 'function')
          state.onChange(url, {
            state: form,
            row: form.db.data,
            col: props.name,
          })
        props.internalChange(url)
      }
    }
  }
  return (
    <div className="flex flex-col items-stretch">
      <div
        className="relative"
        css={css`
                min-height: 25px;
                border: 1px dashed #ccc;
                border-bottom: 0px;
              `}
      >
        <div
          className="absolute w-full t-0 x-0"
          css={css`
                  div {
                    padding: 0px;
                  }
                `}
        >
          {meta.progress < 100 && (
            <ProgressIndicator
              percentComplete={
                meta.progress <= 0 ? undefined : meta.progress / 100
              }
            />
          )}
        </div>
        {!meta.value && (
          <div
            className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-400"
            css={css`
                    font-size: 9px;
                  `}
          >
            Empty
          </div>
        )}
        {typeof meta.value === 'string' && meta.value && (
          <Fragment>
            {meta.isImage ? (
              <Fragment>
                <div
                  className="flex flex-col items-stretch p-1 cursor-pointer"
                  onClick={() => {
                    meta.modal = true
                    render();
                  }}
                  css={css`
                          background-image: linear-gradient(
                              45deg,
                              #d1d1d1 25%,
                              transparent 25%
                            ),
                            linear-gradient(
                              -45deg,
                              #d1d1d1 25%,
                              transparent 25%
                            ),
                            linear-gradient(45deg, transparent 75%, #d1d1d1 75%),
                            linear-gradient(
                              -45deg,
                              transparent 75%,
                              #d1d1d1 75%
                            );
                          background-size: 20px 20px;
                          background-position: 0 0, 0 10px, 10px -10px,
                            -10px 0px;
                        `}
                >
                  <img
                    css={css`
                            max-height: 90px;
                            object-fit: scale-down;
                            object-position: center;
                          `}
                    src={meta.value}
                    alt={props.name}
                  />
                </div>
                <Modal
                  isOpen={meta.modal}
                  onDismiss={() => {
                    meta.modal = false
                    render()
                  }}
                  styles={{
                    scrollableContent: {
                      maxHeight: 'auto',
                    },
                  }}
                  allowTouchBodyScroll={true}
                >
                  <img
                    css={css`
                            background-image: linear-gradient(
                                45deg,
                                #d1d1d1 25%,
                                transparent 25%
                              ),
                              linear-gradient(
                                -45deg,
                                #d1d1d1 25%,
                                transparent 25%
                              ),
                              linear-gradient(
                                45deg,
                                transparent 75%,
                                #d1d1d1 75%
                              ),
                              linear-gradient(
                                -45deg,
                                transparent 75%,
                                #d1d1d1 75%
                              );
                            background-size: 20px 20px;
                            background-position: 0 0, 0 10px, 10px -10px,
                              -10px 0px;
                          `}
                    onClick={() => {
                      meta.modal = false
                      render()
                    }}
                    src={meta.value}
                    alt={props.name}
                    className="object-fill max-h-screen cursor-pointer"
                  />
                </Modal>
              </Fragment>
            ) : (
              <a
                href={meta.value}
                target="_blank"
                className="flex flex-row justify-center px-1 py-4 font-semibold text-blue-800 cursor-pointer"
                css={css`
                        font-size: 12px;
                      `}
              >
                Download{' '}
                {(meta.value.split('.').pop() || '').toUpperCase()} File{' '}
                <Icon className="ml-1" iconName="Download" />
              </a>
            )}
          </Fragment>
        )}
      </div>
      <div
        className="flex flex-row items-center justify-between font-semibold select-none "
        css={css`
                min-height: 32px;
                border: 1px dashed #ccc;
                font-size: 12px;
                ${false ? "display: none" : ""}
              `}
      >
        <div
          className="relative flex-1 text-gray-500 hover:text-blue-500"
          css={css`
                  min-height: 32px;
                `}
        >
          <div
            className={`absolute 
                 inset-0 flex items-center pl-3 w-full h-full
                  pointer-events-none ${meta.value ? 'pl-3' : 'justify-center'
              }`}
          >
            Click here to upload
          </div>
          <input
            multiple={false}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={_onChange}
            accept={!!fieldProps ? fieldProps.acceptFile : null}
          />
        </div>

        {meta.value && (
          <div
            className="px-4 text-xs text-red-400 cursor-pointer"
            onClick={() => {
              if (confirm('Are you sure want to clear uploaded file?')) {
                meta.value = null
                render()

                set(form.db.data, props.name, null)
                if (typeof state.onChange === 'function')
                  state.onChange(null, {
                    state: form,
                    row: form.db.data,
                    col: props.name,
                  })
                props.internalChange(null)
              }
            }}
          >
            Clear
          </div>
        )}
      </div>
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
