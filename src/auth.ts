import fs from 'fs'
import readline from 'readline'
import { promisify } from 'util'
import { OAuth2Client } from 'google-auth-library'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const riQuestionAsync = promisify(rl.question)

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
const ROOT_DIR = __dirname + '/..'
const TOKEN_PATH = ROOT_DIR + '/token.json'
const SECRET_PATH = ROOT_DIR + '/secret.json'


export const getClientWithCredential = async (): Promise<OAuth2Client> => {
  const secret = await readFileAsync(SECRET_PATH)
  const credentials: Secret = JSON.parse(secret.toString())

  // Auth
  const { client_id, client_secret, redirect_uris } = credentials.installed
  const oauth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0])

  let token
  try {
    token = await readFileAsync(TOKEN_PATH)
  } catch (e) {
    if (e.code !== 'ENOENT') throw e

    await getNewToken(oauth2Client)
    token = await readFileAsync(TOKEN_PATH)
  }

  oauth2Client.setCredentials(JSON.parse(token.toString()))
  return oauth2Client
}


export const getNewToken = async (oauth2Client: OAuth2Client) => {

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

      console.log('writing file')
      await writeFileAsync(TOKEN_PATH, JSON.stringify(token))
      console.log('Token stored to ' + TOKEN_PATH)
    })
  })
}
