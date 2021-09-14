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
    delete: destroy,
    update,
  }
}
