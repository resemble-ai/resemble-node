import Resemble, { Version2 } from '@resemble/node'
import { ok, strictEqual } from 'assert'
import { TestUtils } from '../../TestUtil'

const ResembleConstructor: Resemble = require('../../..')

describe(`ResembleAPI v2`, () => {
  let resemble: Version2.API

  const projectInput: Version2.ProjectInput = {
    name: 'Test Project',
    description: 'This project was created via API!',
    is_archived: false,
    is_collaborative: true,
    is_public: true
  }

  beforeEach(() => {
    resemble = new ResembleConstructor('v2', TestUtils.getTestAPIKey(), {
      baseUrl: TestUtils.getTestBaseURL()
    })
  })

  it(`constructor must accept an api token and options`, () => {
    // done in beforeEach()
  })

  describe(`Projects`, () => {
    describe(`#all`, () => {
      it(`doesn't throw`, async () => {
        let error = false
        try {
          await resemble.projects.all(1)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
        }
      })

      it(`returns a paginated array`, async () => {
        let projects = await resemble.projects.all(1)
        
        ok(projects.items)
        strictEqual(typeof (projects.items), 'object')
        strictEqual(typeof (projects.items.length), 'number')
        strictEqual(projects.success, true)
        strictEqual(projects.message, undefined)
        strictEqual(typeof projects.num_pages, 'number')
        strictEqual(projects.page, 1)
        strictEqual(typeof projects.page_size, 'number')
      })
    })

    let createdProjectUUIDs = []
    
    describe(`#create`, () => {
      it(`doesn't throw`, async () => {
        let error = false
        let created
        try {
          created = await resemble.projects.create(projectInput)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
          strictEqual(typeof created.item, 'object')
          strictEqual(created.success, true)
          strictEqual(created.message, undefined)
          createdProjectUUIDs.push(created.item.uuid)
        }
      })

      it(`creates a project with correct properties`, async () => {
        const created = await resemble.projects.create(projectInput)
        strictEqual(created.success, true)
        strictEqual(typeof created.item.uuid, 'string')
        strictEqual(created.item.name, projectInput.name)
        strictEqual(created.item.description, projectInput.description)
        ok(created.item.created_at.getTime())
        ok(created.item.updated_at.getTime())
        strictEqual(created.item.is_archived, projectInput.is_archived)
        strictEqual(created.item.is_collaborative, projectInput.is_collaborative)
        strictEqual(created.item.is_public, projectInput.is_public)

        createdProjectUUIDs.push(created.item.uuid)
      })
    })

    describe(`#update`, () => {
      it(`doesn't throw`, async () => {
        let error = false
        let updated
        try {
          const created = await resemble.projects.create(projectInput)
          createdProjectUUIDs.push(created.item.uuid)
          
          const uuid = created.item.uuid

          const input = {
            ...projectInput
          }
          input.name = 'Updated name'
          input.description = 'Updated Desc'
          input.is_archived = !input.is_archived
          input.is_collaborative = !input.is_collaborative
          input.is_public = !input.is_public
          updated = await resemble.projects.update(uuid, input)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
          strictEqual(updated.message, undefined)
          strictEqual(updated.success, true)
          strictEqual(typeof updated.item, 'object')
        }
      })

      it(`updates a project with correct properties`, async () => {
        const created = await resemble.projects.create(projectInput)
        createdProjectUUIDs.push(created.item.uuid)

        const uuid = created.item.uuid

        const input = {
          ...projectInput
        }
        input.name = 'Updated name'
        input.description = 'Updated Desc'
        input.is_archived = !input.is_archived
        input.is_collaborative = !input.is_collaborative
        input.is_public = !input.is_public
        const updated = await resemble.projects.update(uuid, input)

        strictEqual(updated.success, true)
        strictEqual(typeof updated.item.uuid, 'string')
        strictEqual(updated.item.name, input.name)
        strictEqual(updated.item.description, input.description)
        ok(updated.item.created_at.getTime())
        ok(updated.item.updated_at.getTime())
        strictEqual(updated.item.is_archived, input.is_archived)
        strictEqual(updated.item.is_collaborative, input.is_collaborative)
        strictEqual(updated.item.is_public, input.is_public)
      })
    })

    describe('#delete', () => {
      it(`doesn't throw`, async () => {
        let error = false
        try {
          const created = await resemble.projects.create(projectInput)

          await resemble.projects.delete(created.item.uuid)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
        }
      })

      /**
       * NOTE: 
       * - This test may fail if the backend doesn't delete fast enough.
       * - This test may fail if there are more than 100 projects assigned to the user.
       */
      it(`deletes projects`, async () => {
        await resemble.projects.create(projectInput)
        const projects = await resemble.projects.all(1, 100)
        strictEqual(projects.items.length > 0, true)

        projects.items.forEach(async project => {
          await resemble.projects.delete(project.uuid)
        })

        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            const projects2 = await resemble.projects.all(1, 100)
            strictEqual(projects2.items.length, 0)
            resolve()
          }, 1000)
        })
      })
    })

    describe(`#get`, () => {
      it(`doesn't throw`, async () => {
        let error = false
        try {
          const created = await resemble.projects.create(projectInput)
          const project = await resemble.projects.get(created.item.uuid)
          await resemble.projects.delete(created.item.uuid)
        } catch (e) {
          error = true
        } finally {
          strictEqual(error, false)
        }
      })

      it(`returns the project`, async () => {
        const created = await resemble.projects.create(projectInput)
        const project = await resemble.projects.get(created.item.uuid)
        ok(created)
        strictEqual(project.success, true)
        strictEqual(project.item.uuid, created.item.uuid)
        strictEqual(project.item.name, created.item.name)
        strictEqual(project.item.description, created.item.description)
        strictEqual(project.item.created_at.getTime(), created.item.created_at.getTime())
        strictEqual(project.item.updated_at.getTime(), created.item.updated_at.getTime())
        strictEqual(project.item.is_archived, created.item.is_archived)
        strictEqual(project.item.is_collaborative, created.item.is_collaborative)
        strictEqual(project.item.is_public, created.item.is_public)
        await resemble.projects.delete(created.item.uuid)
      })
    })
  })

})
