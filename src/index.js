import platformClient from 'purecloud-platform-client-v2';
import ClientApp from 'purecloud-client-app-sdk';

const redirectUri = 'https://mitcht-dev.github.io/transcript-widget/';

console.log("TESTING: Step 1 - Script loaded and imports executed.");

try {
  const client = platformClient.ApiClient.instance;
  console.log("TESTING: Step 2 - platformClient instantiated successfully.");

  const app = new ClientApp({
    gcHostOriginQueryParam: 'gcHostOrigin',
    gcTargetEnvQueryParam: 'gcTargetEnv',
  });
  console.log("TESTING: Step 3 - ClientApp instantiated successfully.");

  client.loginPKCEGrant(clientId, redirectUri)
  .then(data => {
    console.log('TESTING: Step 3 - authentication successful');
  })
  .catch(e => {
    console.log('TESTING: Error', e.message, e);
  })

} catch (e) {
  console.error("TESTING: Error", e.message, e);
}