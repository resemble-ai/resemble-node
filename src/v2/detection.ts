import * as fs from 'fs'
import * as nodePath from 'path'
import FormData from 'isomorphic-form-data'
import { context } from '../context'
import UtilV2, {
  ErrorResponseV2,
  ReadResponseV2,
  WriteResponseV2,
} from './util'

export interface DetectionMetrics {
  image?: string
  label?: string
  score?: number[]
  certainty?: string
  aggregated_score?: string
}

export interface ImageMetrics {
  type: string
  image: string
  label: string
  score: string
  children: Array<{
    type: string
    label: string
    description: string
  }>
}

export interface VideoMetricsChild {
  type: string
  score: string
  certainty: string
  posterior: string
  conclusion: string
  patch_type?: string
  violations?: any[]
  description?: string
  children?: VideoMetricsChild[]
}

export interface VideoMetrics {
  image: string
  label: string
  score: string
  children: VideoMetricsChild[]
  treeview: string
  certainty: string
  posterior: string
}

export interface Detection {
  uuid: string
  status?: string
  metrics: DetectionMetrics
  created_at: string
  updated_at: string
  media_type: 'audio' | 'image' | 'video'
  duration?: string
  url?: string
  image_metrics?: ImageMetrics
  video_metrics?: VideoMetrics
}

export interface BaseDetectionInput {
  url?: string
  file?: string
  callback_url?: string
  visualize?: boolean
  intelligence?: boolean
  audio_source_tracing?: boolean
  use_ood_detector?: boolean
}

export interface AudioDetectionInput extends BaseDetectionInput {
  frame_length?: number
  start_region?: number
  end_region?: number
}

export interface ImageDetectionInput extends BaseDetectionInput {
  pipeline?:
    | 'facial->object->general'
    | 'object->facial->general'
    | 'general->facial->object'
    | 'facial->general->object'
    | 'object->general->facial'
    | 'general->object->facial'
    | 'general->object'
    | 'object->general'
    | 'general->facial'
    | 'facial->general'
    | 'object->facial'
    | 'facial->object'
    | 'general'
    | 'object'
    | 'facial'
}

export interface VideoDetectionInput extends BaseDetectionInput {
  frame_length?: number
  start_region?: number
  end_region?: number
  max_video_fps?: number
  max_video_secs?: number
  pipeline?:
    | 'facial->object->general'
    | 'object->facial->general'
    | 'general->facial->object'
    | 'facial->general->object'
    | 'object->general->facial'
    | 'general->object->facial'
    | 'general->object'
    | 'object->general'
    | 'general->facial'
    | 'facial->general'
    | 'object->facial'
    | 'facial->object'
    | 'general'
    | 'object'
    | 'facial'
  model_types?: 'image' | 'talking_head'
}

export type DetectionInput =
  | AudioDetectionInput
  | ImageDetectionInput
  | VideoDetectionInput

export interface SecureUploadResponse {
  success: boolean
  token?: string
  message?: string
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const secureUpload = async (
  filePath: string,
): Promise<SecureUploadResponse | ErrorResponseV2> => {
  try {
    const fileBuffer = fs.readFileSync(filePath)
    const fileName = nodePath.basename(filePath)

    const formData = new FormData()
    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: 'application/octet-stream',
      knownLength: fileBuffer.length,
    })

    const response = await fetch(context.endpoint('v2', 'secure_uploads'), {
      method: 'POST',
      headers: {
        Authorization: context.headers().Authorization,
        ...(formData.getHeaders ? formData.getHeaders() : {}),
      },
      body: formData.getBuffer ? formData.getBuffer() : formData,
    })
    if (!response.ok) {
      return {
        success: false,
        message: `Secure upload failed with status ${response.status}`,
      }
    }
    return await response.json()
  } catch (e) {
    return UtilV2.errorResponse(e)
  }
}

const prepareRequestBody = async (
  data: DetectionInput,
): Promise<{ body: Record<string, any> } | ErrorResponseV2> => {
  if (data.url && data.file) {
    return { success: false, message: 'Provide either url or file, not both.' }
  }
  if (!data.url && !data.file) {
    return { success: false, message: 'Provide either url or file.' }
  }

  const { file, ...body } = data as any

  if (file) {
    const uploadResponse = await secureUpload(file)
    if (!uploadResponse.success) {
      return uploadResponse as ErrorResponseV2
    }
    delete body.url
    body.media_token = (uploadResponse as SecureUploadResponse).token
  }

  return { body }
}

const detection = {
  secureUpload,

  create: async (
    data: DetectionInput,
  ): Promise<WriteResponseV2<Detection> | ErrorResponseV2> => {
    try {
      const result = await prepareRequestBody(data)
      if ('success' in result) return result

      const response = await UtilV2.post('detect', result.body)
      return await response.json()
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },

  createSync: async (
    data: DetectionInput,
  ): Promise<WriteResponseV2<Detection> | ErrorResponseV2> => {
    try {
      const result = await prepareRequestBody(data)
      if ('success' in result) return result

      const response = await fetch(context.endpoint('v2', 'detect'), {
        method: 'POST',
        headers: {
          ...context.headers(),
          Prefer: 'wait',
        },
        body: JSON.stringify(result.body),
      })
      return await response.json()
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },

  detectAndGet: async (
    data: DetectionInput,
    retries: number = 10,
    waitTime: number = 3,
  ): Promise<
    WriteResponseV2<Detection> | ReadResponseV2<Detection> | ErrorResponseV2
  > => {
    try {
      const createResponse = await detection.create(data)
      if (!createResponse.success) {
        return createResponse
      }

      const uuid = (createResponse as WriteResponseV2<Detection>).item!.uuid

      for (let i = 0; i < retries; i++) {
        await sleep(waitTime * 1000)

        const getResponse = await detection.get(uuid)
        if (!getResponse.success) {
          return getResponse
        }

        const status = (getResponse as ReadResponseV2<Detection>).item?.status
        if (status === 'completed' || status === 'failed') {
          return getResponse
        }
      }

      return createResponse
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },

  get: async (
    uuid: string,
  ): Promise<ReadResponseV2<Detection> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.get(`detect/${uuid}`)
      return await response.json()
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },
}

export default detection
