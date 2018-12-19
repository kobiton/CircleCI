# Integrating Kobiton into CircleCI mobile application development pipeline

## Table of contents
- [Integrating Kobiton into CircleCI mobile application development pipeline](#integrating-kobiton-into-circleci-mobile-application-development-pipeline)
    - [Table of contents](#table-of-contents)
    - [A. Integrating Kobiton with CircleCI](#a-integrating-kobiton-with-circleci)
        - [1. Preparation](#1-preparation)
            - [1.1. Getting Kobiton Username and API key](#11-getting-kobiton-username-and-api-key)
            - [1.2. Samples](#12-samples)
        - [2. Setup](#2-setup)
            - [2.1 Getting started](#21-getting-started)
            - [2.2. Setting Kobiton Username and API key](#22-setting-kobiton-username-and-api-key)
            - [2.3. Setting Kobiton device desired capabilities](#23-setting-kobiton-device-desired-capabilities)
            - [2.4. CircleCI configuration file](#24-circleci-configuration-file)
        - [3. Automation Test Execution](#3-automation-test-execution)
    - [B. Test session details](#b-test-session-details)
        - [1. Viewing test session details on Kobiton website](#1-viewing-test-session-details-on-kobiton-website)
        - [2. Fetching test session details using Kobiton REST API](#2-fetching-test-session-details-using-kobiton-rest-api)
    - [C. Feedback](#c-feedback)

## A. Integrating Kobiton with CircleCI
### 1. Preparation
#### 1.1. Getting Kobiton Username and API key
Kobiton Username and API key are required for authenticating with Kobiton API.

> If you don't have a Kobiton account, visit https://portal.kobiton.com/register to create one.

To get your Kobiton Username and API Key, follow instructions at `IV. Configure Test Script for Kobiton` section on [our blog](https://kobiton.com/blog/tutorial/parallel-testing-selenium-webdriver/).

#### 1.2. Samples
To give you an in-depth demonstration of the integration flow, we have provided samples:
- Script (written in NodeJS) for executing automation test on Kobiton devices : [automation-test-script.js](/samples/automation-test/automation-test-script.js).
- CircleCI configuration file : [config.yml](/.circleci/config.yml).

You can check out the sample content or keep reading because they are used in below steps as well.

### 2. Setup
#### 2.1 Getting started
Follow steps below to get started:

1. Fork this repository.
2. Add the forked repository to CircleCI.
> Refer to [CircleCI documentation](https://circleci.com/docs/2.0/getting-started/#setting-up-your-build-on-circleci) for instructions on how to add a repository to CircleCI.
>
> Note : At first synchronization, the build process will be failed because we haven't done any configuration. This is normal, just ignore the `Build Failed` message.

#### 2.2. Setting Kobiton Username and API key

In your project configuration in CircleCI, add two environment variables:
- `KOBITON_USERNAME` : Your Kobiton's username.
- `KOBITON_API_KEY` : Your Kobiton's API Key.

Your `Environment Variables` window should look like this

![Environment variables](./assets/env-variables-after-add.png)

#### 2.3. Setting Kobiton device desired capabilities
In order to execute tests on a specific device in Kobiton, its corresponding desired capabilities needs to be supplied.

The provided automation testing script has been pre-configured to execute automation test of a demo Android application on a random, available Android devices.

**Demo application details**
```
- Filename: `ApiDemos-debug.apk`
- Download link: https://appium.github.io/appium/assets/ApiDemos-debug.apk
```

If you want to execute on a specific device, refer to instructions below to get the corresponding desired capabilities for that device.

**Setting up desired capabilities**
1. Go to https://portal.kobiton.com/login and login with your Kobiton account.
2. Click **"Devices"** at the top of the window.

![Devices button](./assets/devices-button.png)

3. Hover over the device you want to execute on (in this example: `Pixel 2 XL`), click the gear button.

![Automation Settings button](./assets/gear-button.png)

4. In the `Automation Settings` popup:
- In `Language` section, choose `NodeJS`.
- In `App Type` section, choose `Hybrid/Native from Url`.
- In `Application Url` section, put `https://appium.github.io/appium/assets/ApiDemos-debug.apk`.

![Example Android DesiredCaps](./assets/desired-caps-example-android.png)

5. From the collected desired capabilities, add these environment variables with corresponding values to your project configuration in CircleCI as shown in the table below

| CircleCI Environment Variables      | Desired Capabilities Variables | Default Value                                             |
|-------------------------------------|--------------------------------|-----------------------------------------------------------|
| KOBITON_DEVICE_PLATFORM_NAME        | platformName                   | Android                                                   |
| KOBITON_DEVICE_NAME                 | deviceName                     | Galaxy*                                                   |
| KOBITON_DEVICE_PLATFORM_VERSION     | platformVersion                | *No*                                                      |
| KOBITON_SESSION_DEVICE_ORIENTATION  | deviceOrientation              | portrait                                                  |
| KOBITON_SESSION_CAPTURE_SCREENSHOTS | captureScreenshots             | true                                                      |
| KOBITON_SESSION_DEVICE_GROUP        | deviceGroup                    | KOBITON                                                   |
| KOBITON_ORGANIZATION_GROUP_ID       | groupId                        | *No*                                                      |
| KOBITON_SESSION_APPLICATION_URL     | app                            | https://appium.github.io/appium/assets/ApiDemos-debug.apk |

For example, if desired capabilities for executing automation test of the provided demo Android application on Pixel 2 XL running Android 8.1.0:

```javascript
var desiredCaps = { 
  sessionName:        'Sample Automation Test Session',
  sessionDescription: 'This is a sample automation test session', 
  deviceOrientation:  'portrait',  
  captureScreenshots: false, 
  app:                'https://appium.github.io/appium/assets/ApiDemos-debug.apk',
  deviceGroup:        'KOBITON', 
  groupId:            100,
  deviceName:         'Pixel 2 XL',
  platformVersion:    '8.1.0',
  platformName:       'Android' 
}
```

The environment variables representing above desired capabilities should look like this:

![Desired Caps To ENV Example](./assets/desired-caps-circleci-env.png)

> More information about Desired Capabilities and its parameters can be found in https://docs.kobiton.com/automation-testing/desired-capabilities-usage/

#### 2.4. CircleCI configuration file
The provided CircleCI configuration file that will be used looks like this:

```yaml
version: 2
jobs:
  build:
    working_directory: ~/sample
    docker:
      - image: circleci/node:latest
    steps:
      - checkout
      - run:
          name: npm-restore-deps
          command: npm install
          working_directory: samples/automation-test
      - run:
          name: app-auto-testing
          command: npm run automation-test-script
          working_directory: samples/automation-test
```

Below is in-depth explanation of the provided configuration file:

- Here we use CircleCI official NodeJS Docker image as the execution environment

>```yaml
>docker:
>    - image: circleci/node:latest
>```

- Checkout and pull code from GitHub

>```yaml
>- checkout
>```

- Install missing dependencies

>```yaml
>- run:
>    name: npm-restore-deps
>    command: npm install
>    working_directory: samples/automation-test
>```

- Execute automation test script on Kobiton

>```yaml
>- run:
>    name: app-auto-testing
>    command: npm run automation-test-script
>    working_directory: samples/automation-test
>```

> For more information about how to execute automation test(s) on Kobiton, you can visit:
> - [Kobiton automation testing documentation](https://docs.kobiton.com/automation-testing/automation-testing-with-kobiton/)
> - [Kobiton sample automation test scripts in other languages](https://github.com/kobiton/samples)

### 3. Automation Test Execution
- Simply re-initiate the build process on CircleCI and it will execute the automation test script on Kobiton.
- Your test execution progress can be viewed on CircleCI.

![CircleCI build execution title](./assets/test-title.png)

![CircleCI build execution report](./assets/test-details.png)

- Your test execution progress can also be viewed on Kobiton

![Kobiton test execution progress](./assets/kobiton-test-executing.png)

## B. Test session details
### 1. Viewing test session details on Kobiton website

Your test session can be viewed on Kobiton website. Follow these steps below

1. Go to https://portal.kobiton.com/sessions, login with your Kobiton account.
2. You will see your executed sessions and their statuses.

![Kobiton session](./assets/session-kobiton.png)

3. Click on any session to view its details, commands.

### 2. Fetching test session details using Kobiton REST API

Kobiton has already provided samples written in NodeJS to get session information, commands using Kobiton REST API.

Refer to [Kobiton sample for REST API](https://github.com/kobiton/samples/tree/master/kobiton-rest-api/get-session-data-and-commands) for instructions.

## C. Feedback

If you have any issue or further information, follow steps below to request Kobiton for support.

1. Go to https://portal.kobiton.com
2. In the navigation bar at the top of the page, click `Support`.

![Kobiton Support Button](./assets/support-button.png)

3. Fill in all necessary information and click `Submit`.

![Kobiton Submit Ticket Form](./assets/support-ticket.png)