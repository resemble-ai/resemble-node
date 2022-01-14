export class TestUtils {
  public static getTestVoiceUUID(): string {
    const testVoiceUUID = process.env.TEST_VOICE_UUID
    if (!testVoiceUUID)
      throw 'Invalid voice UUID specified; please set the TEST_VOICE_UUID environment variable'
    return testVoiceUUID
  }

  public static getTestBaseURL(): string {
    if (!process.env.TEST_BASE_URL) {
      console.log('Using https://app.resemble.ai/api/v2 as the base URL, set the TEST_BASE_URL environment variable to change it')
    }
    return process.env.TEST_BASE_URL || 'https://app.resemble.ai/api/v2'
  }

  public static getTestSynServerURL(): string {
    if (!process.env.TEST_SYN_SERVER_URL)
      throw 'Invalid syn server url specified; please set the TEST_SYN_SERVER_URL environment variable'
    return process.env.TEST_SYN_SERVER_URL
  }

  public static getTestAPIKey(): string {
    const TEST_API_KEY = process.env.TEST_API_KEY
    if (!TEST_API_KEY) {
      throw 'Invalid API key; please specify the TEST_API_KEY environment variable.'
    }
    return process.env.TEST_API_KEY
  }

  public static getTestCallbackURL(): string {
    const TEST_CALLBACK_URL = process.env.TEST_CALLBACK_URL
    if (!TEST_CALLBACK_URL) {
      throw 'Invalid test callback url'
    }
    return TEST_CALLBACK_URL
  }
}