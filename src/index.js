import platformClient from 'purecloud-platform-client-v2';
import ClientApp from 'purecloud-client-app-sdk';

console.log("TESTING: Step 1 - Script loaded and imports executed.");

try {
  const client = platformClient.ApiClient.instance;
  console.log("TESTING: Step 2 - platformClient instantiated successfully.");

  const app = new ClientApp({
    gcHostOriginQueryParam: 'gcHostOrigin',
    gcTargetEnvQueryParam: 'gcTargetEnv'
  });
  console.log("TESTING: Step 3 - ClientApp instantiated successfully.");

} catch (error) {
  console.error("TESTING: Error", error.message, error);
}