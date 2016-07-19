This script will launch [ngrok](https://ngrok.com/) and expose `localhost:5000` to web and then update [TestPrBot's](https://github.com/bugron/TestPrBot) ngrok webhook URL. After that [FccPrBot](https://github.com/bugron/FccPrBot) will be automatically started.

## Instructions

```bash
git clone https://github.com/bugron/ngrok-webhook-updater.git
cd ngrok-webhook-updater
npm install
```
The directory structure should be something like:
```
/Users/bugron/dev
|- FccPrBot
|- ngrok-webhook-updater
```

Username and repository name are hardcoded for now.

-  Create a new token: `Settings > Personal access tokens > Generate new token`
-  Only check `admin:repo_hook` and click Generate token
-  Create a `secrets.json` file in project's root with the following in it:
```
{
  "GITHUB_TOKEN": "insert_token_here"
  "SECRET_TOKEN": "insert_key_here"
}
```

-  Replace `insert_token_here` and `insert_key_here` with their real values. `SECRET_TOKEN` is used for [securing your webhook](https://developer.github.com/webhooks/securing/):

-  `npm start`

Secret key must be the same as for FccPrBot!
