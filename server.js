require('./utils').init();

const {
  GITHUB_TOKEN,
  SECRET_TOKEN,
  REPO_OWNER,
  REPO_NAME,
  KILL_CONNECTION,
  PORT,
} = require('./config');
const ngrok = require('ngrok');
const GitClient = require('@octokit/rest');

const github = new GitClient();

github.authenticate({
  type: 'oauth',
  token: GITHUB_TOKEN,
});

(async () => {
  console.log('Fetching repo webhooks...');
  const { data: repoHooks } = await github.repos.listHooks({
    owner: REPO_OWNER,
    repo: REPO_NAME,
  });

  const ngrokWebhooks = repoHooks
    .filter(hook => hook.config.url.includes('ngrok.io'));

  if (!ngrokWebhooks.length) {
    return console.error('No ngrok GitHub webhooks are identified');
  }

  console.log('Attempting to start ngrok server...');
  const endpointURL = await ngrok.connect(PORT);
  console.log(`ngrok server started. Listening on port ${PORT}\n`);
  console.log(`Current ngrok endpoint URL is: ${endpointURL}`);

  ngrokWebhooks.forEach(async ({ id, name, config }) => {
    if (endpointURL === config.url) {
      console.log('Endpoint and Payload URL are identical');
      return;
    }

    await github.repos.updateHook({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      hook_id: id,
      name,
      config: Object.assign({}, config, {
        url: endpointURL,
        secret: SECRET_TOKEN,
      }),
    });

    console.log(
      `ngrok Webhook's Payload URL is updated from ${config.url} to ${endpointURL}`
    );
  });

  if (KILL_CONNECTION) {
    console.log('Disconnecting and killing ngrok server...');
    await ngrok.disconnect();
    await ngrok.kill();
  } else {
    console.log('Listening for incoming webook connections...');
  }
})();
