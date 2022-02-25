import { ReadStream } from "fs"

declare module '@resemble/node' {
  interface APIOptions {
    baseUrl?: string
    synServerUrl?: string
  }

  export default interface ResembleAPI {
    new (version: 'v1', apiToken: string, options?: Version1.Options): Version1.API
    new (version: 'v2', apiToken: string, options?: Version2.Options): Version2.API
    new (version: string, apiToken: string, options?: APIOptions): ResembleAPI
  }
  
  namespace Version1 {
    type URL = string
    type UUID = string

    interface ProjectInput {
      name: string
      description: string
      public: boolean
      collaboration: boolean
    }
    
    interface ClipInput {
      title: string
      body: string
      voice: string
      author?: string
      public?: boolean
      emotion?: string
    }
  
    type VoiceContentType = 'audio/x-wav'
    
    interface VoiceInput {
      filename: string
      byte_size: number
      checksum: string
      ['content-type']: VoiceContentType
      name: string
    }
    
    type ISODate = string
  
    interface Project {
      id: number
      uuid: UUID
      name: string
      description: string
    }
    
    interface Clip {
      id: number
      title: string
      body: string
      published: ISODate
      author: string
      finished: boolean
      link: string
      voice: string
      project_id: number
    }
  
    interface Pagination {
      current_page: number
      page_count: number
    }

    interface ClipPagination extends Pagination {
      pods: Clip[]
    }
    
    type Quality = 'x-high' | 'high' | 'medium' | 'low'
    
    interface UploadDestination {
      url: string
      headers: {
        'Content-Type': string
        'Content-MD5': string
      }
    }
    
    interface Voice {
      name: string
      language: 'en-US'
      id: number
      uuid: UUID
    }
    
    interface ProjectsAPI {
      all: () => Promise<Project[]>
      get: (uuid: UUID) => Promise<Project>
      create: (project: ProjectInput) => Promise<{ status: 'OK', id: number, uuid: string }>
      delete: (uuid: UUID) => Promise<{ status: 'OK' }>
    }
    
    interface ClipsAPI {
      all: (projectUuid: UUID, page: number) => Promise<ClipPagination>
      get: (projectUuid: UUID, clipUuid: UUID) => Promise<Clip>
      createSync: (projectUuid: UUID, clip: ClipInput, quality?: Quality, raw?: boolean) => Promise<URL>
      createAsync: (projectUuid: UUID, clip: ClipInput, callbackUrl: string) => Promise<{ status: 'OK', id: string, project_id: string}>
    }
    
    interface VoicesAPI {
      all: () => Promise<Voice[]>
      create: (voice: VoiceInput, file: File) => Promise<{ status: 'OK', voice: UUID }>
    }

    /*
      * API v1 interface
      */
      
    interface API extends ResembleAPI {
      projects: ProjectsAPI
      clips: ClipsAPI
      voices: VoicesAPI
      version: 'v1'
    }

    interface Options extends APIOptions { 
      /* no special options for v1 */
    }
  }

  namespace Version2 {

    //
    // Response Types
    //
    
    interface ReadResponse<T> {
      success: boolean
      message?: string
      item: T | null
    }

    interface WriteResponse<T> {
      success: boolean
      message?: string
      /* The item is returned when the write operation succeeds */
      item?: T
    }
    
    interface UpdateResponse<T> {
      success: boolean
      message?: string
      /* The item is returned when the update operation succeeds */
      item?: T
    }

    interface DeleteResponse {
      success: boolean
      message?: string
    }
    
    interface PaginationResponse<T> {
      success: boolean,
      message?: string,
      page: number,
      num_pages: number,
      page_size: number,
      items: T[]
    }

    //
    // Entities
    //

    interface Project {
      uuid: string
      name: string
      description: string
      is_public: boolean
      is_collaborative: boolean
      is_archived: boolean
      created_at: Date
      updated_at: Date
    }

    interface Recording {
      uuid: string
      name: string
      text: string
      emotion: string
      is_active: boolean
      audio_src: string
      created_at: Date
      updated_at: Date
    }
    
    interface Voice {
      uuid: string
      name: string
      status: string
      default_language: string
      supported_languages: string[]
      created_at: Date
      updated_at: Date
    }

    interface Clip {
      uuid: string
      title: string
      body: string
      voice_uuid: string
      is_public: boolean
      is_archived: boolean
      timestamps?: Timestamps
      audio_src?: string
      raw_audio?: any
      created_at: Date
      updated_at: Date
    }

    type Timestamps = {
      phonemes: string
      end_times: number[]
      phoneme_chars: string[]
    }

    //
    // Request Types
    //

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
    
    interface SyncClipInput extends ClipInput {
      raw?: boolean
    }
    
    interface AsyncClipInput extends ClipInput {
      callback_uri: string
    }

    interface StreamInput {
      data: string
      project_uuid: string
      voice_uuid: string
    }

    interface ProjectInput {
      name: string
      description: string
      is_public: boolean
      is_collaborative: boolean
      is_archived: boolean
    }

    interface RecordingInput {
      name: string
      text: string
      emotion: string
      is_active: boolean
    }

    interface VoiceInput {
      name: string
      dataset_url?: string
      callback_uri?: string
    }

    //
    // API Definition
    //

    interface ProjectsAPI {
      all: (page: number, pageSize?: number) => Promise<PaginationResponse<Project>>
      get: (uuid: string) => Promise<ReadResponse<Project>>
      create: (project: ProjectInput) => Promise<WriteResponse<Project>>
      update: (uuid: string, project: ProjectInput) => Promise<UpdateResponse<Project>>
      delete: (uuid: string) => Promise<DeleteResponse>
    }

    interface ClipsAPI {
      all: (projectUuid: string, page: number, pageSize?: number) => Promise<PaginationResponse<Clip>>
      get: (projectUuid: string, uuid: string) => Promise<ReadResponse<Clip>>
      createAsync: (projectUuid: string, clip: AsyncClipInput) => Promise<WriteResponse<Clip>>
      createSync: (projectUuid: string, clip: SyncClipInput) => Promise<WriteResponse<Clip>>
      updateAsync: (projectUuid: string, uuid: string, clip: AsyncClipInput) => Promise<UpdateResponse<Clip>>
      stream: (streamInput: StreamInput, bufferSize?: number, ignoreWavHeader?: boolean) => Generator<Buffer, undefined, undefined>
      delete: (projectUuid: string, uuid: string) => Promise<DeleteResponse>
    }

    interface RecordingsAPI {
      all: (voiceUuid: string, page: number, pageSize?: number) => Promise<PaginationResponse<Recording>>
      get: (voiceUuid: string, uuid: string) => Promise<ReadResponse<Recording>>
      // @param recordingFile     Example: fs.readFileSync('sample_audio.wav');
      create: (voiceUuid: string, recording: RecordingInput, recordingFile: ReadStream, fileSizeInBytes: number) => Promise<WriteResponse<Recording>>
      update: (voiceUuid: string, uuid: string, recording: RecordingInput) => Promise<WriteResponse<Recording>>
      delete: (voiceUuid: string, uuid: string) => Promise<DeleteResponse>
    }

    interface VoicesAPI {
      all: (page: number, pageSize?: number) => Promise<PaginationResponse<Voice>>
      get: (uuid: string) => Promise<ReadResponse<Voice>>
      create: (voice: VoiceInput) => Promise<WriteResponse<Voice>>
      update: (uuid: string, voice: VoiceInput) => Promise<UpdateResponse<Voice>>
      delete: (uuid: string) => Promise<DeleteResponse>
      build: (uuid: string) => Promise<{ success: boolean, message?: string }>
    }
    
    interface API extends ResembleAPI {
      projects: ProjectsAPI
      recordings: RecordingsAPI
      voices: VoicesAPI
      clips: ClipsAPI
    }

    interface Options extends APIOptions {
      /* no special options for v2 */
    }
  }
}
