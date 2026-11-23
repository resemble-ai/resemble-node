// Offline checks of the multipart requests the SDK sends. Needs a build
// (`npm run build`) but no API key: requests go to a local HTTP server.
const fs = require('fs')
const http = require('http')
const path = require('path')
const { Resemble } = require('../dist/resemble.cjs')

const SAMPLE = path.resolve(__dirname, 'sample_audio.wav')

let server
let requests

beforeAll(async () => {
  server = http.createServer((req, res) => {
    let body = ''
    req.setEncoding('latin1')
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      requests.push({ rawHeaders: req.rawHeaders, body })
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ success: false, message: 'stub' }))
    })
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  Resemble.setBaseUrl(`http://127.0.0.1:${server.address().port}/api/`)
  Resemble.setApiKey('test-key')
})

afterAll(() => new Promise((resolve) => server.close(resolve)))

beforeEach(() => {
  requests = []
})

// Every Content-Type header line exactly as sent, before any proxy joins them.
const contentTypes = ({ rawHeaders }) =>
  rawHeaders.filter(
    (value, i) =>
      i % 2 === 1 && rawHeaders[i - 1].toLowerCase() === 'content-type',
  )

const expectSingleMultipartContentType = (request) => {
  const values = contentTypes(request)
  expect(values).toHaveLength(1)
  expect(values[0]).toMatch(/^multipart\/form-data; boundary=\S+$/)
}

const recordingInput = {
  name: 'Test recording',
  text: 'transcription',
  emotion: 'neutral',
  is_active: true,
}

test('recordings.create sends one Content-Type and names a stream upload after its file', async () => {
  await Resemble.v2.recordings.create(
    'voice-uuid',
    recordingInput,
    fs.createReadStream(SAMPLE),
    fs.statSync(SAMPLE).size,
  )

  expect(requests).toHaveLength(1)
  expectSingleMultipartContentType(requests[0])
  expect(requests[0].body).toContain('name="file"; filename="sample_audio.wav"')
})

test('recordings.create gives a Buffer upload a filename', async () => {
  const buffer = fs.readFileSync(SAMPLE)
  await Resemble.v2.recordings.create(
    'voice-uuid',
    recordingInput,
    buffer,
    buffer.length,
  )

  expect(requests).toHaveLength(1)
  expectSingleMultipartContentType(requests[0])
  expect(requests[0].body).toContain('name="file"; filename="audio"')
})

test('edits.create sends one Content-Type and gives a Buffer upload a filename', async () => {
  const buffer = fs.readFileSync(SAMPLE)
  await Resemble.v2.edits.create(
    {
      original_transcript: 'original',
      target_transcript: 'target',
      voice_uuid: 'voice-uuid',
    },
    buffer,
    buffer.length,
  )

  expect(requests).toHaveLength(1)
  expectSingleMultipartContentType(requests[0])
  expect(requests[0].body).toContain('name="input_audio"; filename="audio"')
})
