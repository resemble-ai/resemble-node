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
  url: string
  callback_url?: string
  visualize?: boolean
}

export interface AudioDetectionInput extends BaseDetectionInput {
  frame_length?: number
  start_region?: number
  end_region?: number
}

export interface ImageDetectionInput extends BaseDetectionInput {
  pipeline?: string
}

export interface VideoDetectionInput extends BaseDetectionInput {
  frame_length?: number
  start_region?: number
  end_region?: number
  max_video_fps?: number
  max_video_secs?: number
  pipeline?: string
  model_types?: 'image' | 'talking_head'
}

export type DetectionInput =
  | AudioDetectionInput
  | ImageDetectionInput
  | VideoDetectionInput

export default {
  create: async (
    data: DetectionInput,
  ): Promise<WriteResponseV2<Detection> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.post('detect', data)
      return await response.json()
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },

  createSync: async (
    data: DetectionInput,
  ): Promise<WriteResponseV2<Detection> | ErrorResponseV2> => {
    try {
      const { context } = await import('../context')
      const response = await fetch(context.endpoint('v2', 'detect'), {
        method: 'POST',
        headers: {
          ...context.headers(),
          Prefer: 'wait',
        },
        body: JSON.stringify(data),
      })
      return await response.json()
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
