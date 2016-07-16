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

var ngrok = require('ngrok'),
  GitHubApi = require('github'),
  github = new GitHubApi({
    host: 'api.github.com',
    protocol: 'https',
    port: '443'
  }),
  listenPort = 5000;

github.authenticate({
  type: 'oauth',
  token: process.env.GITHUB_TOKEN
});

console.log('Attempting to start ngrok server...');
ngrok.connect(listenPort, function (error, endpointURL) {
  if (error) {
    throw error;
  }

  console.log('ngrok server started. Listening on port ' + listenPort + '\n');
  console.log('Current ngrok endpoint URL is: ' + endpointURL);

  github.repos.getHooks({
    user: 'bugron',
    repo: 'TestPrBot',
  }, function(error, res) {
    if (error) {
      throw error;
    }

    for (var i = 0; i < res.length; i++) {
      var webhookURL = res[i].config.url;
      if (/ngrok\.io\/?$/ig.test(webhookURL)) {
        console.log('Current ngrok Webhook\'s Payload URL is: ' + webhookURL);

        if ((new RegExp(endpointURL)).test(webhookURL)) {
          console.log('Endpoint and Payload URL are identical, exiting.');
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
          if (error) {
            throw error;
          }

          console.log(
            'ngrok Webhook\'s Payload URL is updated from\n' + webhookURL +
              ' to ' + endpointURL + '\n\n' +
            'Ready for incoming connections!'
          );
        });
        break;
      }
    }
  });
});
