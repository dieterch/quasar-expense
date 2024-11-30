const parseDateToIso = ( datestring ) => {
  const [day, month, year ] = datestring.split('.').map(Number)
  return new Date(Date.UTC(year, month-1, day)).toISOString()
}

const datestring = '29.11.2024'
const ddate = parseDateToIso(datestring)
console.log(ddate)
