let isLoggedIn = false;
     let auth0Client;

     async function initializeAuth0() {
       auth0Client = await createAuth0Client({
         domain: 'your-auth0-domain.auth0.com', // Replace with your Auth0 domain
         clientId: 'your-client-id', // Replace with your Auth0 client ID
         redirectUri: 'https://mypetid-home.github.io/oauth/auth0-callback',
         cacheLocation: 'localstorage',
       });
     }

     function showToast({ title, description }) {
       const id = Date.now();
       const toast = document.createElement('div');
       toast.className = 'toast';
       toast.innerHTML = `
         <div>
           ${title ? `<h4>${title}</h4>` : ''}
           ${description ? `<p>${description}</p>` : ''}
           <button class="btn-ghost" onclick="this.parentElement.parentElement.remove()"><i class="fa fa-times"></i></button>
         </div>
       `;
       document.getElementById('toast-container').appendChild(toast);
       setTimeout(() => toast.remove(), 5000);
     }

     function showTab(tabId) {
       document.querySelectorAll('.tabs-content').forEach(content => content.classList.add('hidden'));
       document.querySelectorAll('.tabs-trigger').forEach(trigger => trigger.classList.remove('active'));
       document.getElementById(tabId).classList.remove('hidden');
       document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
     }

     async function navigate(page) {
       const content = document.getElementById('content');
       const title = document.getElementById('page-title');
       document.getElementById('toast-container').style.display = 'none';
       content.innerHTML = '<div class="card"><div class="card-header"><h1>Loading...</h1></div><div class="card-content"><p>Loading...</p></div></div>';
       switch (page) {
         case 'home':
           title.textContent = 'Home';
           content.innerHTML = await fetch('/pages/home/index.html').then(res => res.text());
           break;
         case 'dashboard':
           const isAuthenticated = await auth0Client.isAuthenticated();
           if (!isAuthenticated) {
             showToast({ title: 'Error', description: 'Please log in to access the dashboard' });
             navigate('home');
             return;
           }
           title.textContent = 'Dashboard';
           content.innerHTML = await fetch('/pages/dashboard/index.html').then(res => res.text());
           await loadDashboard();
           break;
         case 'pet-editor':
           title.textContent = 'Add/Edit Pet';
           content.innerHTML = await fetch('/pages/pet-editor/index.html').then(res => res.text());
           break;
         case 'pet-profile':
           title.textContent = 'Pet Profile';
           content.innerHTML = await fetch('/pages/pet-profile/index.html').then(res => res.text());
           await loadPetProfile();
           break;
         case 'admin':
           const user = await fetch('/api/user', {
             headers: { 'X-Auth0-ID': (await auth0Client.getUser()).sub },
           }).then(res => res.json());
           if (user.role !== 'admin') {
             showToast({ title: 'Error', description: 'Access denied' });
             navigate('home');
             return;
           }
           title.textContent = 'Admin Dashboard';
           content.innerHTML = await fetch('/pages/admin/index.html').then(res => res.text());
           await loadAdmin();
           break;
         case 'contact':
           title.textContent = 'Contact';
           content.innerHTML = await fetch('/pages/contact/index.html').then(res => res.text());
           break;
         case 'location':
           title.textContent = 'Location';
           content.innerHTML = await fetch('/pages/location/index.html').then(res => res.text());
           break;
         case 'medical':
           title.textContent = 'Medical';
           content.innerHTML = await fetch('/pages/medical/index.html').then(res => res.text());
           break;
         case 'about':
           title.textContent = 'About Me';
           content.innerHTML = await fetch('/pages/about/index.html').then(res => res.text());
           break;
         case 'socials':
           title.textContent = 'Socials';
           content.innerHTML = await fetch('/pages/socials/index.html').then(res => res.text());
           break;
         case 'gallery':
           title.textContent = 'Gallery';
           content.innerHTML = await fetch('/pages/gallery/index.html').then(res => res.text());
           break;
         case 'report-lost':
           title.textContent = 'Report Lost';
           content.innerHTML = await fetch('/pages/report-lost/index.html').then(res => res.text());
           break;
         case 'project-info':
           title.textContent = 'Project Info';
           content.innerHTML = await fetch('/pages/project-info/index.html').then(res => res.text());
           break;
         case 'register':
           title.textContent = 'Register';
           content.innerHTML = await fetch('/pages/dashboard/index.html').then(res => res.text());
           await loadDashboard();
           break;
       }
     }

     async function logout() {
       await auth0Client.logout({ returnTo: 'https://mypetid-home.github.io' });
       isLoggedIn = false;
       showLoggedOutState();
       navigate('home');
     }

     function showLoggedInState() {
       document.getElementById('registerBtn').style.display = 'none';
       document.getElementById('dashboardBtn').style.display = 'block';
       document.getElementById('logoutBtn').style.display = 'block';
       document.getElementById('adminBtn').style.display = 'block';
     }

     function showLoggedOutState() {
       document.getElementById('registerBtn').style.display = 'block';
       document.getElementById('dashboardBtn').style.display = 'none';
       document.getElementById('logoutBtn').style.display = 'none';
       document.getElementById('adminBtn').style.display = 'none';
     }

     document.addEventListener('DOMContentLoaded', async () => {
       await initializeAuth0();
       if (window.location.search.includes('code=')) {
         await auth0Client.handleRedirectCallback();
         isLoggedIn = true;
         showLoggedInState();
         window.history.replaceState({}, '', window.location.pathname);
         navigate('dashboard');
       } else if (window.location.pathname.match(/^\/[a-zA-Z0-9]+$/)) {
         navigate('pet-profile');
       } else {
         navigate('home');
       }
     });
