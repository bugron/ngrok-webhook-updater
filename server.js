require('dotenv').config();

const {
  GITHUB_TOKEN,
  SECRET_TOKEN,
  BOT_PATH,
  REPO_OWNER,
  REPO_NAME,
  PORT
} = process.env;

const ngrok = require('ngrok'),
  github = new require('@octokit/rest')(),
  listenPort = PORT || 5000,
  listenForConnections = false,
  killTheServer = true;

if (!REPO_OWNER || !REPO_NAME) {
  throw new Error('REPO_OWER and REPO_NAME environment variables should be set!');
}

if (listenForConnections && !BOT_PATH) {
  throw new Error('BOT_PATH environment variable is empty!');
}

if (!GITHUB_TOKEN) {
  throw new Error([
    'A GitHub token must be specified in secrets.json',
    'file as the value of "GITHUB_TOKEN".',
    'This has to be a token with a scope of',
    '"admin:repo_hook" to be able to change Webhook\'s URL.'
  ].join('\n'));
}

if (!SECRET_TOKEN) {
  throw new Error(
    'A SECRET token must be specified in secrets.json file\n' +
    'as the value of "SECRET_TOKEN" to secure the webhook connection.'
  );
}

github.authenticate({
  type: 'oauth',
  token: GITHUB_TOKEN
});

console.log('Attempting to start ngrok server...');

(async () => {
  const endpointURL = await ngrok.connect(listenPort);

  console.log(`ngrok server started. Listening on port ${listenPort}\n`);
  console.log(`Current ngrok endpoint URL is: ${endpointURL}`);

  const { data: repoHooks } = await github.repos.listHooks({
    owner: REPO_OWNER,
    repo: REPO_NAME,
  });

  const ngrokWebhooks = repoHooks
    .filter(hook => hook.config.url.includes('ngrok.io'));

  if (!ngrokWebhooks.length) {
    return console.error('No ngrok GitHub webhooks are identified');
  }

  for (let webhook of ngrokWebhooks) {
    if (endpointURL === webhook.config.url) {
      console.log('Endpoint and Payload URL are identical');
      continue;
    }

    await github.repos.updateHook({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      hook_id: webhook.id,
      name: webhook.name,
      config: Object.assign({}, webhook.config, {
        url: endpointURL,
        secret: SECRET_TOKEN
      })
    });

    console.log(
      `ngrok Webhook's Payload URL is updated from ${webhook.config.url} to ${endpointURL}`
    );

    if (listenForConnections) {
      console.log('\nReady for incoming connections!');
      require(BOT_PATH);
    } else if (killTheServer) {
      console.log('Disconnecting and killing ngrok server...');
      await ngrok.disconnect();
      await ngrok.kill();
      console.log('Done, exiting');
    }
  }
})();
