const StreamDecoder = require("./StreamDecoder");
const {DEFAULT_BUFFER_SIZE} = require("./StreamDecoder");
const error = require('./util').error

module.exports = context => {
  const all = async (projectUuid, page, pageSize) => {
    try {
      const response = await context.get(`projects/${projectUuid}/clips?page=${page}${pageSize ? `&page_size=${pageSize}` : ''}`)
      const json = await response.json()
      if (json.success) json.items.map(item => ({
        ...item,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at)
      }))
      return json
    } catch (e) {
      return error(e)
    }
  }

  const get = async (projectUuid, uuid) => {
    try {
      const response = await context.get(`projects/${projectUuid}/clips/${uuid}`)
      let json = await response.json()
      if (json.success) {
        json = {
          ...json,
          item: {
            ...json.item,
            created_at: new Date(json.item.created_at),
            updated_at: new Date(json.item.updated_at)
          }
        }
      }
      return json
    } catch (e) {
      return error(e)
    }
  }

  const create = async (projectUuid, clipInput) => {
    try {
      const response = await context.post(`projects/${projectUuid}/clips`, clipInput)
      let json = await response.json()
      if (json.success) {
        json = {
          ...json,
          item: {
            ...json.item,
            created_at: new Date(json.item.created_at),
            updated_at: new Date(json.item.updated_at)
          }
        }
      }
      return json
    } catch (e) {
      return error(e)
    }
  }

  async function* stream(streamInput, bufferSize = DEFAULT_BUFFER_SIZE, ignoreWavHeader = true) {
    try {
      const response = await context.post('stream', streamInput, true)

      // check for error response
      if (!response.ok) {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;
        const error = (data && data.message) || response.status;
        throw Error(error);
      }

      const streamDecoder = new StreamDecoder(bufferSize, ignoreWavHeader)
      streamDecoder.reset()

      // Iterate over the stream and start decoding, and returning data
      for await (const chunk of response.body) {
        streamDecoder.decodeChunk(chunk)
        const buffer = streamDecoder.flushBuffer()
        if (buffer !== null)
          yield buffer
      }

      // Keep draining the buffer until the buffer.length < bufferSize or buffer.length == 0
      let buffer = streamDecoder.flushBuffer()
      while (buffer !== null) {
        const buffToReturn = Buffer.from(buffer)
        buffer = streamDecoder.flushBuffer()
        yield buffToReturn
      }

      // Drain any leftover content in the buffer, buffer.length will always be less than bufferSize here
      buffer = streamDecoder.flushBuffer(true)
      if (buffer !== null)
        yield buffer
    } catch (e) {
      return error(e)
    }
  }

  const update = async (projectUuid, uuid) => {
    try {
      const response = await context.put(`projects/${projectUuid}/clips/${uuid}`, clipInput)
      let json = await response.json()
      if (json.success) {
        json = {
          ...json,
          item: {
            ...json.item,
            created_at: new Date(json.item.created_at),
            updated_at: new Date(json.item.updated_at)
          }
        }
      }
      return json
    } catch (e) {
      return error(e)
    }
  }

  const destroy = async (projectUuid, uuid) => {
    try {
      const response = await context.delete(`projects/${projectUuid}/clips/${uuid}`)
      const json = response.json()
      return json
    } catch (e) {
      return error(e)
    }
  }

  return {
    all,
    get,
    createAsync: create,
    createSync: create,
    stream,
    delete: destroy,
    updateAsync: update,
  }
}
