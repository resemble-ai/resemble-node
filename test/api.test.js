require('dotenv').config()
const { Resemble } = require('../dist/resemble.cjs')

jest.setTimeout(30000)

const getTestVoiceUUID = () => {
  if (!process.env.TEST_VOICE_UUID)
    throw 'Invalid voice UUID specified; please set the TEST_VOICE_UUID environment variable'
  return process.env.TEST_VOICE_UUID
}

const getTestBaseURL = () => {
  if (!process.env.TEST_BASE_URL) {
    console.log(
      'Using https://app.resemble.ai/api/ as the base URL, set the TEST_BASE_URL environment variable to change it',
    )
  }
  return process.env.TEST_BASE_URL || 'https://app.resemble.ai/api/'
}

const getTestSynServerURL = () => {
  if (!process.env.TEST_SYN_SERVER_URL)
    throw 'Invalid syn server url specified; please set the TEST_SYN_SERVER_URL environment variable'
  return process.env.TEST_SYN_SERVER_URL
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
  Resemble.setSynthesisUrl(getTestSynServerURL())

  // and just call these to make sure they're set :-)
  getTestCallbackURL()
  getTestVoiceUUID()
})

test('streaming', async () => {
  for await (const chunk of Resemble.v2.clips.stream({
    project_uuid: process.env.TEST_PROJECT_UUID,
    voice_uuid: getTestVoiceUUID(),
    data: 'This is a test',
  })) {
    expect(chunk).not.toBeNull()
  }
})

test('projects', async () => {
  const projects = await Resemble.v2.projects.all(1)
  expect(projects.success).toEqual(true)
  const project = await Resemble.v2.projects.create({
    name: 'SDK Test Project',
    description: 'SDK Test Description',
    is_archived: false,
    is_collaborative: false,
    is_public: false,
  })
  expect(project.success).toEqual(true)
  const updated_project = await Resemble.v2.projects.update(project.item.uuid, {
    name: 'SDK Updated Project Name',
    description: 'SDK Updated Project description',
  })
  expect(updated_project.success).toEqual(true)
  const fetched_project = await Resemble.v2.projects.get(project.item.uuid)
  expect(fetched_project.success).toEqual(true)
  const deleteOp = await Resemble.v2.projects.delete(project.item.uuid)
  expect(deleteOp.success).toEqual(true)
})

test('clips', async () => {
  const project = await Resemble.v2.projects.create({
    name: 'Test Project',
    description: 'Test Description',
    is_archived: false,
    is_collaborative: false,
    is_public: false,
  })
  const projectUuid = project.item.uuid

  const clips = await Resemble.v2.clips.all(projectUuid, 1, 10)
  expect(clips.success).toEqual(true)
  const syncClip = await Resemble.v2.clips.createSync(projectUuid, {
    voice_uuid: getTestVoiceUUID(),
    body: 'This is a test',
    is_archived: false,
    is_public: false,
  })

  expect(syncClip.success).toEqual(true)
  const asyncClip = await Resemble.v2.clips.createAsync(projectUuid, {
    voice_uuid: getTestVoiceUUID(),
    callback_uri: getTestCallbackURL(),
    body: 'This is a test',
  })
  expect(asyncClip.success).toEqual(true)

  const updateAsyncClip = await Resemble.v2.clips.updateAsync(
    projectUuid,
    syncClip.item.uuid,
    {
      voice_uuid: getTestVoiceUUID(),
      callback_uri: getTestCallbackURL(),
      body: 'This is another test',
    },
  )
  expect(updateAsyncClip.success).toEqual(true)
  const clip = await Resemble.v2.clips.get(projectUuid, syncClip.item.uuid)
  expect(clip.success).toEqual(true)
  const deleteOp = await Resemble.v2.clips.delete(projectUuid, clip.item.uuid)
  expect(deleteOp.success).toEqual(true)

  await Resemble.v2.projects.delete(projectUuid)
})

test('voices', async () => {
  const voices = await Resemble.v2.voices.all(1)
  expect(voices.success).toEqual(true)
  const voice = await Resemble.v2.voices.create({
    name: 'Test Voice',
    consent: 'badb',
  })
  expect(voice.success).toEqual(false)
  const updated_voice = await Resemble.v2.voices.update(voice.item.uuid, {
    name: 'NewVoiceName',
  })
  expect(updated_voice.success).toEqual(true)
  const fetched_voice = await Resemble.v2.voices.get(voice.item.uuid)
  expect(fetched_voice.success).toEqual(true)
  const deleteOp = await Resemble.v2.voices.delete(voice.item.uuid)
  expect(deleteOp.success).toEqual(true)
})

test('recordings', async () => {
  const voice = await Resemble.v2.voices.create({ name: 'Test Voice' })
  const voiceUuid = voice.item.uuid

  const recordings = await Resemble.v2.recordings.all(voiceUuid, 1)
  expect(recordings.success).toEqual(true)
  const fs = require('fs')
  const resolve = require('path').resolve
  const stream = fs.createReadStream(resolve(__dirname, 'sample_audio.wav'))
  const size = fs.statSync(resolve(__dirname, 'sample_audio.wav')).size
  const recording = await Resemble.v2.recordings.create(
    voiceUuid,
    {
      name: 'Test recording',
      text: 'transcription',
      is_active: true,
      emotion: 'neutral',
    },
    stream,
    size,
  )
  expect(recording.success).toEqual(true)
  const updatedRecording = await Resemble.v2.recordings.update(
    voiceUuid,
    recording.item.uuid,
    {
      name: 'New name',
      text: 'new transcription',
      is_active: true,
      emotion: 'neutral',
    },
  )
  expect(updatedRecording.success).toEqual(true)
  const fetchedRecording = await Resemble.v2.recordings.get(
    voiceUuid,
    recording.item.uuid,
  )
  expect(fetchedRecording.success).toEqual(true)
  const deleteOp = await Resemble.v2.recordings.delete(
    voiceUuid,
    recording.item.uuid,
  )
  expect(deleteOp.success).toEqual(true)
})
