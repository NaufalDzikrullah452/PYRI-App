import dateFormat from 'date-fns/format'
import parseISO from 'date-fns/parseISO'

export const formatDate = (date: string | Date) => {
  if (!date) {
    return ''
  }
  return dateFormat(
    typeof date === 'string' ? parseISO(date) : date,
    'dd MMM yyyy, HH:ii'
  )
}

export const shortFormatDate = (date: string | Date) => {
  if (!date) {
    return ''
  }
  return dateFormat(
    typeof date === 'string' ? parseISO(date) : date,
    'dd MMM yyyy'
  )
}
