import UtilV2, { ErrorResponseV2, PaginationResponseV2 } from './util'

export interface Phoneme {
  uuid: string
  alphabet: string
  word: string
  phonetic_transcription: string
  created_at: Date
  updated_at: Date
}

export interface AllPhonemeResponse {
  success: boolean
  page: number
  num_pages: number
  page_size: number
  items: Phoneme[]
}

export default {
  all: async (
    page: number,
    pageSize?: number,
  ): Promise<PaginationResponseV2<AllPhonemeResponse> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.get(
        `phonemes?page=${page}${pageSize ? `&page_size=${pageSize}` : ''}`,
      )
      let json = await response.json()
      if (json.success) {
        json.items = json.items.map((item: Phoneme) => ({
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
  create: async (word: string, phonetic_transcription: string) => {
    try {
      const response = await UtilV2.post('phonemes', {
        word,
        phonetic_transcription,
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
  get: async (phonemeUuid: string) => {
    try {
      const response = await UtilV2.get(`phonemes/${phonemeUuid}`)
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
  delete: async (phoneme_uuid: string) => {
    try {
      const response = await UtilV2.delete(`phonemes/${phoneme_uuid}`)
      const json = response.json()
      return json
    } catch (error) {
      return UtilV2.errorResponse(error)
    }
  },
}
