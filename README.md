This script will automatically start [FccPrBot](https://github.com/bugron/FccPrBot), then launch [ngrok](https://ngrok.com/) and expose localhost:5000 to web and then update [TestPrBot's](https://github.com/bugron/TestPrBot) ngrok webhook URL. This project is for Windows only!

## Instructions

```bash
git clone https://github.com/bugron/ngrok-webhook-updater.git
cd ngrok-webhook-updater
npm install
```
Put `ngrok.exe` in the root of this project. The directory should be something like:
```
/Users/bugron/dev
|- FccPrBot
|- ngrok-webhook-updater
```

Username and repository name are hardcoded for now.

-  Create a new token: `Settings > Personal access tokens > Generate new token`
-  Only check `admin:repo_hook` and click Generate token
-  Create an `.env` file in project's root with the following in it:
`GITHUB_TOKEN=insert_token_here`
-  Set in your `.env` file a Secret key which we're using for [securing our webhook](https://developer.github.com/webhooks/securing/):
`SECRET_TOKEN=insert_key_here`
-  `npm start`

Secret key must be the same as for FccPrBot!
