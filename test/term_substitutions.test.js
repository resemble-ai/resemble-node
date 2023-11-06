require('dotenv').config()
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
  // create a term substitution
  const res = await Resemble.v2.termSubstitutions.create('hello', 'ello')
  expect(res.success).toEqual(true)
  expect(res.item).toBeDefined()
  expect(res.item.original_text).toBeString()
  expect(res.item.replacement_text).toBeString()

  // get all term substitutions
  const res2 = await Resemble.v2.termSubstitutions.all(1)
  expect(res2.success).toEqual(true)
  expect(res2.items).toBeArray()
  expect(res2.items.length).toBeGreaterThan(0)

  // delete term substitution
  const res3 = await Resemble.v2.termSubstitutions.delete(res.item.uuid)
  expect(res3.success).toEqual(true)
})
