import fs from 'fs'
import readline from 'readline'
import { promisify } from 'util'
import google, { sheets_v4 } from 'googleapis'
import googleAuth, { OAuth2Client } from 'google-auth-library'

const sheets = new google.sheets_v4.Sheets({})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const riQuestionAsync = promisify(rl.question)

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
const TOKEN_DIR = __dirname + '/..'
const TOKEN_PATH = TOKEN_DIR + '/sheets.googleapis.com-nodejs-quickstart.json'


// const getClient = async () => {
//   const content = await readFileAsync(__dirname + '/../secret.json')
//   const credentials: Secret = JSON.parse(content.toString())

//   // Auth
//   const clientSecret = credentials.installed.client_secret
//   const clientId = credentials.installed.client_id
//   const redirectUrl = credentials.installed.redirect_uris[0]
//   return new OAuth2Client(clientId, clientSecret, redirectUrl)
// }

const getSheetToken = async () => {

  const content = await readFileAsync(__dirname + '/../secret.json')
  const credentials: Secret = JSON.parse(content.toString())

  // Auth
  const clientSecret = credentials.installed.client_secret
  const clientId = credentials.installed.client_id
  const redirectUrl = credentials.installed.redirect_uris[0]
  const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl)

  // Get new token
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })

  console.log('Authorize this app by visiting this url: ', authUrl)

  rl.question('Enter the code from that page here: ', code => {
    rl.close()

    oauth2Client.getToken(code, async (err, token) => {
      if (err) {
        console.log('Error while trying to retrieve access token', err)
        return
      }

      oauth2Client.credentials = token

      try {
        console.log('making dir')
        fs.mkdirSync(__dirname + '/../token')
      } catch (err) {
        if (err.code != 'EXIST') throw err;
      }

      console.log('writing file')
      await writeFileAsync(TOKEN_PATH, JSON.stringify(token))
      console.log('Token stored to ' + TOKEN_PATH)
    })
  })
}

const getSheetDate = async () => {
  const content = await readFileAsync(__dirname + '/../secret.json')
  const credentials: Secret = JSON.parse(content.toString())

  // Auth
  const clientSecret = credentials.installed.client_secret
  const clientId = credentials.installed.client_id
  const redirectUrl = credentials.installed.redirect_uris[0]
  const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl)
  const token = await readFileAsync(TOKEN_PATH)
  oauth2Client.credentials = JSON.parse(token.toString())

  const apiOptions: sheets_v4.Params$Resource$Spreadsheets$Values$Get = {
    auth: oauth2Client,
    spreadsheetId: '1o5IQ8E5BxS4tIYd8mGiSeWgjQlaRTOh1UJ44qwpRR4A',
    range: 'Class Data!A2:E'
  }

  const response = await sheets.spreadsheets.values.get(apiOptions, {})
  console.log(response)
}

getSheetDate()
