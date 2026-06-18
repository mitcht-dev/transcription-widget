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

  const urlParams = new URLSearchParams(window.location.search);
  
  let targetEnv = '';
  let hostOrigin = '';

  // 1. Persist Target Environment
  if (urlParams.has('gcTargetEnv')) {
    targetEnv = urlParams.get('gcTargetEnv');
    sessionStorage.setItem('gc_target_env', targetEnv);
  } else {
    targetEnv = sessionStorage.getItem('gc_target_env') || targetEnv;
  }

  // 2. Persist Host Origin
  if (urlParams.has('gcHostOrigin')) {
    hostOrigin = urlParams.get('gcHostOrigin');
    sessionStorage.setItem('gc_host_origin', hostOrigin);
  } else {
    hostOrigin = sessionStorage.getItem('gc_host_origin');
  }

  // 3. The Magic Trick: Reconstruct the URL for the Client App SDK
  // If we are returning from auth, put the params back in the URL so ClientApp can find them.
  if (!urlParams.has('gcHostOrigin') && hostOrigin) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('gcTargetEnv', targetEnv);
    newUrl.searchParams.set('gcHostOrigin', hostOrigin);
    window.history.replaceState(null, '', newUrl.toString());
  }

  // 4. Configure Client App
  let transcriptApp = new ClientApp({
    gcHostOriginQueryParam: 'gcHostOrigin',
    gcTargetEnvQueryParam: 'gcTargetEnv'
  });

  // 5. Configure and Authenticate Platform Client
  client.setPersistSettings(true, appName);
  client.setEnvironment('usw2.pure.cloud');

  debugger;

  return client.loginPKCEGrant(clientId, redirectUri)
    .then(data => {
      console.log('TESTING Authentication Successful!', data);
      
      // Pro-Tip: Clean the auth code out of the URL. 
      // If a user refreshes the page later, the SDK will try to reuse the expired code and fail.
      window.history.replaceState(null, '', redirectUri);
    })
    .catch(err => console.log('TESTING Authentication Failed:', err));
}

function initializeWidget() {
  console.log("TESTING Widget script is running...");

  setupGenesysClients()
    .then(() => {

    })
    .catch(err => console.log(`TESTING ${err}`));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWidget);
} else {
  initializeWidget();
}
