import { context } from './context'
import ProjectsV2 from './v2/projects'
import ClipsV2 from './v2/clips'
import RecordingsV2 from './v2/recordings'
import VoicesV2 from './v2/voices'


export const Resemble = {
  setApiKey: context.setApiKey,
  setBaseUrl: context.setBaseUrl,
  setSynthesisUrl: context.setSynthesisUrl,
  
  v2: {
    projects: {
      all: ProjectsV2.all,
      create: ProjectsV2.create,
      update: ProjectsV2.update,
      get: ProjectsV2.get,
      delete: ProjectsV2.destroy,
    },
    clips: {
      all: ClipsV2.all,
      createSync: ClipsV2.createSync,
      createAsync: ClipsV2.createAsync,
      updateAsync: ClipsV2.updateAsync,
      // stream: ClipsV2.stream,
      get: ClipsV2.get,
      delete: ClipsV2.destroy,
    },
    voices: {
      all: VoicesV2.all,
      create: VoicesV2.create,
      update: VoicesV2.update,
      build: VoicesV2.build,
      get: VoicesV2.get,
      delete: VoicesV2.destroy,
    },
    recordings: {
      all: RecordingsV2.all,
      get: RecordingsV2.get,
      create: RecordingsV2.create,
      update: RecordingsV2.update,
      delete: RecordingsV2.destroy,
    },
  },
}
