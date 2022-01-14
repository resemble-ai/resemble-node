import Resemble, { Version2 } from '@resemble/node'
import {fail, notStrictEqual, ok, strictEqual} from 'assert'
import { TestUtils } from '../../TestUtil'

const ResembleConstructor: Resemble = require('../../..')

describe(`ResembleAPI v2`, () => {
  let resemble: Version2.API

  const clipCreateInput: Version2.ClipInput = {
    title: 'MyClip',
    body: 'Hello!',
    voice_uuid: '',
    is_public: false,
    is_archived: false,
    sample_rate: 22050,
    output_format: 'wav',
    precision: 'PCM_32',
    include_timestamps: true,
  }

  const clipCreateAsyncInput: Version2.AsyncClipInput = {
    ...clipCreateInput,
    callback_uri: 'http://localhost:3000',
  }

  const clipCreateSyncInput: Version2.SyncClipInput = {
    ...clipCreateInput,
    raw: false,
  }

  const clipStreamInput: Version2.StreamInput = {
    data: 'this is a test.',
    project_uuid: '',
    voice_uuid: ''
  }

  beforeEach(() => {
    resemble = new ResembleConstructor('v2', TestUtils.getTestAPIKey(), {
      baseUrl: TestUtils.getTestBaseURL(),
      synServerUrl: TestUtils.getTestSynServerURL()
    })
  })

  it(`constructor must accept an api token and options`, () => {
    // done in beforeEach()
  })

  describe(`Clips`, () => {
    let projectUuid: string
    let voiceUuid: string
    
    before(async () => {
      const response = await resemble.voices.get(TestUtils.getTestVoiceUUID())
      
      strictEqual(response.success, true)
      voiceUuid = response.item.uuid // response.item.uuid

      clipCreateInput.voice_uuid = voiceUuid
      clipCreateAsyncInput.voice_uuid = voiceUuid
      clipCreateSyncInput.voice_uuid = voiceUuid
      clipStreamInput.voice_uuid = voiceUuid
      
      const response2 = await resemble.projects.create({
        name: 'Test Project',
        description: 'Test Description',
        is_archived: false,
        is_collaborative: false,
        is_public: false
      })

      projectUuid = response2.item.uuid
      clipStreamInput.project_uuid = projectUuid
    })

    after(async () => {
      // await resemble.voices.delete(voiceUuid)
      await resemble.projects.delete(projectUuid)
    })
    
    describe(`#all`, () => {
      it(`doesn't throw`, async () => {
        let error = false
        try {
          await resemble.clips.all(projectUuid, 1)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
        }
      })

      it(`returns a paginated array`, async () => {
        let projects = await resemble.clips.all(projectUuid, 1)

        ok(projects.items)
        strictEqual(projects.message, undefined)
        strictEqual(projects.success, true)
        strictEqual(typeof (projects.items), 'object')
        strictEqual(typeof (projects.items.length), 'number')
        strictEqual(typeof projects.num_pages, 'number')
        strictEqual(projects.page, 1)
        strictEqual(typeof projects.page_size, 'number')
      })
    })

    let createdRecordingUUIDs = []
    
    describe(`#createAsync`, () => {
      it(`doesn't throw`, async () => {
        let error = false
        let created: Version2.WriteResponse<Version2.Clip>
        try {
          created = await resemble.clips.createAsync(projectUuid, clipCreateAsyncInput)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
          strictEqual(created.message, undefined)
          strictEqual(created.success, true)
          strictEqual(typeof created.item, 'object')
          createdRecordingUUIDs.push(created.item.uuid)
        }
      })

      it(`creates an async clip with correct properties`, async () => {
        let created: Version2.WriteResponse<Version2.Clip>

        try {
          created = await resemble.clips.createAsync(projectUuid, clipCreateAsyncInput)
        } catch (e) {
          fail(e)
        }
        strictEqual(created.success, true)
        
        strictEqual(typeof created.item.uuid, 'string')
        strictEqual(created.item.title, clipCreateAsyncInput.title)
        strictEqual(created.item.body, clipCreateAsyncInput.body)
        strictEqual(created.item.voice_uuid, clipCreateAsyncInput.voice_uuid)
        strictEqual(created.item.is_public, clipCreateAsyncInput.is_public)
        strictEqual(created.item.is_archived, clipCreateAsyncInput.is_archived)
        ok(created.item.created_at.getTime())
        ok(created.item.updated_at.getTime())
        
        createdRecordingUUIDs.push(created.item.uuid)
      })
    })

    describe(`#createSync`, () => {
      it(`doesn't throw`, async () => {
        let error = false
        let created: Version2.WriteResponse<Version2.Clip>
        try {
          created = await resemble.clips.createSync(projectUuid, clipCreateSyncInput)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
          strictEqual(created.message, undefined)
          strictEqual(created.success, true)
          strictEqual(typeof created.item, 'object')
          createdRecordingUUIDs.push(created.item.uuid)
        }
      })

      it(`creates an async clip with correct properties`, function() {
        this.timeout(30000)

        return new Promise(async (resolve) => {
          let created: Version2.WriteResponse<Version2.Clip>

          try {
            created = await resemble.clips.createSync(projectUuid, clipCreateSyncInput)
          } catch (e) {
            fail(e)
          }
          strictEqual(created.success, true)
          
          strictEqual(typeof created.item.uuid, 'string')
          strictEqual(created.item.title, clipCreateAsyncInput.title)
          strictEqual(created.item.body, clipCreateAsyncInput.body)
          strictEqual(created.item.voice_uuid, clipCreateAsyncInput.voice_uuid)
          strictEqual(created.item.is_public, clipCreateAsyncInput.is_public)
          strictEqual(created.item.is_archived, clipCreateAsyncInput.is_archived)
          strictEqual(!!created.item.timestamps, clipCreateAsyncInput.include_timestamps)
          ok(created.item.created_at.getTime())
          ok(created.item.updated_at.getTime())
          
          createdRecordingUUIDs.push(created.item.uuid)
          resolve(null)
        })
      })
    })

    describe(`#stream`, () => {
      it(`doesn't throw`, async () => {
        let error = false
        try {
          for await (const buff of resemble.clips.stream(clipStreamInput)) {
            notStrictEqual(buff, null)
          }
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
        }
      })
    })

    describe('#delete', () => {
      it(`doesn't throw`, async () => {
        let error = false
        try {
          const created = await resemble.clips.createSync(projectUuid, clipCreateSyncInput)

          await resemble.clips.delete(projectUuid, created.item.uuid)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
        }
      })

      /**
       * NOTE: 
       * - This test may fail if the backend doesn't delete fast enough.
       * - This test may fail if there are more than 100 clips exist in the project.
       */
      it(`deletes clips`, function() {
        this.timeout(10000)

        return new Promise(async resolve => {
          await resemble.clips.createSync(projectUuid, clipCreateSyncInput)
          const clips = await resemble.clips.all(projectUuid, 1, 100)
          strictEqual(clips.items.length > 0, true)
  
          clips.items.forEach(async clip => {
            const deleted = await resemble.clips.delete(projectUuid, clip.uuid)
            strictEqual(deleted.message, undefined)
            strictEqual(deleted.success, true)
          })
  
          setTimeout(async () => {
            const clips2 = await resemble.clips.all(projectUuid, 1, 100)
            strictEqual(clips2.message, undefined)
            strictEqual(clips2.success, true)
            strictEqual(clips2.items.length, 0)
            resolve(null)
          }, 1000)
        })
      })
    })

    describe(`#get`, () => {
      it(`doesn't throw`, async () => {
        let error = false
        try {
          const created = await resemble.clips.createAsync(projectUuid, clipCreateAsyncInput)
          const clip = await resemble.clips.get(voiceUuid, created.item.uuid)
          await resemble.clips.delete(voiceUuid, created.item.uuid)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
        }
      })

      it(`returns the clip`, async () => {
        const created = await resemble.clips.createAsync(projectUuid, clipCreateAsyncInput)
        const clip = await resemble.clips.get(projectUuid, created.item.uuid)
        ok(created)
        strictEqual(clip.message, undefined)
        strictEqual(clip.success, true)
        strictEqual(clip.item.uuid, created.item.uuid)
        strictEqual(clip.item.title, created.item.title)
        strictEqual(clip.item.body, created.item.body)
        strictEqual(clip.item.voice_uuid, created.item.voice_uuid)
        strictEqual(clip.item.is_public, created.item.is_public)
        strictEqual(clip.item.is_archived, created.item.is_archived)
        strictEqual(clip.item.timestamps, created.item.timestamps)
        strictEqual(clip.item.audio_src, created.item.audio_src)
        strictEqual(clip.item.raw_audio, created.item.raw_audio)
        strictEqual(clip.item.created_at.getTime(), created.item.created_at.getTime())
        strictEqual(clip.item.updated_at.getTime(), created.item.updated_at.getTime())
        await resemble.clips.delete(voiceUuid, created.item.uuid)
      })
    })
  })
})
