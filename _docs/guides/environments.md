# aimeup Runtime Environments Guide
This guide represents the vision and status of the various development, testing, and production environments that will be used to support EatGPT through to an initial production rollout

Addresses:
- Target application endpoints per environment
- Devops tools and processes
- Release phases
- Environment construction plan

## 


## 4. Environment vision

### 4.1 *sandbox* Environment
Supports local development
- *Android:* Emulator, Hardwired Phone
- *iOS:* Emulator, Hardwired Phone  <=  Not in scope for initial conversion
- *Web:* http://localhost:xxxx/eatgpt
- *Firebase:* EatGPT.sandbox / Android, iOS, Web

### 4.2 *dev* Environment
Supports Playstore internal testing, and manually configured IOS connectivity
- *Android:* Playstore (EatGPT/Internal Testing)
- *iOS:* Emulator, Hardwired Phone  << Not in scope for the conversion
- *Web:* http://dev.aimeup.app/eatgpt
- *Firebase:* EatGPT.dev / Android, iOS, Web

### 4.3 *test* Environment -- NOT IN SCOPE FOR INITIAL CONVERSION
Supports playstore closed testing
- *Android:* Playstore (EatGPT/Closed Testing)
- *iOS:* Appstore (EatGPT/Internal Testing)
- *Web:* http://test.aimeup.app/eatgpt
- *Firebase:* EatGPT.test / Android, iOS, Web

### 4.4 *acceptance* Environment -- NOT IN SCOPE FOR INITIAL CONVERSION
Supports playstore open testing
- *Android:* Playstore (EatGPT/Open Testing)
- *iOS:* Appstore (EatGPT/External Testing)
- *Web:* http://acceptance.aimeup.app/eatgpt
- *Firebase:* EatGPT.acceptance / Android, iOS, Web

### 4.5 *production* Environment -- NOT IN SCOPE FOR INITIAL CONVERSION
Supports playstore closed testing
- *Android:* Playstore (EatGPT/production)
- *iOS:* Appstore (EatGPT/production)
- *Web:* http://aimeup.app/eatgpt
- *Firebase:* EatGPT.production / Android, iOS, Web

