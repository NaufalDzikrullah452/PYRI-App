import { WBelongsTo } from './WBelongsTo'
import { WDate } from './WDate'
import { WInfo } from './Winfo'
import { WSelect } from './WSelect'
import { WText } from './WText'
import { WUnknown } from './WUnknown'
import { WSection } from './WSection'
import { WBoolean } from './WBoolean'

export default {
  number: WText,
  string: WText,
  text: WText,
  money: WText,
  multiline: WText,
  date: WDate,
  select: WSelect,
  boolean: WBoolean,
  'belongs-to': WBelongsTo,
  unknown: WUnknown,
  info: WInfo,
  section: WSection,
  decimal: WText,
}
