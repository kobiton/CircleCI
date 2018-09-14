import 'babel-polyfill'
import 'colors'
import wd from 'wd'
import {assert} from 'chai'

const username = process.env.KOBITON_USERNAME
const apiKey = process.env.KOBITON_API_KEY
const platformVersion = process.env.KOBITON_DEVICE_PLATFORM_VERSION
const deviceName = process.env.KOBITON_DEVICE_PLATFORM_VERSION || 'iPhone*'

const kobitonServerConfig = {
  protocol: 'https',
  host: 'api.kobiton.com',
  auth: `${username}:${apiKey}`
}

const desiredCaps = {
  sessionName:        'Automation test session',
  sessionDescription: 'Demo Automation Test on iOS', 
  deviceOrientation:  'portrait',  
  captureScreenshots: true, 
  app:                'https://s3-ap-southeast-1.amazonaws.com/kobiton-devvn/apps-test/UIKitCatalog-Test-Adhoc.ipa', 
  deviceGroup:        'KOBITON', 
  deviceName:         deviceName,
  platformName:       'iOS' 
}

let driver

if (platformVersion) {
  desiredCaps.platformVersion = platformVersion
}

if (!username || !apiKey || !desiredCaps.app) {
  console.log('Error: Environment variables KOBITON_USERNAME, KOBITON_API_KEY and Application URL are required to execute script')
  process.exit(1)
}

describe('iOS App sample', () => {

  before(async () => {
    driver = wd.promiseChainRemote(kobitonServerConfig)

    driver.on('status', (info) => {
      console.log(info.cyan)
    })
    driver.on('command', (meth, path, data) => {
      console.log(' > ' + meth.yellow, path.grey, data || '')
    })
    driver.on('http', (meth, path, data) => {
      console.log(' > ' + meth.magenta, path, (data || '').grey)
    })

    try {
      await driver.init(desiredCaps)
    }
    catch (err) {
      if (err.data) {
        console.error(`init driver: ${err.data}`)
      }
    throw err
    }
  })

  it('should get text UIKitCatalog', async () => {
    await driver.waitForElementByXPath('//UIAStaticText')
      .text().then(function(text) {
        assert.include(text, 'UIKitCatalog')
      })
  })

  after(async () => {
    if (driver != null) {
    try {
      await driver.quit()
    }
    catch (err) {
      console.error(`quit driver: ${err}`)
    }
  }
  })
})