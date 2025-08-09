async function loadDashboard() {
       const isAuthenticated = await auth0Client.isAuthenticated();
       if (!isAuthenticated) {
         showToast({ title: 'Error', description: 'Please log in to access the dashboard' });
         navigate('home');
         return;
       }
       const user = await auth0Client.getUser();
       document.getElementById('user-info').innerHTML = `
         <p>Name: ${user.name}</p>
         <p>Email: ${user.email}</p>
         <p>Patreon Tier: ${user.patreonTier || 'Free'}</p>
       `;
       const response = await fetch('/api/user', {
         headers: { 'X-Auth0-ID': user.sub },
       });
       const userData = await response.json();
       document.getElementById('pet-management').innerHTML = userData.dogs
         .map(dog => `
           <div class="card">
             <h3>${dog.name}</h3>
             <p>${dog.description || 'No description'}</p>
             <button class="btn-primary" onclick="navigateToPet('${dog.dogId}')">View Profile</button>
           </div>
         `).join('');
       document.getElementById('location-table').innerHTML = userData.locations
         .map(loc => `
           <tr class="table-row">
             <td class="table-cell">${loc.dogName}</td>
             <td class="table-cell">${loc.latitude}</td>
             <td class="table-cell">${loc.longitude}</td>
             <td class="table-cell">${new Date(loc.timestamp * 1000).toLocaleString()}</td>
           </tr>
         `).join('');
       if (userData.qrCodeUrl) {
         document.getElementById('qr-group').style.display = 'block';
         document.getElementById('qr-code').src = userData.qrCodeUrl;
       }
       if (userData.role === 'admin') {
         document.getElementById('admin-tab').style.display = 'block';
         const allUsers = await fetch('/api/users').then(res => res.json());
         document.getElementById('admin-table').innerHTML = allUsers.map(u => `
           <tr class="table-row">
             <td class="table-cell">${u.name}</td>
             <td class="table-cell">${u.email}</td>
             <td class="table-cell">${u.dogs.map(d => d.name).join(', ')}</td>
             <td class="table-cell">${u.patreonTier}</td>
           </tr>
         `).join('');
       } else {
         document.getElementById('admin-tab').style.display = 'none';
       }
     }

     async function navigateToPet(dogId) {
       window.history.pushState({}, '', `/dog/${dogId}`);
       navigate('pet-profile');
     }
