import UtilV2, { ErrorResponseV2, PaginationResponseV2, ReadResponseV2, WriteResponseV2 } from "./util"
// import { DEFAULT_BUFFER_SIZE, StreamDecoder } from './StreamDecoder'

export interface Clip {
  uuid: string
  title: string
  body: string
  voice_uuid: string
  is_public: boolean
  is_archived: boolean
  timestamps?: any
  audio_src?: string
  raw_audio?: any
  created_at: Date
  updated_at: Date
}


interface ClipInput {
  title?: string
  body: string
  voice_uuid: string
  is_public: boolean
  is_archived: boolean
  sample_rate?: 16000 | 22050 | 44100
  output_format?: 'wav' | 'mp3'
  precision?: 'PCM_16' | 'PCM_32'
  include_timestamps?: boolean
}

export interface SyncClipInput extends ClipInput {
  raw?: boolean
}

export interface AsyncClipInput extends ClipInput {
  callback_uri: string
}

export interface DirectClipInput {
  voice_uuid: string
  project_uuid: string
  title?: string
  data: string
  precision?: 'MULAW' | 'PCM_16' | 'PCM_24' | 'PCM_32'
  output_format?: 'wav' | 'mp3'
}

export interface DirectClip {
  success: true;
  audio_content: string;
  audio_timestamps: {
    graph_chars: string[];
    graph_times: [number, number][];
    phon_chars: string[];
    phon_times: [number, number][];
  };
  duration: number;
  synth_duration: number;
  output_format: 'wav' | 'mp3';
  sample_rate: number;
  issues: string[];
}

export interface DirectClipError {
  success: false;
  issues?: string[];
  error_name: string;
  error_params: unknown;
  feedback_uuid: string;
  message: string;
}

export interface StreamInput {
  data: string
  project_uuid: string
  voice_uuid: string
}

const create = async (projectUuid: string, clipInput: ClipInput) => {
  try {
    const response = await UtilV2.post(`projects/${projectUuid}/clips`, clipInput)
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
    return UtilV2.errorResponse(e)
  }
}

export default {
  all: async (projectUuid: string, page: number, pageSize: number): Promise<PaginationResponseV2<Clip> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.get(`projects/${projectUuid}/clips?page=${page}${pageSize ? `&page_size=${pageSize}` : ''}`)
      const json = await response.json()
      if (json.success) json.items.map(item => ({
        ...item,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at)
      }))
      return json
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },
  
  get: async (projectUuid: string, uuid: string): Promise<ReadResponseV2<Clip> | ErrorResponseV2> => {
    try {
      const response = await UtilV2.get(`projects/${projectUuid}/clips/${uuid}`)
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
      return UtilV2.errorResponse(e)
    }
  },
  

  
  createAsync: async (projectUuid: string, clipInput: AsyncClipInput): Promise<WriteResponseV2<Clip> | ErrorResponseV2> => {
    return create(projectUuid, clipInput)
  },

  createSync: async (projectUuid: string, clipInput: SyncClipInput): Promise<WriteResponseV2<Clip> | ErrorResponseV2> => {
    return create(projectUuid, clipInput)
  },

  createDirect: async (clipInput: DirectClipInput): Promise<DirectClip | DirectClipError | ErrorResponseV2> => {
    try {
      const response = await UtilV2.post('synthesize', clipInput, true)
      let json = await response.json()
      return json
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  },
  
  // stream: async function* (streamInput, bufferSize = DEFAULT_BUFFER_SIZE, ignoreWavHeader = true): AsyncGenerator {
  //   try {
  //     const response = await UtilV2.post('stream', streamInput, true)
  
  //     // check for error response
  //     if (!response.ok) {
  //       const isJson = response.headers.get('content-type')?.includes('application/json');
  //       const data = isJson ? await response.json() : null;
  //       const error = (data && data.message) || response.status;
  //       throw Error(error);
  //     }
  
  //     const streamDecoder = new StreamDecoder(bufferSize, ignoreWavHeader)
  //     streamDecoder.reset()
  
  //     // Iterate over the stream and start decoding, and returning data
  //     for await (const chunk of response.body!) {
  //       streamDecoder.decodeChunk(chunk)
  //       const buffer = streamDecoder.flushBuffer()
  //       if (buffer !== null)
  //         yield buffer
  //     }
  
  //     // Keep draining the buffer until the buffer.length < bufferSize or buffer.length == 0
  //     let buffer = streamDecoder.flushBuffer()
  //     while (buffer !== null) {
  //       const buffToReturn = Buffer.from(buffer)
  //       buffer = streamDecoder.flushBuffer()
  //       yield buffToReturn
  //     }
  
  //     // Drain any leftover content in the buffer, buffer.length will always be less than bufferSize here
  //     buffer = streamDecoder.flushBuffer(true)
  //     if (buffer !== null)
  //       yield buffer
  //   } catch (e) {
  //     return UtilV2.errorResponse(e)
  //   }
  // }
  
  updateAsync: async (projectUuid: string, uuid: string, clipInput: AsyncClipInput) => {
    try {
      const response = await UtilV2.put(`projects/${projectUuid}/clips/${uuid}`, clipInput)
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
      return UtilV2.errorResponse(e)
    }
  },
  
  destroy: async (projectUuid: string, uuid: string) => {
    try {
      const response = await UtilV2.delete(`projects/${projectUuid}/clips/${uuid}`)
      const json = response.json()
      return json
    } catch (e) {
      return UtilV2.errorResponse(e)
    }
  }
}
