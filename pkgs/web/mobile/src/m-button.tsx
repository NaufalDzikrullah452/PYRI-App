/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { Button } from 'framework7-react'

export default (rawprops: Parameters<typeof Button>[0]) => {
  return <Button {...rawprops} />
}
