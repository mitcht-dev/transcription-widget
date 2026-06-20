import platformClient from 'purecloud-platform-client-v2';
import ClientApp from 'purecloud-client-app-sdk';

const clientId = '85c16c77-dca7-4d60-b67a-6f09658aa043';
const redirectUri = window.location.origin + '/auth.html';
const environment = 'usw2.pure.cloud';

console.log("TESTING: Step 1 - Script loaded and imports executed.");

try {
  const client = platformClient.ApiClient.instance;
  console.log("TESTING: Step 2 - platformClient instantiated successfully.");

  const transcriptApp = new ClientApp({
    gcHostOriginQueryParam: 'gcHostOrigin',
    gcTargetEnvQueryParam: 'gcTargetEnv',
  });
  console.log("TESTING: Step 3 - ClientApp instantiated successfully.");

  client.setEnvironment(environment);

  let pkceVerifier = null;

  async function init() {
    document.getElementById('loginBtn').addEventListener('click', handleLoginClick);
  }

  async function handleLoginClick() {
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
    if (event.origin !== window.location.origin) return;

    if (event.data.type === 'oauth_code') {
      window.removeEventListener('message', authListener);
      document.getElementById('status').innerText = "Exchanging token...";

      await exchangeCodeForToken(event.data.code);
    }
  }

  async function exchangeCodeForToken(authCode) {
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

        client.setAccessToken(data.access_token);

        document.getElementById('status').innerText = "Successfully Authenticated!";
        document.getElementById('loginBtn').style.display = 'none';

        runAppLogic();
      } else {
        throw new Error(data.error_description || "Token exchange failed");
      }
    } catch (error) {
      console.error("Auth Error:", error);
      document.getElementById('status').innerText = "Failed to authenticate.";
    }
  }

  // --- STEP 4: Start doing Genesys things ---
  async function runAppLogic() {
    const usersApi = new platformClient.UsersApi();

    try {
      const me = await usersApi.getUsersMe();
      document.getElementById('status').innerText = `Welcome, ${me.name}!`;

      // Check if we are currently looking at an interaction
      if (myClientApp.interactionId) {
        console.log(`Agent is currently on Interaction ID: ${myClientApp.interactionId}`);
        // You can now query the Conversations API with this ID
      }
    } catch (err) {
      console.error("API Error", err);
    }
  }

  init();

} catch (e) {
  console.error("TESTING: Error", e.message, e);
}
