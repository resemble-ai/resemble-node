const error = require('./util').error

module.exports = context => {
  const all = async (page, pageSize) => {
    try {
      const response = await context.get(`voices?page=${page}${pageSize ? `&page_size=${pageSize}` : ''}`)
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

  const get = async (uuid) => {
    try {
      const response = await context.get(`voices/${uuid}`)
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
  
  const create = async (voiceInput) => {
    try {
      const response = await context.post('voices', voiceInput)
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

  const update = async (uuid, voiceInput) => {
    try {
      const response = await context.put(`voices/${uuid}`, voiceInput)
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

  const destroy = async (uuid) => {
    try {
      const response = await context.delete(`voices/${uuid}`)
      const json = response.json()
      return json
    } catch (e) {
      return error(e)
    }
  }
  
  const build = async (uuid) => {
    try {
      const response = await context.post(`voices/${uuid}/build`)
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
    build,
    update,
  }
}
