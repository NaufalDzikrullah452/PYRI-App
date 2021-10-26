import { WBelongsTo } from './WBelongsTo'
import { WDate } from './WDate'
import { WDateTIme } from './WDateTIme'
import { WInfo } from './Winfo'
import { WSelect } from './WSelect'
import { WText } from './WText'
import { WUnknown } from './WUnknown'
import { WSection } from './WSection'
import { WBoolean } from './WBoolean'
import { WFileUpload } from './WFileUpload'

export default {
  number: WText,
  string: WText,
  text: WText,
  password: WText,
  money: WText,
  multiline: WText,
  date: WDate,
  datetime: WDateTIme,
  select: WSelect,
  boolean: WBoolean,
  'belongs-to': WBelongsTo,
  unknown: WUnknown,
  info: WInfo,
  section: WSection,
  decimal: WText,
  file: WFileUpload
}
