import fetch from 'isomorphic-fetch'
import FormData from 'isomorphic-form-data'
import { context } from '../context'
import UtilV2, {
  ErrorResponseV2,
  PaginationResponseV2,
  ReadResponseV2,
  WriteResponseV2,
} from './util'

export interface AudioEdit {
  uuid: string
  voice_uuid: string
  original_transcript: string
  target_transcript: string
  input_audio_url: string
  result_audio_url: string
}

export interface AudioEditInput {
  original_transcript: string
  target_transcript: string
  voice_uuid: string
}

export default {
  all: async (
    page: number,
  ): Promise<PaginationResponseV2<AudioEdit> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.get(`edit?page=${page}`)
      return await response.json()
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },

  get: async (
    audioEditUuid: string,
  ): Promise<ReadResponseV2<AudioEdit> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.get(`edit/${audioEditUuid}`)
      return await response.json()
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },

  create: async (
    audioEditInput: AudioEditInput,
    buffer: Buffer,
    fileSizeInBytes: number,
  ): Promise<WriteResponseV2<AudioEdit> | ErrorResponseV2> => {
    try {
      const formData = new FormData()
      formData.append('original_transcript', audioEditInput.original_transcript)
      formData.append('target_transcript', audioEditInput.target_transcript)
      formData.append('voice_uuid', audioEditInput.voice_uuid)
      formData.append('input_audio', buffer, { knownLength: fileSizeInBytes })

      const response = await fetch(context.endpoint('v2', `edit`), {
        method: 'POST',
        headers: {
          Authorization: context.headers().Authorization,
          'Content-Type': 'multipart/form-data',
          ...(formData.getHeaders ? formData.getHeaders() : {}),
        },
        body: formData,
      })

      return await response.json()
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },
}
