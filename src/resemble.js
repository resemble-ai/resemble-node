const APIBuilder = require('./APIBuilder')

/**
 * @param {version} version: The API version for which a client should be built.
 * @param {string} apiToken: The API token to use for authentication.
 * @param {Object} options: An object containing the following options:
 *   - baseUrl (optional): Specifies the base url to use for requests.
 *   - any other version-specific options
 */
module.exports = function(version, apiToken, options) {
  if (!options) options = {}
  if (options.baseUrl) APIBuilder.setBaseUrl(options.baseUrl)
  
  return APIBuilder.build(version, apiToken, options)
}