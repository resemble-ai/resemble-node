const DEFAULT_BUFFER_SIZE = 4 * 1024
const STREAMING_WAV_HEADER_BUFFER_LEN = 44

const StreamDecoder = function(bufferSize = DEFAULT_BUFFER_SIZE, ignoreWavHeader = true) {
    if (bufferSize < 2)
        throw new Error('Buffer size cannot be less than 2')
    if (bufferSize % 2 !== 0)
        throw new Error('Buffer size must be evenly divisible by 2.')
    this.bufferSize = bufferSize
    this.ignoreWavHeader = ignoreWavHeader
    this.chunks = []
    this.headerBuffer = Buffer.from('')
}

StreamDecoder.prototype.setBufferSize = function(size) {
    if (size < 2)
        throw new Error('Buffer size cannot be less than 2')
    if (size % 2 !== 0)
        throw new Error('Buffer size must be evenly divisible by 2.')
    this.bufferSize = size
}

StreamDecoder.prototype.setIgnoreWavHeader = function(val) {
    this.ignoreWavHeader = val
}

StreamDecoder.prototype.decodeChunk = function(chunk) {
    this.chunks.push(chunk)
    if (this.headerBuffer.length < STREAMING_WAV_HEADER_BUFFER_LEN && this.ignoreWavHeader) {
        const tempBuf = Buffer.concat(this.chunks)
        if (tempBuf.length >= STREAMING_WAV_HEADER_BUFFER_LEN) {
            this.headerBuffer = tempBuf.slice(0, STREAMING_WAV_HEADER_BUFFER_LEN)
            const tempDataBuffer = tempBuf.slice(STREAMING_WAV_HEADER_BUFFER_LEN)

            this.chunks = []
            this.chunks.push(tempDataBuffer)
        }
    }
}

StreamDecoder.prototype.flushBuffer = function(force = false) {
    const tempBuf = Buffer.concat(this.chunks)
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

StreamDecoder.prototype.reset = function() {
    this.chunks =  []
    this.headerBuffer = Buffer.from('')
}

module.exports = StreamDecoder