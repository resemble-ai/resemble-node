require('dotenv').config()
const exp = require('constants')
const { Resemble } = require('../dist/resemble.cjs')

jest.setTimeout(30000)

const getTestVoiceUUID = () => {
  if (!process.env.TEST_VOICE_UUID)
    throw 'Invalid voice UUID specified; please set the TEST_VOICE_UUID environment variable'
  return process.env.TEST_VOICE_UUID
}

const getTestProjectUUID = () => {
  if (!process.env.TEST_PROJECT_UUID)
    throw 'Invalid voice UUID specified; please set the TEST_VOICE_UUID environment variable'
  return process.env.TEST_PROJECT_UUID
}

const getTestBaseURL = () => {
  if (!process.env.TEST_BASE_URL) {
    console.log(
      'Using https://app.resemble.ai/api/ as the base URL, set the TEST_BASE_URL environment variable to change it',
    )
  }
  return process.env.TEST_BASE_URL || 'https://app.resemble.ai/api/'
}

const getTestAPIKey = () => {
  if (!process.env.TEST_API_KEY) {
    throw 'Invalid API key; please specify the TEST_API_KEY environment variable.'
  }
  return process.env.TEST_API_KEY
}

const getTestCallbackURL = () => {
  if (!process.env.TEST_CALLBACK_URL) {
    throw 'Invalid test callback url'
  }
  return process.env.TEST_CALLBACK_URL
}

beforeAll(() => {
  Resemble.setApiKey(getTestAPIKey())
  Resemble.setBaseUrl(getTestBaseURL())

  // and just call these to make sure they're set :-)
  getTestCallbackURL()
  getTestVoiceUUID()
  getTestProjectUUID()
})

test('phoneme', async () => {
  // create a phoneme
  const res = await Resemble.v2.phonemes.create('three', 'θɹiː')
  expect(res.success).toEqual(true)
  expect(res.item).toBeDefined()
  expect(res.item.alphabet).toEqual('ipa')
  expect(res.item.word).toBeString()
  expect(res.item.phonetic_transcription).toBeString()

  // get all phonemes
  const res2 = await Resemble.v2.phonemes.all(1)
  expect(res2.success).toEqual(true)
  expect(res2.items).toBeArray()
  expect(res2.items.length).toBeGreaterThan(0)

  // delete phoneme
  const res3 = await Resemble.v2.phonemes.delete(res.item.uuid)
  expect(res3.success).toEqual(true)
})
