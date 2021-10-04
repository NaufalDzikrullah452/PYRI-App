import { format as formatFNS, parseISO } from 'date-fns'
export const globalVar = {}

export const dateFormat = (
    value: any,
    format?: string,
    

) => {
    const inputFormat = format ? format : 'dd mmmm yyyy - HH:mm'
    try{
        if(typeof value === 'string'){
            return formatFNS(parseISO(value), inputFormat)
        } else {
            return formatFNS(value, inputFormat)
        }
    } catch (e) {
        return ''
    }
}

