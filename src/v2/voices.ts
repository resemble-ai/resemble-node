import UtilV2, {
  DeleteResponseV2,
  ErrorResponseV2,
  PaginationResponseV2,
  ReadResponseV2,
  UpdateResponseV2,
  WriteResponseV2,
} from './util'

export interface Voice {
  uuid: string
  name: string
  status: string
  default_language: string
  supported_languages: string[]
  created_at: Date
  updated_at: Date
}

export interface VoiceInput {
  name: string
  dataset_url?: string
  callback_uri?: string
  consent?: string
  sample_url?: boolean
  filters?: boolean
}

export default {
  all: async (
    page: number,
    pageSize: number,
    sample_url?: boolean,
    filters?: boolean,
  ): Promise<PaginationResponseV2<Voice> | ErrorResponseV2> => {
    try {
      let queryParams = `page=${page}`
      if (pageSize) queryParams += `&page_size=${pageSize}`
      if (sample_url === true) queryParams += `&sample_url=true`
      if (filters === true) queryParams += `&filters=true`

      const response = await UtilV2.get(`voices?${queryParams}`)
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
    sample_url?: boolean,
    filters?: boolean,
  ): Promise<ReadResponseV2<Voice> | ErrorResponseV2> => {
    try {
      let queryParams = ''
      if (sample_url === true)
        queryParams += `${queryParams ? '&' : '?'}sample_url=true`
      if (filters === true)
        queryParams += `${queryParams ? '&' : '?'}filters=true`

      const response = await UtilV2.get(`voices/${uuid}${queryParams}`)
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
    voiceInput: VoiceInput,
  ): Promise<WriteResponseV2<Voice> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.post('voices', voiceInput)
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
    voiceInput: VoiceInput,
  ): Promise<UpdateResponseV2<Voice> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.put(`voices/${uuid}`, voiceInput)
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
      const response = await UtilV2.delete(`voices/${uuid}`)
      const json = response.json()
      return json
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },

  build: async (
    uuid: string,
  ): Promise<{ success: boolean; message?: string } | ErrorResponseV2> => {
    try {
      const response = await UtilV2.post(`voices/${uuid}/build`)
      const json = response.json()
      return json
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },
}
