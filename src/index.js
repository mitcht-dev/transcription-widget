import platformClient from 'purecloud-platform-client-v2';
import ClientApp from 'purecloud-client-app-sdk';

const clientId = "85c16c77-dca7-4d60-b67a-6f09658aa043";
const redirectUri = 'https://mitcht-dev.github.io/transcription-widget/';

const appName = 'Transcript Widget';

/**
 * Configure both the Platform SDK and the Client App SDK
 */
function setupGenesysClients() {
  const client = platformClient.ApiClient.instance;
  const usersApi = new platformClient.UsersApi();

  // 4. Configure Client App
  let transcriptApp = new ClientApp({
    gcHostOriginQueryParam: 'gcHostOrigin',
    gcTargetEnvQueryParam: 'gcTargetEnv'
  });
  console.log(`TESTING ${transcriptApp.gcEnvironment}`);

  // 5. Configure and Authenticate Platform Client
  client.setPersistSettings(true, appName);
  client.setEnvironment('usw2.pure.cloud');

  return client.loginPKCEGrant(clientId, redirectUri)
    .then(data => {
      console.log('Authentication Successful!', data);
    })
    .catch(err => console.error('Authentication Failed:', err));
}

function initializeWidget() {
  console.log("TESTING Widget script is running...");

  setupGenesysClients()
    .then(() => {

    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWidget);
} else {
  initializeWidget();
}
