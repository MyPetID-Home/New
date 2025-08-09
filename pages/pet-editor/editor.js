function toggleValue(field, value) {
       document.querySelectorAll(`#${field}-group .toggle`).forEach(toggle => toggle.classList.remove('active'));
       document.querySelector(`[onclick="toggleValue('${field}', '${value}')"]`).classList.add('active');
       document.getElementById(`pet-${field}`).value = value;
     }

     async function handlePetSubmit(event) {
       event.preventDefault();
       const isAuthenticated = await auth0Client.isAuthenticated();
       if (!isAuthenticated) {
         showToast({ title: 'Error', description: 'Please log in to add a pet' });
         navigate('register');
         return;
       }
       if (!document.getElementById('agreement-checkbox').checked) {
         showToast({ title: 'Error', description: 'You must agree to the terms' });
         return;
       }
       const user = await auth0Client.getUser();
       const petData = {
         dogId: `dog-${Date.now()}`,
         name: document.getElementById('pet-name').value,
         breed: document.getElementById('pet-breed').value,
         description: document.getElementById('pet-description').value,
         sex: document.getElementById('pet-sex').value,
         neutered: document.getElementById('pet-neutered').value,
         age: document.getElementById('pet-age').value,
         weight: document.getElementById('pet-weight').value,
         nfcTagId: document.getElementById('nfc-tag-id').value || `NFC-${Date.now()}`,
         ownerEmail: user.email,
         ownerName: user.name,
         ownerPhone: user.phone_number || '',
         personality: '',
         loves: '',
         quirks: '',
         medicalInfo: {},
         socials: {},
         coat: '',
         eyeColor: '',
         isActive: true,
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
         profileUrl: `https://mypetid-home.github.io/dog/${Date.now()}`,
         qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?data=https://mypetid-home.github.io/dog/${Date.now()}&size=200x200`,
       };
       if (!petData.name || petData.name.length > 255) {
         showToast({ title: 'Error', description: 'Pet name is required and must be less than 255 characters' });
         return;
       }
       if (!petData.breed) {
         showToast({ title: 'Error', description: 'Breed is required' });
         return;
       }
       if (!petData.sex) {
         showToast({ title: 'Error', description: 'Sex is required' });
         return;
       }
       await fetch('/api/save-dog', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'X-Auth0-ID': user.sub },
         body: JSON.stringify(petData),
       });
       showToast({ title: 'Success', description: 'Pet saved successfully' });
       navigate('dashboard');
     }
