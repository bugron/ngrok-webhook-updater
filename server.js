require('dotenv').load();

var request = require('request'),
GitHubApi = require('github4');

var github = new GitHubApi({
  version: '3.0.0',
  host: 'api.github.com',
  protocol: 'https',
  port: '443'
});

github.authenticate({
  type: 'oauth',
  token: process.env.GITHUB_TOKEN
});

var options = {
  url: 'http://127.0.0.1:4040/api/tunnels',
  json: true,
  headers: {
    'Content-Type': 'application/json'
  }
};

request(options, function(error, response, body) {
  if (!error) {
    var endpointURL = body.tunnels[body.tunnels.length - 1].public_url;
    console.log('Current ngrok endpoint URL is: ' + endpointURL);

    github.repos.getHooks({
      user: 'bugron',
      repo: 'TestPrBot',
    }, function(err, res) {
      if (!err) {
        for (var i = 0; i < res.length; i++) {
          var webhookURL = res[i].config.url;
          if (webhookURL.match(/ngrok\.io\/?$/ig)) {
            console.log('Current ngrok Webhook URL is: ' + webhookURL);
            if (webhookURL.match(new RegExp(endpointURL))) {
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
            }, function(err, res) {
              console.log(
                'Your Webhook\'s link is updated from ' + webhookURL +
                  ' to ' + endpointURL
              );
            });
            break;
          }
        }
      } else {
        console.error(err);
      }
    });
  } else {
    console.error(error);
  }
})