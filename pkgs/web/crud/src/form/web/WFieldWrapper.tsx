/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { Icon, Label } from '@fluentui/react'
import type { BaseWindow } from 'web.init/src/window'

declare const window: BaseWindow

export const WFieldWrapper = ({
  title,
  required,
  error,
  type,
  readonly,
  children,
}) => {
  return (
    <div
      className="flex flex-col"
      css={css`
        overflow: hidden;
        > .ms-Label {
          margin: 0px;
          padding: 5px 0px;
          height: 21px;
          box-sizing: content-box;
          font-size: 14px;
          ${error &&
          css`
            color: #c51818;
          `}
        }
      `}
    >
      {title && (
        <Label className="flex items-center whitespace-nowrap">
          {error && (
            <Icon
              iconName="WarningSolid"
              className="mr-1"
              css={css`
                margin-top: 3px;
              `}
            />
          )}
          {title}{' '}
          {required && !readonly && (
            <span className="text-red-500 font-bold">*</span>
          )}
        </Label>
      )}
      <div
        className="flex items-stretch"
        css={css`
          min-height: 32px;
          overflow: hidden;
          > div:not(.hidden) {
            flex: 1;
          }

          ${error &&
          css`
            div {
              border-color: #c51818 !important;
            }
          `}

          ${readonly &&
          css`
            div {
              pointer-events: none;
              border-color: #d1d5db !important;
              background-color: #f9fafb !important;
            }
          `}
        `}
      >
        {children}
      </div>
      {error && (
        <Label
          css={css`
            color: red;
          `}
        >
          {error}
        </Label>
      )}
    </div>
  )
}
