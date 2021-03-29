const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kntbw.mongodb.net/book?retryWrites=true&w=majority`;

const port = 5000

const app = express()

app.use(cors());
app.use(bodyParser.json());


const serviceAccount = require("./configs/innate-beacon-229300-firebase-adminsdk-t1nmw-aa89a94a82.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});






const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const bookings = client.db("book").collection("hotelBook");

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        console.log(newBooking);

    })

    app.get('/booking', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer')) {
            const idToken = bearer.split(' ')[1];
            // console.log({ idToken });

            admin.auth().verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    // console.log(tokenEmail, queryEmail);

                    if (tokenEmail == queryEmail) {
                        bookings.find({ email: queryEmail })
                            .toArray((err, documents) => {
                                res.send(documents);

                            })

                    }
                    else {
                        res.status(401).send('Un Authorized access')
                    }
                })
                .catch((error) => {
                    res.status(401).send('Un Authorized access')
                });

        }
        else {
            res.status(401).send('Un Authorized access')
        }
    })




});




// app.get('/', (req, res) => {
//     res.send('Hello World!')
// })

app.listen(port)