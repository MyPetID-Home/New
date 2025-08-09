async function loadPetProfile() {
       document.getElementById('pet-loading').classList.remove('hidden');
       document.getElementById('pet-content').classList.add('hidden');
       document.getElementById('pet-error').classList.add('hidden');
       try {
         const dogId = window.location.pathname.split('/').pop();
         const user = await auth0Client.getUser();
         const response = await fetch('/api/user', {
           headers: { 'X-Auth0-ID': user.sub },
         });
         const userData = await response.json();
         const dog = userData.dogs.find(d => d.dogId === dogId);
         if (!dog) {
           document.getElementById('pet-loading').classList.add('hidden');
           document.getElementById('pet-error').classList.remove('hidden');
           showToast({ title: 'Error', description: 'Pet not found' });
           return;
         }
         document.getElementById('pet-name').textContent = dog.name;
         document.getElementById('pet-name-about').textContent = dog.name;
         document.getElementById('pet-details').textContent = `${dog.breed} • ${dog.age} • ${dog.neutered}`;
         if (dog.photoUrl) {
           document.getElementById('pet-photo').src = dog.photoUrl;
           document.getElementById('pet-photo').classList.remove('hidden');
           document.getElementById('pet-photo-placeholder').classList.add('hidden');
         }
         document.getElementById('pet-description').textContent = dog.description || 'No description available.';
         document.getElementById('pet-age').textContent = dog.age || 'Unknown';
         document.getElementById('pet-weight').textContent = dog.weight || 'Unknown';
         document.getElementById('pet-coat').textContent = dog.coat || 'Unknown';
         document.getElementById('pet-eye-color').textContent = dog.eyeColor || 'Unknown';
         document.getElementById('pet-personality').textContent = dog.personality || 'No personality info.';
         document.getElementById('pet-loves').textContent = dog.loves || 'No loves info.';
         document.getElementById('pet-quirks').textContent = dog.quirks || 'No quirks info.';
         document.getElementById('pet-medical-info').textContent = dog.medicalInfo ? JSON.stringify(dog.medicalInfo) : 'No medical info.';
         document.getElementById('pet-socials').innerHTML = dog.socials ? Object.entries(dog.socials).map(([k, v]) => `<a href="${v}">${k}</a>`).join('<br>') : 'No socials.';
         if (userData.patreonTier !== 'free') {
           await captureLocation(dog.dogId, userData.patreonTier);
         }
         document.getElementById('pet-loading').classList.add('hidden');
         document.getElementById('pet-content').classList.remove('hidden');
       } catch (error) {
         document.getElementById('pet-loading').classList.add('hidden');
         document.getElementById('pet-error').classList.remove('hidden');
         showToast({ title: 'Error', description: 'Failed to load pet profile' });
       }
     }

     async function captureLocation(dogId, patreonTier) {
       if (patreonTier === 'free') return;
       if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(async (position) => {
           const { latitude, longitude } = position.coords;
           await fetch('/api/update-location', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               dogId,
               deviceName: navigator.userAgent,
               latitude,
               longitude,
               timestamp: Math.floor(Date.now() / 1000),
               active: true,
             }),
           });
           document.getElementById('location-map').style.display = 'block';
           document.getElementById('location-map').src = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
           showToast({ title: 'Success', description: 'Location updated' });
         }, () => {
           showToast({ title: 'Error', description: 'Failed to get location' });
         });
       } else {
         showToast({ title: 'Error', description: 'Geolocation not supported' });
       }
     }

     async function reportFound() {
       const petName = document.getElementById('pet-name').textContent;
       await fetch('/api/report-found', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ petName }),
       });
       showToast({ title: 'Report Found', description: `Reported ${petName} as found` });
     }

     async function contactOwner() {
       const petName = document.getElementById('pet-name').textContent;
       await fetch('/api/contact-owner', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ petName }),
       });
       showToast({ title: 'Contact Owner', description: `Contacting owner of ${petName}` });
     }
