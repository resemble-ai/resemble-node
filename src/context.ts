let apiKey: string | undefined = ''
let baseUrl: string | undefined = 'https://app.resemble.ai/api/'
let synthesisServerUrl: string | undefined = ''

const synthesisServerHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${apiKey}`,
  'x-access-token': apiKey,
}

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  Authorization: `Token token=${apiKey}`,
}

export const context = {
  headers: () => headers,
  synthesisServerHeaders: () => synthesisServerHeaders,

  setBaseUrl: (url: string) => {
    baseUrl = url

    if (!url.endsWith('/')) {
      baseUrl += '/'
    }
  },

  setApiKey: (key: string) => {
    apiKey = key
    headers['Authorization'] = `Token token=${key}`
    synthesisServerHeaders['Authorization'] = `Bearer ${key}`
    synthesisServerHeaders['x-access-token'] = key
  },

  setSynthesisUrl: (url: string) => {
    synthesisServerUrl = url

    if (!url.endsWith('/')) {
      synthesisServerUrl += '/'
    }
  },

  endpoint: (version: string, endpoint: string): string => {
    let ending = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint
    return `${baseUrl}${version}/${ending}`
  },

  synServerUrl: (endpoint) => {
    let ending = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint
    const url = `${synthesisServerUrl}${ending}`
    return url
  },
}
