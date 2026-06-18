import platformClient from 'purecloud-platform-client-v2';
import ClientApp from 'purecloud-client-app-sdk';

const clientId = "85c16c77-dca7-4d60-b67a-6f09658aa043";
const redirectUri = 'https://mitcht-dev.github.io/transcription-widget/';
let environment = 'usw2.pure.cloud';

const appName = 'Transcript Widget';

/**
 * Configure both the Platform SDK and the Client App SDK
 */
function setupGenesysClients() {
  const client = platformClient.ApiClient.instance;
  const usersApi = new platformClient.UsersApi();

  const urlParams = new URLSearchParams(window.location.search);
  let targetEnv = urlParams.get('gcTargetEnv');

  if (targetEnv) {
    sessionStorage.setItem('gc_environment', targetEnv);
  } else {
    targetEnv = sessionStorage.getItem('gc_environment') || 'usw2.pure.cloud';
  }

  environment = targetEnv;

  // Configure Client App
  let transcriptApp = new ClientApp({
    gcHostOriginQueryParam: 'gcHostOrigin',
    gcTargetEnvQueryParam: 'gcTargetEnv'
  });

  // Configure and Authenticate Platform Client
  client.setPersistSettings(true, appName);
  client.setEnvironment('usw2.pure.cloud');

  return client.loginPKCEGrant(clientId, redirectUri)
    .then(data =>
      console.log('Success message!')
    )
    .catch(err => console.error('Authentication Failed:', err));
}

function initializeWidget() {
  console.log("Widget script is running...");

  setupGenesysClients()
    .then(() => {

    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWidget);
} else {
  initializeWidget();
}
