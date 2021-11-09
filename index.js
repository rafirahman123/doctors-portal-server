const express = require('express')
const app = express();
const cors = require('cors');
// const admin = require("firebase-admin");
require('dotenv').config();
const { MongoClient } = require('mongodb');


const port = process.env.PORT || 5000;


// JWT Token part
// const serviceAccount = require('./doctors-portal-firebase-adminsdk.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3fgg4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri);

// async function verifyToken(req, res, next) {
//     if (req.headers?.authorization?.startWith('Bearer ')) {
//         const token = req.headers.authorization.split(' ')[1];

//         try {
//             const decodedUser = await admin.auth().verifyIdToken(token);
//             req.decodedEmail = decodedUser.email;
//         }
//         catch {

//         }
//     }
//     next();
// }

async function run() {
    try {
        await client.connect();
        console.log('database connected successfully');
        const database = client.db('doctors_portal');
        const appointmentsCollection = database.collection('appintments');
        const usersCollection = database.collection('users');

        // GET appointments
        app.get('/appintments', async (req, res) => {
            const email = req.query.email;
            const date = new Date(req.query.date).toLocaleDateString();
            // console.log(date);
            const query = { email: email, date: date }
            // console.log(query);
            const cursor = appointmentsCollection.find(query);
            const appointments = await cursor.toArray();
            res.json(appointments);
        });

        //appointment POST
        app.post('/appintments', async (req, res) => {
            appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment);
            // console.log(result);
            res.json(result)
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        // database user POST
        app.post('/users', async (req, res) => {
            user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        // google signin data save or update by PUT
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        // make admin role PUT API (verifyToken, async er ager part 101 line)
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // console.log('decodedEmail', req.decodedEmail);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result);

        });

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Doctors Portal!')
})

app.listen(port, () => {
    console.log(` listening at:${port}`)
})