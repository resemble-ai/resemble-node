import UtilV2, { ErrorResponseV2, PaginationResponseV2 } from './util'

export interface Batch {
  uuid: string
  body: Array<[string, string]>
  voice_uuid: string
  callback_uri?: string
  total_count: number
  completed_count: number
  failed_count: number
  created_at: Date
  updated_at: Date
}

export default {
  all: async (
    projectUuid: string,
    page: number,
    pageSize?: number,
  ): Promise<PaginationResponseV2<Batch> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.get(
        `projects/${projectUuid}/batch?page=${page}${
          pageSize ? `&page_size=${pageSize}` : ''
        }`,
      )
      let json = await response.json()
      if (json.success) {
        json = json.items.map((item: Batch) => ({
          ...item,
          created_at: new Date(item.created_at),
          updated_at: new Date(item.updated_at),
        }))
        json.success = true
      }
      return json
    } catch (error) {
      return UtilV2.errorResponse(error)
    }
  },
  create: async (
    projectUuid: string,
    voiceUuid: string,
    body: string[] | Array<[string, string]>,
    batchInputConfig: {
      callbackUri: string
      precision: 'PCM_32' | 'PCM_16' | 'MULAW'
      sampleRate: 8000 | 16000 | 22050 | 44100
      outputFormat: 'wav' | 'mp3'
    },
  ) => {
    try {
      const options = {
        body: body,
        voice_uuid: voiceUuid,
        sample_rate: batchInputConfig?.sampleRate,
        output_format: batchInputConfig?.outputFormat,
        precision: batchInputConfig?.precision,
      }
      if (batchInputConfig?.callbackUri) {
        options['callback_uri'] = batchInputConfig?.callbackUri
      }
      const response = await UtilV2.post(
        `/projects/${projectUuid}/batch`,
        options,
      )

      let json = await response.json()
      if (json.success) {
        json = {
          ...json,
          created_at: new Date(json.item.created_at),
          updated_at: new Date(json.item.updated_at),
        }
      }
      return json
    } catch (error) {
      return UtilV2.errorResponse(error)
    }
  },
  get: async (projectUuid: string, batchUuid: string) => {
    try {
      const response = await UtilV2.get(
        `projects/${projectUuid}/batch/${batchUuid}`,
      )
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
  delete: async (projectUuid: string, batchUuid: string) => {
    try {
      const response = await UtilV2.delete(
        `projects/${projectUuid}/batch/${batchUuid}`,
      )
      const json = response.json()
      return json
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },
}
