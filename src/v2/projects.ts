import UtilV2, {
  DeleteResponseV2,
  ErrorResponseV2,
  PaginationResponseV2,
  ReadResponseV2,
  UpdateResponseV2,
  WriteResponseV2,
} from './util'

export interface Project {
  uuid: string
  name: string
  description: string
  is_public: boolean
  is_collaborative: boolean
  is_archived: boolean
  created_at: Date
  updated_at: Date
}

export interface ProjectInput {
  name: string
  description: string
  is_public: boolean
  is_collaborative: boolean
  is_archived: boolean
}

export default {
  all: async (
    page: number,
    pageSize?: number,
  ): Promise<PaginationResponseV2<Project> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.get(
        `projects?page=${page}${pageSize ? `&page_size=${pageSize}` : ''}`,
      )
      const json = await response.json()
      if (json.success)
        json.items.map((item) => ({
          ...item,
          created_at: new Date(item.created_at),
          updated_at: new Date(item.updated_at),
        }))
      return json
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },

  get: async (
    uuid: string,
  ): Promise<ReadResponseV2<Project> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.get(`projects/${uuid}`)
      let json = await response.json()
      if (json.success) {
        json = {
          ...json,
          item: {
            ...json.item,
            created_at: new Date(json.item.created_at),
            updated_at: new Date(json.item.updated_at),
          },
        }
      }
      return json
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },

  create: async (
    projectInput: ProjectInput,
  ): Promise<WriteResponseV2<Project> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.post('projects', projectInput)
      let json = await response.json()
      if (json.success) {
        json = {
          ...json,
          item: {
            ...json.item,
            created_at: new Date(json.item.created_at),
            updated_at: new Date(json.item.updated_at),
          },
        }
      }
      return json
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },

  update: async (
    uuid: string,
    projectInput: ProjectInput,
  ): Promise<UpdateResponseV2<Project> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.put(`projects/${uuid}`, projectInput)
      let json = await response.json()
      if (json.success) {
        json = {
          ...json,
          item: {
            ...json.item,
            created_at: new Date(json.item.created_at),
            updated_at: new Date(json.item.updated_at),
          },
        }
      }
      return json
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },

  destroy: async (
    uuid: string,
  ): Promise<DeleteResponseV2 | ErrorResponseV2> => {
    try {
      const response = await UtilV2.delete(`projects/${uuid}`)
      const json = response.json()
      return json
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },
}
