// import { exportFile } from "quasar";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Platform } from 'quasar';
import writeXlsxFile from 'write-excel-file';


export const shareText = async () => {
  try {
    await Share.share({
      title: 'Hello World',
      text: 'This is a test message from my app.',
      dialogTitle: 'Share Message',
    });
  } catch (error) {
    console.error('Error sharing:', error);
  }
};


export const ellipsis = (s, l) => {
  if (String(s).length > l) {
    return String(s).slice(0,l) + ' ...'
  }
  return s
}

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

// function wrapCsvValue (val, formatFn, row) {
//   let formatted = formatFn !== void 0
//     ? formatFn(val, row)
//     : val

//   formatted = formatted === void 0 || formatted === null
//     ? ''
//     : String(formatted)

//   formatted = formatted.split('"').join('""')
//   /**
//    * Excel accepts \n and \r in strings, but some other CSV parsers do not
//    * Uncomment the next two lines to escape new lines
//    */
//   // .split('\n').join('\\n')
//   // .split('\r').join('\\r')

//   return `"${formatted}"`
// }

// // export to CSV, currently a not tested example from Quasar documentaton.
// export const exportTable = (rows, columns) => {
//   console.log('rows',rows)
//   console.log('columns',columns)
//   // naive encoding to csv format
//   const content = [columns.map(col => wrapCsvValue(col.label))].concat(
//     rows.map(row => columns.map(col => wrapCsvValue(
//       typeof col.field === 'function'
//         ? col.field(row)
//         : row[ col.field === void 0 ? col.name : col.field ],
//       col.format,
//       row
//     )).join(','))
//   ).join('\r\n')

//   const status = exportFile(
//     'table-export.csv',
//     content,
//     'text/csv'
//   )

//   if (status !== true) {
//     $q.notify({
//       message: 'Browser denied file download...',
//       color: 'negative',
//       icon: 'warning'
//     })
//   }
// }

//   id          String   @id @default(uuid())
//   amount      Float
//   currency    String
//   date        DateTime
//   location    String
//   description String?
//   trip        Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
//   tripId      String
//   user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//   userId      String
//   category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
//   categoryId  String
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt

const schema = [
  {
    column: 'Datum',
    type: Date,
    format: 'dd.mm.yyyy',
    value: rec => rec.date
  },
  {
    column: 'Kategorie',
    type: String,
    value: rec => rec.category,
  },
  {
    column: 'Titel',
    type: String,
    value: rec => rec.description
  },
  {
    column: 'Ausgabe',
    type: Number,
    format: '#,##0.00',
    value: rec => rec.amount
  },
  {
    column: 'Währung',
    type: String,
    value: rec => rec.currency
  },
  {
    column: 'Teilnehmer',
    type: String,
    value: rec => rec.user
  },
  {
    column: 'Reise',
    type: String,
    value: rec => rec.tripname,
  },
]

export const saveToExcelWeb = async( lexpenses, filename) => {

  // design objects array:
  const lobjects = lexpenses.map(rec => ({
    date: new Date(rec.date),
    tripname: rec.trip.name,
    category: rec.category.name,
    description: rec.description,
    amount: rec.amount,
    currency: rec.currency,
    user: rec.user.name,
  }))

  const lfilename = `${filename}.xlsx`
  await writeXlsxFile(lobjects, {
    schema,
    fileName: lfilename  // `${lselectedTrip.value.name}.xlsx`
  })
}

export const saveAndShareExcelFile = async (lexpenses, schema, filename) => {
  try {
    // Transform data to match the schema
    const data = lexpenses.map(rec => ({
      date: new Date(rec.date), // Convert to Date object
      tripname: rec.trip.name,
      category: rec.category.name,
      description: rec.description,
      amount: rec.amount,
      currency: rec.currency,
      user: rec.user.name,
    }));

    console.log('Generating Excel file...');
    const blob = await writeXlsxFile(data, {
      schema,
      fileName: null, // Skip browser download
      writeOptions: { type: 'blob' },
    });

    console.log('Converting Blob to Base64...');
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result.split(',')[1];

      const sanitizedFilename = filename.replace(/\s+/g, '_');
      console.log('Saving file to Documents...');
      const savedFile = await Filesystem.writeFile({
        path: `${sanitizedFilename}.xlsx`,
        data: base64Data,
        directory: Directory.Documents,
      });
      console.log('File saved at:', savedFile.uri);

      const fileUrl = savedFile.uri.startsWith('file://')
        ? savedFile.uri
        : `file://${savedFile.uri}`;
      console.log('Sharing file at URL:', fileUrl);

      await Share.share({
        title: 'Exported File',
        text: 'Here is your file!',
        url: fileUrl,
        dialogTitle: 'Share File',
      });
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error('Error saving and sharing file:', error.message || error);
  }
};

export const saveToExcel = async (lexpenses, filename) => {
  if (Platform.is.cordova || Platform.is.capacitor) {
    // Handle mobile
    await saveAndShareExcelFile(lexpenses, schema, filename);
  } else if (Platform.is.electron) {
    // Handle Electron
    await saveToExcelElectron(lexpenses, filename);
  } else {
    // Default to web
    await saveToExcelWeb(lexpenses, filename);
  }
};
