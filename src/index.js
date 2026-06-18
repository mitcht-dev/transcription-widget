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

  let environment = 'usw2.pure.cloud';
  let hostOrigin;

  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has('gcTargetEnv')) {
    environment = urlParams.get('gcTargetEnv');
    sessionStorage.setItem('gc_environment', environment);
  } else {
    environment = sessionStorage.getItem('gc_environment') || environment;
  }

  if (urlParams.has('gcHostOrigin')) {
    hostOrigin = urlParams.get('gcHostOrigin');
    sessionStorage.setItem('gc_host_origin', hostOrigin);
  } else {
    sessionStorage.getItem('gc_host_origin');
  }

  // Configure Client App
  let transcriptApp = new ClientApp({
    gcHostOriginQueryParam: 'gcHostOrigin',
    gcTargetEnvQueryParam: 'gcTargetEnv'
  });

  // Configure and Authenticate Platform Client
  client.setPersistSettings(true, appName);
  client.setEnvironment(environment);

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
