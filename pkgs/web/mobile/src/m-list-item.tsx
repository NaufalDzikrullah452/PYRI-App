/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { ListItem } from 'framework7-react'

export default (props) => {
  return <ListItem {...props} css={css`
  .item-content {
    width: 100%;
  }
`}/>
}
