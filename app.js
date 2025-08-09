const express = require('express');
     const app = express();
     const fetch = require('node-fetch');
     const { MongoClient } = require('mongodb');

     app.use(express.json());
     app.use(express.static('.'));

     app.post('/api/register', async (req, res) => {
       const { auth0Id, email, patreonTier } = req.body;
       const client = new MongoClient(process.env.MONGO_URI);
       await client.connect();
       const db = client.db('locationDB');
       await db.collection(`user_${auth0Id}`).insertOne({
         auth0Id,
         email,
         patreonTier: patreonTier || 'free',
         patreonVerified: false,
         adminCreated: false,
         githubIssueId: null,
         dogs: [],
         locations: [],
       });
       const issue = await fetch('https://api.github.com/repos/MyPetID-Home/MyPetID-Home.github.io/issues', {
         method: 'POST',
         headers: {
           'Authorization': `token ${{ secrets.GITHUB_TOKEN }}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           title: `New User: ${email}`,
           body: `Auth0 ID: ${auth0Id}, Tier: ${patreonTier}`,
         }),
       }).then(res => res.json());
       await db.collection(`user_${auth0Id}`).updateOne({ auth0Id }, { $set: { githubIssueId: issue.number } });
       await client.close();
       res.json({ success: true });
     });

     app.post('/api/save-dog', async (req, res) => {
       const { auth0Id, dogId, name, breed, description, sex, neutered, age, weight, nfcTagId, profileUrl, qrCodeUrl } = req.body;
       const client = new MongoClient(process.env.MONGO_URI);
       await client.connect();
       const db = client.db('locationDB');
       await db.collection(`user_${auth0Id}`).updateOne(
         { auth0Id },
         { $push: { dogs: { dogId, name, breed, description, sex, neutered, age, weight, nfcTagId, profileUrl, qrCodeUrl } } }
       );
       await fetch('https://api.github.com/repos/MyPetID-Home/MyPetID-Home.github.io/contents/data/dogs.json', {
         method: 'PUT',
         headers: {
           'Authorization': `token ${{ secrets.GITHUB_TOKEN }}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           message: `Add dog ${name} for ${auth0Id}`,
           content: Buffer.from(JSON.stringify(req.body, null, 2)).toString('base64'),
           committer: { name: 'MyPetID Bot', email: 'bot@mypetid.com' },
         }),
       });
       await client.close();
       res.json({ success: true });
     });

     app.post('/api/update-location', async (req, res) => {
       const { auth0Id, dogId, latitude, longitude, timestamp } = req.body;
       const client = new MongoClient(process.env.MONGO_URI);
       await client.connect();
       const db = client.db('locationDB');
       await db.collection(`user_${auth0Id}`).updateOne(
         { auth0Id },
         { $push: { locations: { dogId, latitude, longitude, timestamp } } }
       );
       await client.close();
       res.json({ success: true });
     });

     app.get('/api/user', async (req, res) => {
       const auth0Id = req.headers['x-auth0-id'];
       const client = new MongoClient(process.env.MONGO_URI);
       await client.connect();
       const db = client.db('locationDB');
       const user = await db.collection(`user_${auth0Id}`).findOne({ auth0Id });
       await client.close();
       res.json(user);
     });

     app.get('/api/users', async (req, res) => {
       const client = new MongoClient(process.env.MONGO_URI);
       await client.connect();
       const db = client.db('locationDB');
       const users = await db.listCollections().toArray();
       const userData = [];
       for (const coll of users) {
         const user = await db.collection(coll.name).findOne({});
         userData.push(user);
       }
       await client.close();
       res.json(userData);
     });

     app.listen(3000, () => console.log('Server running on port 3000'));
