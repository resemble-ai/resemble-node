const error = require('./util').error
const fetch = require('node-fetch')
const FormData = require('form-data')

module.exports = context => {
  const all = async (voiceUuid, page, pageSize) => {
    try {
      const response = await context.get(`voices/${voiceUuid}/recordings?page=${page}${pageSize ? `&page_size=${pageSize}` : ''}`)
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

  const get = async (voiceUuid, uuid) => {
    try {
      const response = await context.get(`voices/${voiceUuid}/recordings/${uuid}`)
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
  
  const create = async (voiceUuid, recordingInput, buffer, fileSizeInBytes) => {
    try {
      const formData = new FormData()
      formData.append('name', recordingInput.name)
      formData.append('text', recordingInput.text)
      formData.append('emotion', recordingInput.emotion)
      formData.append('is_active', recordingInput.is_active ? 'true' : 'false')
      formData.append('file', buffer, { knownLength: fileSizeInBytes })

      const response = await fetch(context.api(`voices/${voiceUuid}/recordings`, false), {
        method: 'POST',
        headers: {
          Authorization: context.headers().Authorization,
          ...formData.getHeaders()
        },
        body: formData
      })

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

  const update = async (voiceUuid, uuid, recordingInput) => {
    try {
      const response = await context.put(`voices/${voiceUuid}/recordings/${uuid}`, recordingInput)
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

  const destroy = async (voiceUuid, uuid) => {
    try {
      const response = await context.delete(`voices/${voiceUuid}/recordings/${uuid}`)
      const json = response.json()
      return json
    } catch (e) {
      return error(e)
    }
  }

  return {
    all,
    get,
    create,
    delete: destroy,
    update,
  }
}
