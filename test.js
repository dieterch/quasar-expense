const datum = '29.11.2024'
const ds = datum.split('.')
const ddate = new Date(parseInt(ds[2]), parseInt(ds[1]), parseInt([0]))
console.log(datum, ds, ddate)
