import Resemble, { Version2 } from '@resemble/node'
import { fail, ok, strictEqual } from 'assert'
import { createReadStream, statSync } from 'fs'
import { resolve } from 'path'
import { TestUtils } from '../../TestUtil'

const getSampleAudio = () => createReadStream(resolve(__dirname, '../../sample_audio.wav'))
const getSampleAudioBytes = () => statSync(resolve(__dirname, '../../sample_audio.wav')).size;

const ResembleConstructor: Resemble = require('../../..')

describe(`ResembleAPI v2`, () => {
  let resemble: Version2.API

  const recordingCreateInput: Version2.RecordingInput = {
    emotion: 'neutral',
    is_active: true,
    name: 'recording',
    text: 'This is the transcript for this audio'
  }

  const recordingUpdateInput: Version2.RecordingInput = {
    emotion: 'ntrl',
    is_active: false,
    name: 'rcrdng_updtd',
    text: 'Ths s n udted trnscrt'
  }

  beforeEach(() => {
    resemble = new ResembleConstructor('v2', TestUtils.getTestAPIKey(), {
      baseUrl: TestUtils.getTestBaseURL()
    })
  })

  it(`constructor must accept an api token and options`, () => {
    // done in beforeEach()
  })

  describe(`Recordings`, () => {
    let voiceUuid: string

    before(async () => {
      const response = await resemble.voices.create({name: 'Test voice'})
      ok(response.success)
      voiceUuid = response.item.uuid
      strictEqual(typeof voiceUuid, 'string')
    })

    after(async () => {
      await resemble.voices.delete(voiceUuid)
    })
    
    describe(`#all`, () => {
      it(`doesn't throw`, async () => {
        let error = false
        try {
          await resemble.recordings.all(voiceUuid, 1)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
        }
      })

      it(`returns a paginated array`, async () => {
        let recordings = await resemble.recordings.all(voiceUuid, 1)
        
        ok(recordings.items)
        strictEqual(typeof (recordings.items), 'object')
        strictEqual(typeof (recordings.items.length), 'number')
        strictEqual(recordings.success, true)
        strictEqual(recordings.message, undefined)
        strictEqual(typeof recordings.num_pages, 'number')
        strictEqual(recordings.page, 1)
        strictEqual(typeof recordings.page_size, 'number')
      })
    })

    let createdRecordingUUIDs = []
    
    describe(`#create`, function() {
      it(`doesn't throw`, async () => {
        let error = false
        let created
        try {
          created = await resemble.recordings.create(voiceUuid, recordingCreateInput, getSampleAudio(), getSampleAudioBytes())
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

      it(`creates a recording with correct properties`, function() {
        this.timeout(15000)

        return new Promise(async resolve => {
          let created: Version2.WriteResponse<Version2.Recording>
  
          try {
            created = await resemble.recordings.create(voiceUuid, recordingCreateInput, getSampleAudio(), getSampleAudioBytes())
          } catch (e) {
            fail(e)
          }
          strictEqual(created.message, undefined)
          strictEqual(created.success, true)
          
          strictEqual(typeof created.item.uuid, 'string')
          strictEqual(created.item.name, recordingCreateInput.name)
          strictEqual(created.item.text, recordingCreateInput.text)
          strictEqual(created.item.emotion, recordingCreateInput.emotion)
          strictEqual(created.item.is_active, recordingCreateInput.is_active)
          strictEqual(typeof created.item.audio_src, 'string')
          ok(created.item.created_at.getTime())
          ok(created.item.updated_at.getTime())
          
          createdRecordingUUIDs.push(created.item.uuid)

          resolve(null)
        })
      })
    })

    describe(`#update`, () => {
      it(`doesn't throw`, async () => {
        let error = false
        let updated: Version2.UpdateResponse<Version2.Recording>
        try {
          const created = await resemble.recordings.create(voiceUuid, recordingCreateInput, getSampleAudio(), getSampleAudioBytes())
          createdRecordingUUIDs.push(created.item.uuid)
          
          const uuid = created.item.uuid

          updated = await resemble.recordings.update(voiceUuid, uuid, recordingUpdateInput)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
          strictEqual(updated.message, undefined)
          strictEqual(updated.success, true)
          strictEqual(typeof updated.item, 'object')
        }
      })

      it(`updates a recording with correct properties`, async () => {
        const created = await resemble.recordings.create(voiceUuid, recordingCreateInput, getSampleAudio(), getSampleAudioBytes())
        createdRecordingUUIDs.push(created.item.uuid)

        const uuid = created.item.uuid

        const updated = await resemble.recordings.update(voiceUuid, uuid, recordingUpdateInput)

        strictEqual(updated.message, undefined)
        strictEqual(updated.success, true)
        strictEqual(typeof updated.item.uuid, 'string')
        strictEqual(updated.item.name, recordingUpdateInput.name)
        strictEqual(updated.item.text, recordingUpdateInput.text)
        strictEqual(updated.item.emotion, recordingUpdateInput.emotion)
        strictEqual(updated.item.is_active, recordingUpdateInput.is_active)
        ok(updated.item.created_at.getTime())
        ok(updated.item.updated_at.getTime())
      })
    })

    describe('#delete', () => {
      it(`doesn't throw`, async () => {
        let error = false
        try {
          const created = await resemble.recordings.create(voiceUuid, recordingCreateInput, getSampleAudio(), getSampleAudioBytes())

          await resemble.recordings.delete(voiceUuid, created.item.uuid)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
        }
      })

      /**
       * NOTE: 
       * - This test may fail if the backend doesn't delete fast enough.
       * - This test may fail if there are more than 100 recordings assigned to the user.
       */
      it(`deletes recordings`, async () => {
        await resemble.recordings.create(voiceUuid, recordingCreateInput, getSampleAudio(), getSampleAudioBytes())
        const recordings = await resemble.recordings.all(voiceUuid, 1, 100)
        strictEqual(recordings.items.length > 0, true)

        recordings.items.forEach(async recording => {
          await resemble.recordings.delete(voiceUuid, recording.uuid)
        })

        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            const recordings2 = await resemble.recordings.all(voiceUuid, 1, 100)
            strictEqual(recordings2.items.length, 0)
            resolve()
          }, 1000)
        })
      })
    })

    describe(`#get`, () => {
      it(`doesn't throw`, async () => {
        let error = false
        try {
          const created = await resemble.recordings.create(voiceUuid, recordingCreateInput, getSampleAudio(), getSampleAudioBytes())
          const recording = await resemble.recordings.get(voiceUuid, created.item.uuid)
          await resemble.recordings.delete(voiceUuid, created.item.uuid)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
        }
      })

      it(`returns the recording`, async () => {
        const created = await resemble.recordings.create(voiceUuid, recordingCreateInput, getSampleAudio(), getSampleAudioBytes())
        const recording = await resemble.recordings.get(voiceUuid, created.item.uuid)
        ok(created)
        strictEqual(recording.success, true)
        strictEqual(recording.item.uuid, created.item.uuid)
        strictEqual(recording.item.name, created.item.name)
        strictEqual(recording.item.audio_src, created.item.audio_src)
        strictEqual(recording.item.emotion, created.item.emotion)
        strictEqual(recording.item.text, created.item.text)
        strictEqual(recording.item.created_at.getTime(), created.item.created_at.getTime())
        strictEqual(recording.item.updated_at.getTime(), created.item.updated_at.getTime())
        await resemble.recordings.delete(voiceUuid, created.item.uuid)
      })
    })
  })

})
