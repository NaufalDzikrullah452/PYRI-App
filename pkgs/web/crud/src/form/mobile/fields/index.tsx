import { MSection } from './MSection'
import { MInfo } from './Minfo'
import { MUnknown } from './MUnknown'
import { MBelongsTo } from './MBelongsTo'
import { MText } from './MText'
import { MSelect } from './MSelect'
import { MDate } from './MDate'
import { MFile } from './MFile'

export default {
  unknown: MUnknown,
  info: MInfo,
  section: MSection,
  money: MText,
  text: MText,
  number: MText,
  password: MText,
  multiline: MText,
  string: MText,
  select: MSelect,
  date: MDate,
  file: MFile,
  'belongs-to': MBelongsTo,
}
