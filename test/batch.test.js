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

test('batch', async () => {
  // create a batch
  const res = await Resemble.v2.batch.create(
    getTestProjectUUID(),
    getTestVoiceUUID(),
    ['Content A', 'Content B', 'Content C'],
  )
  expect(res.success).toEqual(true)
  expect(res.item).toBeDefined()

  expect(res.item.body).toBeArrayOfSize(3)
  expect(res.item.body[0]).toBeArrayOfSize(2)
  expect(res.item.voice_uuid).toEqual(getTestVoiceUUID())
  expect(res.item.total_count).toEqual(3)

  // get all batches
  const batches = await Resemble.v2.batch.all(getTestProjectUUID(), 1)
  expect(batches.success).toEqual(true)
  expect(batches.items).toBeArray()
  expect(batches.items.length).toBeGreaterThan(0)

  // get a batch
  const b = await Resemble.v2.batch.get(getTestProjectUUID(), res.item.uuid)
  expect(b.success).toEqual(true)
  expect(b.item).toBeDefined()
  expect(b.item.uuid).toEqual(res.item.uuid)

  // delete a batch
  const del = await Resemble.v2.batch.delete(
    getTestProjectUUID(),
    res.item.uuid,
  )
  expect(del.success).toEqual(true)
})
