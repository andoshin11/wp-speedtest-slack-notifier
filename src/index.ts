import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import * as auth from './auth'

const getSheetDate = async (auth: OAuth2Client) => {
  const sheets = google.sheets({ version: 'v4', auth })

  sheets.spreadsheets.values.get({
    spreadsheetId: '1o5IQ8E5BxS4tIYd8mGiSeWgjQlaRTOh1UJ44qwpRR4A',
    range: 'Index!A2:E'
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err)

    const rows = res.data.values
    if (!rows.length) console.log('No data found.')

    rows.map(row => {
      console.log(`${row[0]}, ${row[4]}`)
    })
  })
}

auth.getClientWithCredential().then(client => getSheetDate(client))
