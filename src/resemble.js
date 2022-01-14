const APIBuilder = require('./APIBuilder')

/**
 * @param {version} version: The API version for which a client should be built.
 * @param {string} apiToken: The API token to use for authentication.
 * @param {Object} options: An object containing the following options:
 *   - baseUrl (optional): Specifies the base url to use for requests.
 *   - synServerUrl (optional): Specifies the url to your resemble synthesis server.
 *   - any other version-specific options
 */
module.exports = function(version, apiToken, options) {
  if (!options) options = {}
  if (options.baseUrl) APIBuilder.setBaseUrl(options.baseUrl)
  if (options.synServerUrl) APIBuilder.setSynServerUrl(options.synServerUrl)
  
  return APIBuilder.build(version, apiToken, options)
}