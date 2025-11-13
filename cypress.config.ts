import {defineConfig} from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: "cypress/videos",
    screenshotsFolder: "cypress/screenshots",
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    chromeWebSecurity: false,
    env: {
      NIP05_DOMAIN: "anmore.me",
      DEFAULT_HASHTAG: "anmore",
    },
    setupNodeEvents(on, config) {
      // Support for environment variables
      config.env = {
        ...config.env,
        ...process.env,
      }
      return config
    },
  },
})
