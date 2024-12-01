// de-AT dateformat => UTC ISOString
// 15.10.2024 => "2024-10-15T00:00:00.000Z"
export const parseDateToIso = ( datestring ) => {
  const [day, month, year ] = datestring.split('.').map(Number)
  const retval =  new Date(Date.UTC(year, month-1, day)).toISOString()
  return retval
}

export const htmlDialogContent = ( icon, color, text ) =>  {
  return `<i class="mdi ${ icon }" style="font-size: 1.5em; color: ${color};"></i>` +
   `&nbsp&nbsp&nbsp<span style="font-size: 1.4em;">${ text }</span><br>`
}

function wrapCsvValue (val, formatFn, row) {
  let formatted = formatFn !== void 0
    ? formatFn(val, row)
    : val

  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted)

  formatted = formatted.split('"').join('""')
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  return `"${formatted}"`
}

// export to CSV, currently a not tested example from Quasar documentaton.
export const exportTable = (rows, columns) => {
  // naive encoding to csv format
  const content = [columns.map(col => wrapCsvValue(col.label))].concat(
    rows.map(row => columns.map(col => wrapCsvValue(
      typeof col.field === 'function'
        ? col.field(row)
        : row[ col.field === void 0 ? col.name : col.field ],
      col.format,
      row
    )).join(','))
  ).join('\r\n')

  const status = exportFile(
    'table-export.csv',
    content,
    'text/csv'
  )

  if (status !== true) {
    $q.notify({
      message: 'Browser denied file download...',
      color: 'negative',
      icon: 'warning'
    })
  }
}
