import Resemble, { Version2 } from '@resemble/node'
import { ok, strictEqual } from 'assert'
import { TestUtils } from '../../TestUtil'

const ResembleConstructor: Resemble = require('../../..')

describe(`ResembleAPI v2`, () => {
  let resemble: Version2.API

  const voiceCreateInput: Version2.VoiceInput = {
    name: 'Test Voice'
  }

  const voiceUpdateInput: Version2.VoiceInput = {
    ...voiceCreateInput,
    name: 'Updated name'
  }

  beforeEach(() => {
    resemble = new ResembleConstructor('v2', TestUtils.getTestAPIKey(), {
      baseUrl: TestUtils.getTestBaseURL()
    })
  })

  it(`constructor must accept an api token and options`, () => {
    // done in beforeEach()
  })

  describe(`Voices`, () => {
    describe(`#all`, () => {
      it(`doesn't throw`, async () => {
        let error = false
        try {
          await resemble.voices.all(1)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
        }
      })

      it(`returns a paginated array`, async () => {
        let voices = await resemble.voices.all(1)
        
        ok(voices.items)
        strictEqual(typeof (voices.items), 'object')
        strictEqual(typeof (voices.items.length), 'number')
        strictEqual(voices.success, true)
        strictEqual(voices.message, undefined)
        strictEqual(typeof voices.num_pages, 'number')
        strictEqual(voices.page, 1)
        strictEqual(typeof voices.page_size, 'number')
      })
    })

    let createdVoiceUUIDs = []
    
    describe(`#create`, () => {
      it(`doesn't throw`, async () => {
        let error = false
        let created
        try {
          created = await resemble.voices.create(voiceCreateInput)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
          strictEqual(typeof created.item, 'object')
          strictEqual(created.success, true)
          strictEqual(created.message, undefined)
          createdVoiceUUIDs.push(created.item.uuid)
        }
      })

      it(`creates a voice with correct properties`, async () => {
        const created = await resemble.voices.create(voiceCreateInput)
        strictEqual(created.success, true)
        strictEqual(typeof created.item.uuid, 'string')
        strictEqual(created.item.name, voiceCreateInput.name)
        ok(created.item.created_at.getTime())
        ok(created.item.updated_at.getTime())

        createdVoiceUUIDs.push(created.item.uuid)
      })
    })

    describe(`#update`, () => {
      it(`doesn't throw`, async () => {
        let error = false
        let updated
        try {
          const created = await resemble.voices.create(voiceCreateInput)
          createdVoiceUUIDs.push(created.item.uuid)
          
          const uuid = created.item.uuid

          const input = {
            ...voiceCreateInput
          }
          input.name = 'Updated name'
          updated = await resemble.voices.update(uuid, input)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
          strictEqual(updated.message, undefined)
          strictEqual(updated.success, true)
          strictEqual(typeof updated.item, 'object')
        }
      })

      it(`updates a voice with correct properties`, async () => {
        const created = await resemble.voices.create(voiceCreateInput)
        createdVoiceUUIDs.push(created.item.uuid)

        const uuid = created.item.uuid

        const updated = await resemble.voices.update(uuid, voiceUpdateInput)

        strictEqual(updated.success, true)
        strictEqual(typeof updated.item.uuid, 'string')
        strictEqual(updated.item.name, voiceUpdateInput.name)
        ok(updated.item.created_at.getTime())
        ok(updated.item.updated_at.getTime())
      })
    })

    describe('#delete', () => {
      it(`doesn't throw`, async () => {
        let error = false
        try {
          const created = await resemble.voices.create(voiceCreateInput)

          await resemble.voices.delete(created.item.uuid)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
        }
      })

      /**
       * NOTE: 
       * - This test may fail if the backend doesn't delete fast enough.
       * - This test may fail if there are more than 100 voices assigned to the user.
       */
      it(`deletes voices`, async () => {
        await resemble.voices.create(voiceCreateInput)
        const voices = await resemble.voices.all(1, 100)
        const voiceLength = voices.items.length
        strictEqual(voices.items.length > 0, true)

        voices.items.forEach(async voice => {
          if (voice.name === voiceCreateInput.name || voice.name === voiceUpdateInput.name)
            await resemble.voices.delete(voice.uuid)
        })

        return new Promise(resolve => {
          setTimeout(async () => {
            const voices2 = await resemble.voices.all(1, 100)
            const voice2Length = voices2.items.length
            strictEqual(voice2Length < voiceLength, true)
            resolve()
          }, 1000)
        })
      })
    })

    describe(`#get`, () => {
      it(`doesn't throw`, async () => {
        let error = false
        try {
          const created = await resemble.voices.create(voiceCreateInput)
          const voice = await resemble.voices.get(created.item.uuid)
          await resemble.voices.delete(created.item.uuid)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
        }
      })

      it(`returns the voice`, async () => {
        const created = await resemble.voices.create(voiceCreateInput)
        const voice = await resemble.voices.get(created.item.uuid)
        ok(created)
        strictEqual(voice.success, true)
        strictEqual(voice.item.uuid, created.item.uuid)
        strictEqual(voice.item.name, created.item.name)
        strictEqual(voice.item.created_at.getTime(), created.item.created_at.getTime())
        strictEqual(voice.item.updated_at.getTime(), created.item.updated_at.getTime())
        await resemble.voices.delete(created.item.uuid)
      })
    })
  })

})
