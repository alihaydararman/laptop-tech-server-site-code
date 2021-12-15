const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//Midleware

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ecgrw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const run = async () => {
    try {
        await client.connect();
        const database = client.db("laptop_tech");
        const productCollection = database.collection("products");
        const userCollection = database.collection("users");
        const orderCollection = database.collection("orders");
        const reviewCollection = database.collection('review');
        const futureCollection = database.collection('futureProducts')


        // PUT single user [admin]
        app.put("/user/:email", async (req, res) => {
            const requester = req.goodUserEmail;
            const userEmail = req.params.email;

            if (requester) {
                const requesterUser = await userCollection.findOne({
                    email: requester
                })
                if (requesterUser.role == 'Admin') {
                    const filter = { email: userEmail };
                    const updateDoc = {
                        $set: {
                            role: 'Admin'
                        }
                    }
                    const result = await userCollection.updateOne(filter, updateDoc);
                    res.send(result)
                } else {
                    res.status(403).send('No permission')
                }
            }
        })

        // POST products
        app.post('/products', async (req, res) => {
            const product = req.body
            const result = await productCollection.insertOne(product);
            res.send(result)
        })

        // Get all products api
        app.get("/products", async (req, res) => {
            const products = await productCollection.find({}).toArray();
            res.send(products);
        });

        // GET one product api
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: Object(id) };
            const result = await productCollection.findOne(query);

            res.send(result);
        });

        // DELETE one products api
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: Object(id) }
            const result = await productCollection.deleteOne(filter);

            res.send(result);
        })

        // GET user api
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email
            const filter = { email: email };
            const user = await userCollection.findOne(filter);
            let admin = false;
            if (user?.role == "Admin") {
                admin = true;
            } else {
                admin = false;
            }
            res.send(admin);
        })

        // POST user api
        app.post("/user", async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        // PUT user api
        app.put("/user", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: user.name,
                    email: user.email,
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // POST order api
        app.post("/order", async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });

        // Get Order api
        app.get("/order", async (req, res) => {
            const email = req?.query?.email;
            const filter = { userEamil: email };
            let result
            if (email) {
                result = await orderCollection.find(filter).toArray();
            } else {
                result = await orderCollection.find({}).toArray();
            }
            res.send(result);
        });

        // PUT order api
        app.put('/order/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: Object(id) }
            const updateDoc = {
                $set: {
                    status: 'Approved'
                }
            }
            const result = await orderCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        // DELETE order api
        app.delete("/order/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: Object(id) };
            const result = await orderCollection.deleteOne(filter);
            res.send(result);
        });



        // POST review api
        app.post('/review', async (req, res) => {
            const review = req.body
            const result = await reviewCollection.insertOne(review);
            res.send(result)
        })


        //  GET review api
        app.get('/review', async (req, res) => {
            const result = await reviewCollection.find({}).toArray()
            res.send(result);
        })


        // DELETE review api
        app.delete('/review/:id', async (req, res) => {
            const id = req?.params?.id;
            const filter = { _id: Object(id) };
            const result = await reviewCollection.deleteOne(filter)
            res.send(result)
        })


        // Get future Products
        app.get('/futureProducts', async (req, res) => {
            const cursor = futureCollection.find({});
            const count = await cursor.count();
            const products = await cursor.toArray();

            res.send({ count, products });
        })



    } finally {
        // await client.close();
    }
};
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running laptop server');
});

app.listen(port, () => {
    console.log('running hpteck server', port)
})

