import { concatUint8Arrays } from './util'

export const DEFAULT_BUFFER_SIZE = 4 * 1024
export const STREAMING_WAV_HEADER_BUFFER_LEN = 36

export const StreamDecoder = function (
  bufferSize = DEFAULT_BUFFER_SIZE,
  ignoreWavHeader = true,
  timeStampsProcessingRequired = false,
) {
  if (bufferSize < 2) throw new Error('Buffer size cannot be less than 2')
  if (bufferSize % 2 !== 0)
    throw new Error('Buffer size must be evenly divisible by 2.')
  this.bufferSize = bufferSize
  this.ignoreWavHeader = ignoreWavHeader
  this.chunks = []
  this.headerBuffer = new Uint8Array()

  this.processTimeStamps = timeStampsProcessingRequired
  this.timeStampsBuffer = []
  this.allTimestampsProcessed = false
  this.timeStamps = {}
}

StreamDecoder.prototype.setBufferSize = function (size) {
  if (size < 2) throw new Error('Buffer size cannot be less than 2')
  if (size % 2 !== 0)
    throw new Error('Buffer size must be evenly divisible by 2.')
  this.bufferSize = size
}

StreamDecoder.prototype.setIgnoreWavHeader = function (val) {
  this.ignoreWavHeader = val
}

StreamDecoder.prototype.decodeChunk = function (chunk: Uint8Array) {
  // 1. assume user wants headers. no timestamps have been requested, we can store the chunks as they come
  this.chunks.push(chunk)

  // 2. user does not need headers and timestamps are also not present, so we ignore the 36 bytes (wav header size) and return the rest
  if (
    this.headerBuffer.length < STREAMING_WAV_HEADER_BUFFER_LEN && // check if header has been processed
    this.ignoreWavHeader && // Check if header should be ignored
    !this.processTimeStamps
  ) {
    const tempBuf = concatUint8Arrays(this.chunks)
    if (tempBuf.length >= STREAMING_WAV_HEADER_BUFFER_LEN) {
      this.headerBuffer = tempBuf.slice(0, STREAMING_WAV_HEADER_BUFFER_LEN) // Extract header, for next set of chunks to ignore
      const tempDataBuffer = tempBuf.slice(STREAMING_WAV_HEADER_BUFFER_LEN) // Extract data

      this.chunks = []
      this.chunks.push(tempDataBuffer) // set the chunks with the data
    }
  }

  // timestamps are present, keep storing them untill all timestamps have been processed
  if (this.processTimeStamps && !this.allTimestampsProcessed) {
    this.timeStampsBuffer.push(chunk)
  }

  // 3. user wants timestamps and headers: process the timestamps, preserve the 36 bytes and discard the timestamp bytes
  if (!this.ignoreWavHeader && this.processTimeStamps) {
    if (!this.allTimestampsProcessed) {
      const tempBuf = concatUint8Arrays(this.timeStampsBuffer)

      const obj = this.extractTimestampsFromBuffer(tempBuf)

      // we ran past the buffer length, just preserve the header for now
      if (!obj.timestamps) {
        // no wav headers yet, obtain it:
        if (this.headerBuffer.length < STREAMING_WAV_HEADER_BUFFER_LEN) {
          const tempBuf = concatUint8Arrays(this.chunks)
          if (tempBuf.length >= STREAMING_WAV_HEADER_BUFFER_LEN) {
            this.headerBuffer = tempBuf.slice(
              0,
              STREAMING_WAV_HEADER_BUFFER_LEN,
            )

            this.chunks = []
            this.chunks.push(this.headerBuffer)
          }
        } else {
          // since header exists and we don't have timestamps yet, it means we can reset the chunk to only contain the header
          this.chunks = []
          this.chunks.push(this.headerBuffer)
        }
      }

      // timestamps are present, process them
      if (obj.timestamps && obj.timestamps !== null) {
        if (this.headerBuffer.length < STREAMING_WAV_HEADER_BUFFER_LEN) {
          // header not processed yet, process it and discard the timestamps bytes. also process the data bytes if any in current chunk
          const tempBuf = concatUint8Arrays(this.chunks)
          if (tempBuf.length >= STREAMING_WAV_HEADER_BUFFER_LEN) {
            this.headerBuffer = tempBuf.slice(
              0,
              STREAMING_WAV_HEADER_BUFFER_LEN,
            )

            this.chunks = []
            const tempDataBuffer = tempBuf.slice(obj.offset)
            this.chunks.push(this.headerBuffer)
            this.chunks.push(tempDataBuffer)
          }
        } else {
          // header has already been processed, discard the timestamps bytes and preserve wav header and the data bytes if any
          const tempBuf = concatUint8Arrays(this.timeStampsBuffer)
          const tempDataBuffer = tempBuf.slice(obj.offset)

          this.chunks = []
          this.chunks.push(this.headerBuffer)
          this.chunks.push(tempDataBuffer)
        }

        // mark all timestamps as processed
        this.timeStamps = obj.timestamps
        this.allTimestampsProcessed = true
        this.timeStampsBuffer = []
      }
    }
  }

  // 4. timestamps are present and have been requested but no headers are wanted
  if (this.ignoreWavHeader && this.processTimeStamps) {
    if (!this.allTimestampsProcessed) {
      const tempBuf = concatUint8Arrays(this.timeStampsBuffer)
      const obj = this.extractTimestampsFromBuffer(tempBuf)

      if (!obj.timestamps && obj.offset) {
        // we haven't reached the data section yet, discard evrything
        this.chunks = []
      }

      if (obj.timestamps && obj.timestamps !== null) {
        this.timeStamps = obj.timestamps
        this.allTimestampsProcessed = true
        const tempBuf = concatUint8Arrays(this.timeStampsBuffer)
        const tempDataBuffer = tempBuf.slice(obj.offset)
        this.chunks = []
        this.chunks.push(tempDataBuffer)
      }
    }
  }
}

StreamDecoder.prototype.flushBuffer = function (force = false) {
  const tempBuf = concatUint8Arrays(this.chunks)
  if (force && tempBuf.length > 0) {
    this.chunks = []
    return tempBuf
  }
  if (tempBuf.length >= this.bufferSize) {
    const returnBuffer = tempBuf.slice(0, this.bufferSize)
    const leftoverBuffer = tempBuf.slice(this.bufferSize)
    this.chunks = []
    this.chunks.push(leftoverBuffer)
    return returnBuffer
  }
  return null
}

StreamDecoder.prototype.reset = function () {
  this.chunks = []
  this.headerBuffer = new Uint8Array()
}

StreamDecoder.prototype.getTimestamps = function () {
  if (this.processTimeStamps && this.allTimestampsProcessed) {
    return this.timeStamps
  }
  return null
}

StreamDecoder.prototype.extractTimestampsFromBuffer = function (
  buffer: Uint8Array,
) {
  let offset = 0
  offset += 4 // Skip RIFF ID

  offset += 4 // skip remaining file size
  offset += 14 // skp RIFF type (WAVE), format chunk id, chunk data size, and compression code

  const dataView = new DataView(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength,
  )

  let [nChannels, sampleRate] = [
    dataView.getUint16(offset, true), // read number of channels
    dataView.getUint32(offset + 2, true), // and sample rate
  ]
  offset += 14 // skip byte rate, block align and bits per sample at this point we have covered the Header & Format chunks: https://docs.app.resemble.ai/docs/resource_clip/stream#header--format-chunks

  const textDecoder = new TextDecoder('ascii')

  let chunkType = textDecoder.decode(
    new Uint8Array(buffer.buffer, buffer.byteOffset + offset, 4),
  ) // now we are at Timestamps (cue, list & ltxt chunks): https://docs.app.resemble.ai/docs/resource_clip/stream#timestamps-cue-list--ltxt-chunks

  offset += 4
  const timestamps = {
    graph_chars: [],
    graph_times: [],
    phon_chars: [],
    phon_times: [],
  }

  if (chunkType === 'cue ') {
    let [remSize, nCuePoints] = [
      dataView.getUint32(offset, true), // Remaining size of the cue chunk
      dataView.getUint32(offset + 4, true), // Number of remaining cue points
    ]
    offset += 8 // skip to the first cue point
    let endPoint = offset + remSize - 4 // we subtract 4 to account for the "n_cue_points" field size

    let cuePoints = {}

    // start from the first cue point and read all cue points
    // each cue point is 24 bytes long

    if (endPoint > buffer.length) {
      return { timestamps: null, offset }
    }
    for (let cp = 1; cp <= nCuePoints; cp++) {
      const idx = dataView.getUint32(offset, true)
      const cuePoint = dataView.getUint32(offset + 20, true)
      cuePoints[idx] = cuePoint
      offset += 24
    }

    // now the offset is at the beginning of the LIST chunk, remember we are processing in the little-endian order
    chunkType = textDecoder.decode(
      new Uint8Array(buffer.buffer, buffer.byteOffset + offset, 4),
    ) // read the LIST chunk type
    remSize = dataView.getUint32(offset + 4, true)
    offset += 12 // arrive at the start of first LTXT chunk

    let listEndPoint = offset + remSize - 4 // we subtract 4 to account for the "rem size" field

    if (listEndPoint > buffer.length) {
      return { timestamps: null, offset }
    }

    // start from the first LTXT chunk and read all LTXT chunks
    while (offset < listEndPoint) {
      const subChunkSize = dataView.getUint32(offset + 4, true) // Remaining size of this ltxt chunk after this read
      const cueIdx = dataView.getUint32(offset + 8, true)
      const nSamples = dataView.getUint32(offset + 12, true)
      let charTypeRaw = textDecoder.decode(
        new Uint8Array(buffer.buffer, buffer.byteOffset + offset + 16, 4),
      ) // "grph" OR "phon"
      let charType = charTypeRaw.trim()

      offset += 28

      const textLen = subChunkSize - 20
      const utf8Decoder = new TextDecoder('utf-8')
      const text = utf8Decoder.decode(
        new Uint8Array(buffer.buffer, buffer.byteOffset + offset, textLen - 1),
      ) // -1 to remove the null character at the end

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
      offset,
    }
  } else {
    return {
      timestamps: null,
    }
  }
}
