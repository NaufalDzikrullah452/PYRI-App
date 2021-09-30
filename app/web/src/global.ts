export const globalVar = {}

export const formatSeparatorDec = (value: any, decimal?: number) => {
    if (decimal || decimal === 0) value = Number(value).toFixed(decimal)
    return parseFloat((value || 0).toString().replace(/,/g, ''))
      .toLocaleString('en')
      .replace(/,/gi, ',')
  }