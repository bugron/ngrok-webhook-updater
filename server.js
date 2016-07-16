require('dotenv').load();

if (!process.env.GITHUB_TOKEN) {
  throw new Error(
    'A GitHub token must be specified either as an environement variable\n' +
    'or as a value in .env file to be able to change Webhook\'s URL.'
  );
}

if (!process.env.SECRET_TOKEN) {
  throw new Error(
    'A SECRET token must be specified either as an environement variable\n' +
    'or as a value in .env file to secure the webhook connection.'
  );
}

var request = require('request'),
  GitHubApi = require('github'),
  github = new GitHubApi({
    host: 'api.github.com',
    protocol: 'https',
    port: '443'
  }),
  options = {
    url: 'http://127.0.0.1:4040/api/tunnels',
    json: true,
    headers: {
      'Content-Type': 'application/json'
    }
  };

github.authenticate({
  type: 'oauth',
  token: process.env.GITHUB_TOKEN
});

request(options, function(error, response, body) {
  if (error) {
    throw error;
  }

  var endpointURL = body.tunnels[body.tunnels.length - 1].public_url;
  console.log('Current ngrok endpoint URL is: ' + endpointURL);

  github.repos.getHooks({
    user: 'bugron',
    repo: 'TestPrBot',
  }, function(error, res) {
    if (error) {
      throw err;
    }

    for (var i = 0; i < res.length; i++) {
      var webhookURL = res[i].config.url;
      if (/ngrok\.io\/?$/ig.test(webhookURL)) {
        console.log('Current ngrok Webhook URL is: ' + webhookURL);

        if ((new RegExp(endpointURL)).test(webhookURL)) {
          console.log('Endpoint and webhook URL are identical, exiting.');
          break;
        }

        var newConfig = {};
        newConfig = res[i].config;
        newConfig.url = endpointURL;
        newConfig.secret = process.env.SECRET_TOKEN;

        github.repos.editHook({
          user: 'bugron',
          repo: 'TestPrBot',
          id: res[i].id,
          name: res[i].name,
          config: newConfig
        }, function(error, res) {
          console.log(
            'Your Webhook\'s link is updated from ' + webhookURL +
              ' to ' + endpointURL
          );
        });
        break;
      }
    }
  });
});
