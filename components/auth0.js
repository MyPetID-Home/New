import { Auth0Client } from '@auth0/auth0-spa-js';
     const auth0 = new Auth0Client({
       domain: 'your-auth0-domain.auth0.com', // Replace with your Auth0 domain
       clientId: 'your-client-id', // Replace with your Auth0 client ID
       redirectUri: 'https://mypetid-home.github.io/oauth/auth0-callback',
       cacheLocation: 'localstorage',
     });

     async function registerUser() {
       if (!document.getElementById('agreement-checkbox').checked) {
         showToast({ title: 'Error', description: 'You must agree to the terms' });
         return;
       }
       await auth0.loginWithRedirect({ screen_hint: 'signup' });
     }

     async function loginUser() {
       await auth0.loginWithRedirect();
     }

     async function handleCallback() {
       await auth0.handleRedirectCallback();
       const user = await auth0.getUser();
       if (user) {
         await fetch('/api/register', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'X-Auth0-ID': user.sub },
           body: JSON.stringify({ auth0Id: user.sub, email: user.email, patreonTier: 'free' }),
         });
         isLoggedIn = true;
         showLoggedInState();
         navigate('dashboard');
       }
     }