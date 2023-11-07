import UtilV2, { ErrorResponseV2, PaginationResponseV2 } from './util'

export interface TermSubstitution {
  uuid: string
  original_text: string
  replacement_text: string
  created_at: Date
  updated_at: Date
}

export interface AllTermSubstitutionResponse {
  success: boolean
  page: number
  num_pages: number
  page_size: number
  items: TermSubstitution[]
}

export default {
  all: async (
    page: number,
    pageSize?: number,
  ): Promise<
    PaginationResponseV2<AllTermSubstitutionResponse> | ErrorResponseV2
  > => {
    try {
      const response = await UtilV2.get(
        `term_substitutions?page=${page}${
          pageSize ? `&page_size=${pageSize}` : ''
        }`,
      )
      let json = await response.json()
      if (json.success) {
        json.items = json.items.map((item: TermSubstitution) => ({
          ...item,
          created_at: new Date(item.created_at),
          updated_at: new Date(item.updated_at),
        }))
      }
      return json
    } catch (error) {
      return UtilV2.errorResponse(error)
    }
  },
  create: async (original_text: string, replacement_text: string) => {
    try {
      const response = await UtilV2.post('term_substitutions', {
        original_text,
        replacement_text,
      })
      let json = await response.json()
      if (json.success) {
        json.item = {
          ...json.item,
          created_at: new Date(json.item.created_at),
          updated_at: new Date(json.item.updated_at),
        }
      }
      return json
    } catch (error) {
      return UtilV2.errorResponse(error)
    }
  },
  get: async (termSubstitutionUuid: string) => {
    try {
      const response = await UtilV2.get(
        `term_substitutions/${termSubstitutionUuid}`,
      )
      let json = await response.json()
      if (json.success) {
        json.item = {
          ...json.item,
          created_at: new Date(json.item.created_at),
          updated_at: new Date(json.item.updated_at),
        }
      }
      return json
    } catch (error) {
      return UtilV2.errorResponse(error)
    }
  },
  delete: async (termSubstitutionUuid: string) => {
    try {
      const response = await UtilV2.delete(
        `term_substitutions/${termSubstitutionUuid}`,
      )
      const json = response.json()
      return json
    } catch (error) {
      return UtilV2.errorResponse(error)
    }
  },
}
