import fetch from 'isomorphic-fetch'
import FormData from 'isomorphic-form-data'
import { context } from '../context'
import UtilV2, {
  ErrorResponseV2,
  PaginationResponseV2,
  UpdateResponseV2,
  DeleteResponseV2,
  ReadResponseV2,
  WriteResponseV2,
} from './util'

export interface Recording {
  uuid: string
  name: string
  text: string
  emotion: string
  is_active: boolean
  audio_src: string
  created_at: Date
  updated_at: Date
}

export interface RecordingInput {
  name: string
  text: string
  emotion: string
  is_active: boolean
}

export default {
  all: async (
    voiceUuid: string,
    page: number,
    pageSize: number,
  ): Promise<PaginationResponseV2<Recording> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.get(
        `voices/${voiceUuid}/recordings?page=${page}${
          pageSize ? `&page_size=${pageSize}` : ''
        }`,
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
    voiceUuid: string,
    uuid: string,
  ): Promise<ReadResponseV2<Recording> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.get(
        `voices/${voiceUuid}/recordings/${uuid}`,
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

  create: async (
    voiceUuid: string,
    recordingInput: RecordingInput,
    buffer: Buffer,
    fileSizeInBytes: number,
  ): Promise<WriteResponseV2<Recording> | ErrorResponseV2> => {
    try {
      const formData = new FormData()
      formData.append('name', recordingInput.name)
      formData.append('text', recordingInput.text)
      formData.append('emotion', recordingInput.emotion)
      formData.append('is_active', recordingInput.is_active ? 'true' : 'false')
      formData.append('file', buffer, { knownLength: fileSizeInBytes })

      const response = await fetch(
        context.endpoint('v2', `voices/${voiceUuid}/recordings`),
        {
          method: 'POST',
          headers: {
            Authorization: context.headers().Authorization,
            'Content-Type': 'multipart/form-data',
            ...(formData.getHeaders ? formData.getHeaders() : {}),
          },
          body: formData,
        },
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

  update: async (
    voiceUuid: string,
    uuid: string,
    recordingInput: RecordingInput,
  ): Promise<UpdateResponseV2<Recording> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.put(
        `voices/${voiceUuid}/recordings/${uuid}`,
        recordingInput,
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

  destroy: async (
    voiceUuid: string,
    uuid: string,
  ): Promise<DeleteResponseV2 | ErrorResponseV2> => {
    try {
      const response = await UtilV2.delete(
        `voices/${voiceUuid}/recordings/${uuid}`,
      )
      const json = response.json()
      return json
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },
}
