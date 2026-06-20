const urlParams = new URLSearchParams(window.location.search);
const authCode = urlParams.get('code');

if (authCode && window.opener) {
    window.opener.postMessage(
        { type: 'oauth_code', code: authCode }, 
        window.location.origin
    );
    window.close();
} else {
    document.body.innerText = "Authentication failed. You can close this window.";
}
