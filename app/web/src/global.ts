import { format as formatFNS, parseISO } from 'date-fns'
const md5 = require('md5');

const dateFormat = (
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

const encrypt =(value) =>{
    return md5(value)
}

export const globalVar = {
    dateFormat,
    encrypt
}