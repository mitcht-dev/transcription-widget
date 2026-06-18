const clientId = "85c16c77-dca7-4d60-b67a-6f09658aa043";
const redirectUri = 'https://mitcht-dev.github.io/transcription-widget/';

const appName = 'transcriptApp';
const qParamLanguage = 'language';
const qParamEnvironment = 'environment';
const qParamConversationId = 'gcConversationId';

// Default values are assigned but values should 
// be set on the function 'assignConfiguration'
let language = 'en-us';
let environment = 'mypurecloud.com';

let userDetails = null;
let conversationId = null;

/**
 * Configure both the Platform SDK and the Client App SDK
 */
function setupGenesysClients() {
  const client = platformClient.ApiClient.instance;
  const usersApi = new platformClient.UsersApi();

  // Configure Client App
  let ClientApp = window.purecloud.apps.ClientApp;
  let transcriptApp = new ClientApp({
    pcEnvironment: environment
  });

  // Configure and Authenticate Platform Client
  client.setPersistSettings(true, appName);
  client.setEnvironment(environment);

  return client.loginPKCEGrant(clientId, redirectUri)
    .then(data => usersApi.getUsersMe())
    .then(data => {
      userDetails = data;

      transcriptApp.alerting.showToastPopup(
        `Hi ${userDetails.name}`,
        'Never gonna give you up, never gonna let you down 😊'
      );
    })
    .catch(err => console.error('Authentication Failed:', err));
}

/**
 * Assign the language and environment for the app first through
 * the query parameters. But if non-existent, attempt to get
 * it from localStorage. If none, use default values.
 */
function assignConfiguration() {
  let url = new URL(window.location);
  let searchParams = new URLSearchParams(url.search);

  if (searchParams.has(qParamLanguage)) {
    language = searchParams.get(qParamLanguage);
    localStorage.setItem(`${appName}_language`, language);
  } else {
    let local_lang = localStorage.getItem(`${appName}_language`);
    if (local_lang) language = local_lang;
  }

  if (searchParams.has(qParamEnvironment)) {
    environment = searchParams.get(qParamEnvironment);
    localStorage.setItem(`${appName}_environment`, environment);
  } else {
    let local_env = localStorage.getItem(`${appName}_environment`);
    if (local_env) environment = local_env;
  }

  if (searchParams.has(qParamConversationId)) {
    conversationId = searchParams.get(qParamConversationId);
  }
}

function initializeWidget() {
  console.log("Widget script is running...");
  assignConfiguration();
  
  console.log(`environment: ${environment}`);
  console.log(`language: ${language}`);

  setupGenesysClients()
    .then(() => {
      if(userDetails) {
        document.getElementById('span_environment').innerText = environment;
        document.getElementById('span_language').innerText = language;
        document.getElementById('span_name').innerText = userDetails.name;
        console.log('Finished setup.');
      }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
} else {
    initializeWidget();
}
