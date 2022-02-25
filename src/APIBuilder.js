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
let synServerUrl = null
const APIBuilder = {}

APIBuilder.setBaseUrl = (url) => {
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error(`The provided BASE_URL "${url}" must be a non-empty string.`)
  }

  // add trailing / if necessary
  if (!url.endsWith('/')) url = `${url}/`
  
  baseUrl = url
}

APIBuilder.setSynServerUrl = (url) => {
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error(`The provided syn server url "${url}" must be a non-empty string.`)
  }
  // add trailing / if necessary
  if (!url.endsWith('/')) url = `${url}/`

  synServerUrl = url
}

APIBuilder.build = (apiVersion, apiToken, options) => {
  if (typeof apiToken !== 'string' || apiToken.length === 0) {
    throw new Error(`The provided API_TOKEN "${apiToken}" must be a non-empty string.`)
  }

  if (typeof apiVersion !== 'string' || apiVersion.length === 0 || !VERSIONS[apiVersion]) {
    throw new Error(`The provided API_VERSION "${apiVersion}" must be a non-empty string matching one of the following values: [${Object.keys(VERSIONS).map(v => `'${v}'`).join(', ')}].`)
  }
  
  const version = VERSIONS[apiVersion]

  const headers = (synServer = false) => {
    let h = {
      ['Content-Type']: 'application/json'
    }
    if (synServer) {
      h['x-access-token'] = apiToken
    } else {
      h['Authorization'] = `Token token=${apiToken}`
    }
    return h
  }
  
  const appUrl = baseUrl ? baseUrl : version.baseUrl

  const api = (path, synServer) => {
    if (synServer) {
      return `${synServerUrl}${path}`
    } else {
      return `${appUrl}${path}`
    }
  }

  const context = {
    headers,
    options,
    api,

    get: (path, synServer = false) => fetch(api(path, synServer), { method: 'GET', headers:  headers(synServer)}),
    post: (path, data, synServer = false) =>  fetch(api(path, synServer), { method: 'POST', headers: headers(synServer), body: JSON.stringify(data) }),
    put: (path, data, synServer = false) => fetch(api(path, synServer), { method: 'PUT', headers: headers(synServer), body: JSON.stringify(data) }),
    delete: (path, synServer = false)=> fetch(api(path, synServer), { method: 'DELETE', headers: headers(synServer) }),
  }
  
  const build = require(version.exports)(context)

  if (build !== undefined) return build

  throw new Error(`Unable to build Resemble API version: '${apiVersion}'`)
}

module.exports = APIBuilder