const { Resemble } = require('../dist/resemble.cjs')

Resemble.setApiKey('uZsqFBVABrZ5lLNutcIpIgtt')
Resemble.setSynthesisUrl('https://p2.cluster.resemble.ai')

const projectUuid = 'ffb4eae4'
const voiceUuid = '25c7823f'

function extractTimestampsFromFirstChunk(buffer) {
  let offset = 0
  offset += 4 // Skip RIFF ID

  offset += 4 // skip remaining file size
  offset += 14 // skp RIFF type (WAVE), format chunk id, chunk data size, and compression code

  let [nChannels, sampleRate] = [
    buffer.readUInt16LE(offset), // read number of channels
    buffer.readUInt32LE(offset + 2), // and sample rate
  ]
  offset += 14 // skip byte rate, block align and bits per sample at this point we have covered the Header & Format chunks: https://docs.app.resemble.ai/docs/resource_clip/stream#header--format-chunks

  let chunkType = buffer.toString('ascii', offset, offset + 4) // now we are at Timestamps (cue, list & ltxt chunks): https://docs.app.resemble.ai/docs/resource_clip/stream#timestamps-cue-list--ltxt-chunks

  offset += 4
  const timestamps = {
    graph_chars: [],
    graph_times: [],
    phon_chars: [],
    phon_times: [],
  }

  if (chunkType === 'cue ') {
    let [remSize, nCuePoints] = [
      buffer.readUInt32LE(offset), // Remaining size of the cue chunk
      buffer.readUInt32LE(offset + 4), // Number of remaining cue points
    ]
    offset += 8 // skip to the first cue point
    let endPoint = offset + remSize - 4 // we subtract 4 to account for the "n_cue_points" field size

    let cuePoints = {}

    // start from the first cue point and read all cue points
    // each cue point is 24 bytes long

    if (endPoint > buffer.length) {
      return { timestamps: null }
    }
    for (let cp = 1; cp <= nCuePoints; cp++) {
      const idx = buffer.readUInt32LE(offset)
      const cuePoint = buffer.readUInt32LE(offset + 20)
      cuePoints[idx] = cuePoint
      offset += 24
    }

    // now the offset is at the beginning of the LIST chunk, remember we are processing in the little-endian order
    chunkType = buffer.toString('ascii', offset, offset + 4) // read the LIST chunk type
    remSize = buffer.readUInt32LE(offset + 4)
    offset += 12 // arrive at the start of first LTXT chunk

    let listEndPoint = offset + remSize - 4 // we subtract 4 to account for the "rem size" field

    if (listEndPoint > buffer.length) {
      return { timestamps: null }
    }

    // start from the first LTXT chunk and read all LTXT chunks
    while (offset < listEndPoint) {
      const subChunkSize = buffer.readUInt32LE(offset + 4) // Remaining size of this ltxt chunk after this read
      const cueIdx = buffer.readUInt32LE(offset + 8)
      const nSamples = buffer.readUInt32LE(offset + 12)
      let charTypeRaw = buffer.toString('ascii', offset + 16, offset + 20) // "grph" OR "phon"
      let charType = charTypeRaw.trim()

      offset += 28

      const textLen = subChunkSize - 20
      const text = buffer.toString('utf-8', offset, offset + textLen - 1) // -1 to remove the null character at the end

      offset += textLen
      offset += textLen % 2

      const typeMapping = {
        grph: 'graph',
        phon: 'phon',
      }
      let mappedType = typeMapping[charType]

      timestamps[`${mappedType}_chars`].push(text)
      timestamps[`${mappedType}_times`].push([
        cuePoints[cueIdx] / sampleRate,
        (cuePoints[cueIdx] + nSamples) / sampleRate,
      ])
    }

    return {
      timestamps: timestamps,
    }
  } else {
    return {
      timestamps: null,
    }
  }
}

let collectedChunks = []
let foundTimestamps = false
let combinedBuffer

async function f() {
  try {
    for await (const chunk of Resemble.v2.clips.stream(
      {
        data: `By defining the StreamInput interface in your code, you provide a clear and structured way to specify the shape of objects that should be used as input when performing streaming operations. When you use this interface, it helps ensure that objects you pass as input conform to the expected structure, making your code more robust and maintainable through type checking.

        For example, if you have a function that expects a StreamInput object as an argument, you can use TypeScript to enforce that only objects adhering to this interface can be passed to the function. This helps prevent runtime errors and improves code clarityFor example, if you have a function that expects a StreamInput object as an argument, you can use TypeScript to enforce that only objects adhering to this interface can be passed to the function. This helps prevent runtime errors and improves code clarityFor example, if you have a function that expects a StreamInput object as an argument, you can use TypeScript to enforce that only objects adhering to this interface can be passed to the function. This helps prevent runtime errors and improves code clarityFor example, if you have a function that expects a StreamInput object as an argument, you can use TypeScript to enforce that only objects adhering to this interface can be passed to the function. This helps prevent runtime errors and improves code clarity....`,
        project_uuid: projectUuid,
        voice_uuid: voiceUuid,
      },
      2 * 1024,
      false,
      false,
    )) {
      // Collect chunks in buffer until we see "data" chunk

      collectedChunks.push(chunk)
    }
  } catch (e) {
    // Handle errors here
    console.log(e)
  }
}

f()
