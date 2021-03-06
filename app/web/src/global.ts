import { format as formatFNS, parseISO } from 'date-fns'
import * as locales from 'date-fns/locale';
import add  from 'date-fns/add'
import compareAsc  from 'date-fns/compareAsc'
import getMonth  from 'date-fns/getMonth'
const md5 = require('md5');
var validator = require('validator');
var passwordValidator = require('password-validator');


export const dateAdd = (date, duration) =>{
  return add (date, duration)
}
export const dateCompare = (dateLeft, dateRight) =>{
  return compareAsc(dateLeft, dateRight)
}
export const _getMonth = (date) =>{
  return getMonth(date)
}

export const formatSeparatorDec = (value: any, decimal?: number) => {
  if (decimal || decimal === 0) value = Number(value).toFixed(decimal)
  return parseFloat((value || 0).toString().replace(/,/g, ''))
    .toLocaleString('en')
    .replace(/,/gi, ',')
}

export const dateFormat = (
  value: any,
  format?: string,
  locale: string = 'id'
) => {
  const inputFormat = format ? format : 'dd MMM yyyy - HH:mm'
  try {
    if (typeof value === 'string') {
      return formatFNS(parseISO(value), inputFormat, {
        locale: (locales as any)[locale],
      })
    } else {
      return formatFNS(value, inputFormat, {
        locale: (locales as any)[locale],
      })
    }
  } catch (e) {
    return ''
  }
}

export const encrypt = (value) => {
  return md5(value)
}
export const validateEmail = (value) => {
  return validator.isEmail(value);
}
export const validateDate = (value) => {
  var validate = validator({ format: 'yyyy-mm-dd' });
  return validate(value);
}

export const validatePass = (value) => {
  // Create a schema
  var schema = new passwordValidator();
  schema
    .is().min(8)                                    // Minimum length 8
    .is().max(16)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                            // Must have at least 2 digits
    .has().not().spaces();                           // Should not have spaces

  return schema.validate(value);
}
export const _FormData = () => {
  return new FormData();
}

export const globalVar = {
  dateFormat,
  encrypt,
  validateEmail,
  validatePass,
  validateDate,
  _FormData,
}
