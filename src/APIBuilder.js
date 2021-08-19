const path = require('path')
const fetch = require('node-fetch')

const VERSIONS = {
  // v1: {
  //   exports: path.resolve(__dirname, 'api', 'v1', 'index.js'),
  //   baseUrl: 'https://app.resemble.ai/api/v1/'
  // },
  v2: {
    exports: path.resolve(__dirname, 'api', 'v2', 'index.js'),
    baseUrl: 'https://app.resemble.ai/api/v2/'
  }
}

let baseUrl = null
const APIBuilder = {}

APIBuilder.setBaseUrl = (url) => {
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error(`The provided BASE_URL "${url}" must be a non-empty string.`)
  }

  // add trailing / if necessary
  if (!url.endsWith('/')) url = `${url}/`
  
  baseUrl = url
}

APIBuilder.build = (apiVersion, apiToken, options) => {
  if (typeof apiToken !== 'string' || apiToken.length === 0) {
    throw new Error(`The provided API_TOKEN "${apiToken}" must be a non-empty string.`)
  }

  if (typeof apiVersion !== 'string' || apiVersion.length === 0 || !VERSIONS[apiVersion]) {
    throw new Error(`The provided API_VERSION "${apiVersion}" must be a non-empty string matching one of the following values: [${Object.keys(VERSIONS).map(v => `'${v}'`).join(', ')}].`)
  }
  
  const version = VERSIONS[apiVersion]

  const headers = {
    Authorization: `Token token=${apiToken}`,
    ['Content-Type']: 'application/json'
  }
  
  const appUrl = baseUrl ? baseUrl : version.baseUrl
  const api = path => `${appUrl}${path}`

  const context = {
    headers,
    options,
    api,

    get: path => fetch(api(path), { method: 'GET', headers }),
    post: (path, data) => fetch(api(path), { method: 'POST', headers, body: JSON.stringify(data) }),
    put: (path, data) => fetch(api(path), { method: 'PUT', headers, body: JSON.stringify(data) }),
    delete: path => fetch(api(path), { method: 'DELETE', headers }),
  }
  
  const build = require(version.exports)(context)

  if (build !== undefined) return build

  throw new Error(`Unable to build Resemble API version: '${apiVersion}'`)
}

module.exports = APIBuilder