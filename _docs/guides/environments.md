# Environments Guide

Records the aspirations, status, and configuration of the environments which will be used for development, testing, and production

## Environments

### _sandbox_

Status: In place, changes required

Components

- _Android:_ Emulator, Hardwired Phone
- _iOS:_ Emulator, Hardwired Phone <= Not in scope for initial conversion
- _Web:_ http://localhost:xxxx/eatgpt
- _Firebase:_ EatGPT.sandbox / Android, iOS, Web

### _dev_

Status: Immediate scope
Supports: QA

Components:

- _Android:_ Playstore (EatGPT/Internal Testing)
- _iOS:_ Emulator, Hardwired Phone << Not in scope for the conversion
- _Web:_ http://dev.aimeup.app/eatgpt
- _Firebase:_ EatGPT.dev / Android, iOS, Web

### _test_

Status: Not in immediate scope

Components

- _Android:_ Playstore (EatGPT/Closed Testing)
- _iOS:_ Appstore (EatGPT/Internal Testing)
- _Web:_ http://test.aimeup.app/eatgpt
- _Firebase:_ EatGPT.test / Android, iOS, Web

### _acceptance_

Status: Not in immediate scope

Components:

- _Android:_ Playstore (EatGPT/Open Testing)
- _iOS:_ Appstore (EatGPT/External Testing)
- _Web:_ http://acceptance.aimeup.app/eatgpt
- _Firebase:_ EatGPT.acceptance / Android, iOS, Web

### _production_

Status: Not in immediate scope

Components:

- _Android:_ Playstore (EatGPT/production)
- _iOS:_ Appstore (EatGPT/production)
- _Web:_ http://aimeup.app/eatgpt
- _Firebase:_ EatGPT.production / Android, iOS, Web
