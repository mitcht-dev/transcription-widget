import platformClient from 'purecloud-platform-client-v2';
import ClientApp from 'purecloud-client-app-sdk';

const clientId = "85c16c77-dca7-4d60-b67a-6f09658aa043";
const redirectUri = 'https://mitcht-dev.github.io/transcription-widget/';

const appName = 'Transcript App';
const qParamLanguage = 'gcLangTag';
const qParamHostOrigin = 'gcHostOrigin';
const qParamConversationId = 'gcConversationId';

// Default values are assigned but values should 
// be set on the function 'assignConfiguration'
let language = 'en-us';
let environment = 'usw2.pure.cloud';

/**
 * Configure both the Platform SDK and the Client App SDK
 */
function setupGenesysClients() {
  const client = platformClient.ApiClient.instance;
  const usersApi = new platformClient.UsersApi();

  // Configure Client App
  let transcriptApp = new ClientApp({
    gcHostOriginQueryParam: 'gcHostOrigin',
    gcTargetEnvQueryParam: 'gcTargetEnv'
  });

  console.log('TESTING', environment);

  environment = transcriptApp.gcEnvironment;
  console.log('TESTING', environment);

  // Configure and Authenticate Platform Client
  client.setPersistSettings(true, appName);
  client.setEnvironment(environment);

  return client.loginPKCEGrant(clientId, redirectUri)
    .then(data => 
      console.log('Success message!: ', qParamConversationId)
    )
    .catch(err => console.error('Authentication Failed:', err));
}

function initializeWidget() {
  console.log("Widget script is running...");
  
  console.log(`environment: ${environment}`);
  console.log(`language: ${language}`);

  setupGenesysClients()
    .then(() => {

    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
} else {
    initializeWidget();
}
