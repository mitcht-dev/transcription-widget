import platformClient from 'purecloud-platform-client-v2';
import ClientApp from 'purecloud-client-app-sdk';

const qConversationIdQueryParam = 'gcConversationId';

const clientId = '85c16c77-dca7-4d60-b67a-6f09658aa043';
const redirectUri = 'https://mitcht-dev.github.io/transcript-widget/';
const environment = 'usw2.pure.cloud';
const TOKEN_KEY = 'genesys_transcript_tkn';
console.log('TESTING: redirectUri: ', redirectUri);

console.log("TESTING: Script loaded and imports executed.");

const urlParams = new URLSearchParams(window.location.search);
let conversationId = null;

if (urlParams.has(qConversationIdQueryParam)) {
  conversationId = urlParams.get(qConversationIdQueryParam);
  sessionStorage.setItem('gc_conversation_id', conversationId);
} else {
  conversationId = sessionStorage.getItem('gc_conversation_id');
}
console.log('TESTING: Conversation ID: ', conversationId);

let websocket;
let pingInterval;

let userName;

try {
  const client = platformClient.ApiClient.instance;
  console.log("TESTING: platformClient instantiated successfully.");

  const transcriptApp = new ClientApp({
    gcHostOriginQueryParam: 'gcHostOrigin',
    gcTargetEnvQueryParam: 'gcTargetEnv',
  });
  console.log("TESTING: ClientApp instantiated successfully.");

  client.setEnvironment(environment);

  let pkceVerifier = null;

  async function init() {
    const savedToken = sessionStorage.getItem(TOKEN_KEY);

    if (savedToken) {
      document.getElementById('status').innerText = "Validating session...";

      client.setAccessToken(savedToken);
      const usersApi = new platformClient.UsersApi();

      try {
        await usersApi.getUsersMe();

        console.log("Found valid existing token. Skipping login popup.");

        document.getElementById('loginBtn').style.display = 'none';

        runAppLogic();
        return;

      } catch (error) {
        console.warn("Saved token was expired or invalid. Requiring new login.");
        sessionStorage.removeItem(TOKEN_KEY);
      }
    }

    document.getElementById('loginBtn').addEventListener('click', handleLoginClick);
  }

  async function handleLoginClick() {
    console.log('TESTING: handleLoginClick started');
    document.getElementById('status').innerText = "Opening secure login window...";

    const popupWidth = 500;
    const popupHeight = 600;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    const popup = window.open('', 'GenesysAuth', `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`);

    pkceVerifier = client.generatePKCECodeVerifier(128);
    const codeChallenge = await client.computePKCECodeChallenge(pkceVerifier);

    const authUrl = `https://login.${environment}/oauth/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`;

    popup.location.href = authUrl;

    window.addEventListener('message', authListener);
  }

  async function authListener(event) {
    console.log('TESTING: authListener started');
    if (event.origin !== window.location.origin) return;

    if (event.data.type === 'oauth_code') {
      window.removeEventListener('message', authListener);
      document.getElementById('status').innerText = "Exchanging token...";

      await exchangeCodeForToken(event.data.code);
    }
  }

  async function exchangeCodeForToken(authCode) {
    console.log('TESTING: exchangeCodeForToken started');
    if (!pkceVerifier) {
      document.getElementById('status').innerText = "Error: Verifier lost.";
      return;
    }

    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('code', authCode);
    body.append('client_id', clientId);
    body.append('redirect_uri', redirectUri);
    body.append('code_verifier', pkceVerifier);

    try {
      const response = await fetch(`https://login.${environment}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      });

      const data = await response.json();

      if (data.access_token) {
        pkceVerifier = null;

        sessionStorage.setItem(TOKEN_KEY, data.access_token);

        client.setAccessToken(data.access_token);

        document.getElementById('status').innerText = "Successfully Authenticated!";
        document.getElementById('loginBtn').style.display = 'none';

        runAppLogic();
      } else {
        throw new Error(`TESTING: ${data.error_description || "Token exchange failed"}`);
      }
    } catch (error) {
      console.error("TESTING: Auth Error:", error);
      document.getElementById('status').innerText = "Failed to authenticate.";
    }
  }

  async function runAppLogic() {
    console.log('TESTING: runAppLogic started');
    const usersApi = new platformClient.UsersApi();

    try {
      const me = await usersApi.getUsersMe();
      //document.getElementById('status').innerText = `Welcome, ${me.name}!`;

      userName = me.name;

      document.getElementById('login').visibility = 'none';

      listenToTranscript();
    } catch (err) {
      console.error("TESTING: API Error", err);
    }
  }

  async function listenToTranscript() {
    console.log('TESTING: listenToTranscript started');
    let notificationsInstance = new platformClient.NotificationsApi();

    notificationsInstance.postNotificationsChannels()
      .then((data) => {
        let { id: channelId, connectUri } = data;

        console.log(`TESTING: postNotificationsChannels success! data: ${JSON.stringify(data, null, 2)}`);

        websocket = new WebSocket(connectUri);
        websocket.addEventListener("open", onWebsocketOpen);
        websocket.addEventListener("message", onWebsocketMessage);
        websocket.addEventListener("error", onWebsocketError);
        websocket.addEventListener("close", onWebsocketClose);

        const subscriptionTopic = `v2.conversations.${conversationId}.transcription`;
        let topic = [{ id: subscriptionTopic }];

        notificationsInstance.putNotificationsChannelSubscriptions(channelId, topic)
          .then((data) => {
            console.log(`TESTING: putNotificationsChannelSubscriptions success! data: ${JSON.stringify(data, null, 2)}`);
          })
          .catch((err) => {
            console.log('TESTING: There was a failure calling putNotificationsChannelSubscriptions');
            console.error(err);
          });
      })
      .catch((err) => {
        console.log('TESTING: There was a failure calling postNotificationsChannels');
        console.error(err);
      });
  }

  function onWebsocketOpen() {
    console.log("TESTING: Websocket connected");
    pingInterval = setInterval(() => {
      websocket.send({ "message": "ping" });
    }, 1000);
  }

  function onWebsocketMessage(e) {
    const message = extractTranscripts(e.data);
    if (message) {
      console.log(`TESTING: Websocket message ${message}`);
    }

    const newLine = document.createElement('p');
    newLine.innerText = message;

    document.getElementById('conversationTranscript').append(newLine);
  }

  function onWebsocketError(e) {
    console.log(`TESTING: Websocket error ${e}`);
  }

  function onWebsocketClose() {
    console.log(`TESTING: Websocket closed`);
    pingInterval.clear();
  }

  function extractTranscripts(data) {
    let message;
    try {
      message = JSON.parse(data)?.eventBody;
    } catch {
      message = data?.eventBody;
    }
    return message?.transcripts?.flatMap(t => `${t.channel === 'internal' ? me.name : t.channel}: ${t.alternatives[0].transcript}`)
      .join('\n');
  }

  init();

} catch (e) {
  console.error("TESTING: Error", e.message, e);
}
