async function readNfcTag() {
       if ('NDEFReader' in window) {
         try {
           const ndef = new NDEFReader();
           await ndef.scan();
           ndef.onreading = async ({ serialNumber }) => {
             document.getElementById('nfc-tag-id').value = serialNumber;
             const user = await auth0Client.getUser();
             await fetch('/api/update-nfc', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json', 'X-Auth0-ID': user.sub },
               body: JSON.stringify({ nfcTagId: serialNumber }),
             });
             showToast({ title: 'Success', description: 'NFC tag scanned and linked' });
           };
         } catch (error) {
           showToast({ title: 'Error', description: 'Failed to scan NFC tag' });
         }
       } else {
         showToast({ title: 'Error', description: 'Web NFC not supported' });
       }
}
