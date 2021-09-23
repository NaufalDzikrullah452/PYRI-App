/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { TextField } from '@fluentui/react'
import { PureSelect } from 'web.crud/src/form/web/fields/WSelect'
import { useRender } from 'web.utils/src/useRender'
import { IBaseListContext } from '../../ext/types/__list'

export const TemplateToolbar = ({
  template,
  state,
  doFilter,
}: {
  template: { listOri: any[]; listFilter: any }
  state: IBaseListContext
  doFilter: () => void
}) => {
  const render = useRender()

  const domains = { 'All Domain': true }
  if (template && template.listOri) {
    for (let i of template.listOri) {
      if (!!i.site) {
        domains[i.site === '*' ? 'All Domain' : i.site] = true
      }
    }
  }


  if (!state) return null

  return (
    <>
      <div
        className="flex items-stretch ml-3 border border-gray-500"
        css={css`
          .ms-TextField-fieldGroup {
            height: 24px;
            width: 140px;
            border: 0px;
          }
        `}
      >
        <div className="flex items-center px-2 border-r border-gray-500">
          Title
        </div>
        <TextField
          value={template.listFilter.title}
          onChange={(e, v) => {
            template.listFilter.title = v || ''
            doFilter()
          }}
        />
      </div>

      <div className="flex items-stretch ml-3 border border-gray-500">
        <div className="flex items-center px-2 border-r border-gray-500">
          Domain
        </div>
        <PureSelect
          onChange={(v) => {
            template.listFilter.domain = v
            doFilter()
          }}
          value={template.listFilter.domain}
          css={css`
            .ms-TextField-fieldGroup {
              height: 24px;
              width: 120px;
              border: 0px;
            }
          `}
          items={Object.keys(domains).sort()}
        />
      </div>
    </>
  )
}
