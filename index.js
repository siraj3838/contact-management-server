const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(cors({
    origin: [
        'http://localhost:5173'
        // 'https://weshop-98979.web.app',
        // 'https://weshop-98979.firebaseapp.com'
    ],
    credentials: true
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hq29e8f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const contactCollection = client.db('contactDB').collection('contact');

    app.post('/contacts', async(req, res)=>{
        const contact = req.body;
        // console.log(contact);
        const result = await contactCollection.insertOne(contact);
        res.send(result);
    })
    app.get('/contacts', async (req, res) => {
        const filter = req.query;
        const query = {};
        const options = {
            sort: {
                date: filter.sort == 'asc' ? -1 : 1
            }
        }
        const result = await contactCollection.find(query,options).toArray();
        res.send(result);
    })

    app.put('/contacts/:id', async (req, res) => {
        const id = req.params.id;
        const contact = req.body;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateContact = {
            $set: {
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                address: contact.address,
                photo: contact.photo,
                date: contact.date
            }
        }
        const result = await contactCollection.updateOne(filter, updateContact, options);
        res.send(result);
    })


    app.delete('/contacts/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await contactCollection.deleteOne(query);
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Contact Management Server Running');
})
app.listen(port, () => {
    console.log(`Contact Management Running From ${port}`);
})
