const express = require("express");
const cors = require('cors');
const jwt = require('jsonwebtoken')
require("dotenv").config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: ['https://hero-challenge3.web.app', 'http://localhost:5173'] }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Meals server is running")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ouykoaw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const verifyToken = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    console.log(authorization)
    if (!authorization) return res.status(403).send({ error: true, message: 'No token privided.' })
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, decode) => {
      if (err) return res.status(403).send({ error: 1, message: "Failed to authenticate token." })
      req.decode = decode;
      next();
    })
  } catch (error) {
    console.log(error)
  }
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const document2 = client.db("Elite-foods").collection("Category-icons");
    const document4 = client.db("Elite-foods").collection("Feature-meals");
    const document7 = client.db("Elite-foods").collection("Category-meals");
    const document8 = client.db("Elite-foods").collection("Public-post");
    const document9 = client.db("Elite-foods").collection("User-Contact-Data");
    // const document = client.db("Elite-foods").collection("Foods");
    // const document3 = client.db("Elite-foods").collection("Populer-meals");
    // const document5 = client.db("Elite-foods").collection("Cook-book");
    // const document6 = client.db("Elite-foods").collection("Ingredients");

    //Get Method Start_________________________

    app.get("/feature", async (req, res) => {
      try {
        const result = await document4.find().toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.get("/onDemand", async (req, res) => {
      try {
        const result = await document4.find({ populerity: { $eq: 'ON-DEMAND' } }).toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.get("/cFoods", async (req, res) => {
      try {
        const result = await document2.find().toArray();
        res.send(result)
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    })

    app.get("/populer", async (req, res) => {
      try {
        const result = await document4.find({ populerity: { $eq: 'POPULAR' } }).toArray();
        res.send(result)
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    })

    app.get("/meal/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await document4.findOne(query);
        res.send(result)
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    })

    app.get("/categoryMeals", async (req, res) => {
      try {
        const result = await document7.find().toArray();
        res.send(result)
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    })

    app.get("/categoryMeals/:id", async (req, res) => {
      try {
        const categoryId = req.params.id;
        const result = await document7.find({ category_id: categoryId }).toArray();
        res.send(result)
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    })

    app.get("/singleCategoryMeals/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await document7.findOne(query);
        res.send(result)
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    })


    app.get("/public", verifyToken, async (req, res) => {
      try {
        const result = await document8.find().toArray();
        res.send(result)
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    })

    app.get("/singlePublicMeals/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await document8.findOne(query);
        res.send(result)
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    })



    app.get("/myUpload", verifyToken, async (req, res) => {
      try {
        let query = {};
        if (req.query?.uid) {
          query.uid = req.query.uid
        }

        //sort method.....
        let sortCriteria = {};
        if (req.query?.sort) {
          const parsedSort = JSON.parse(req.query.sort);
          sortCriteria = parsedSort;
        }
        const result = await document8.find(query).sort(sortCriteria).toArray();
        res.send(result)
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    })
    //Get Method End_________________________



    // Post Method Start_________________________

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '1h' });
      res.send({ token })
    })

    // app.post("/feature", async (req, res) => {
    //   const feature = req.body;
    //   const result = await document4.insertOne(feature);
    //   res.send(result)
    // })

    // app.post("/categoryMeals", async (req, res) => {
    //   const category = req.body;
    //   const result = await document7.insertOne(category);
    //   res.send(result)
    // })

    //Public can add their meal items using this post method
    app.post("/public", async (req, res) => {
      try {
        const public = req.body;
        const result = await document8.insertOne(public);
        res.send(result)
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    })

    app.post("/contact", async (req, res) => {
      try {
        const contact = req.body;
        const result = await document9.insertOne(contact);
        res.send(result)
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    })


    // app.post("/meals", async (req, res) => {
    //   const meals = req.body;
    //   const result = await document.insertOne(meals);
    //   res.send(result);
    // })

    // app.post("/populer", async (req, res) => {
    //   const populer = req.body;
    //   const result = await document3.insertOne(populer);
    //   res.send(result)
    // })

    // app.post("/cookbook", async (req, res) => {
    //   const cookBook = req.body;
    //   const result = await document5.insertOne(cookBook);
    //   res.send(result)
    // })

    // app.post("/ingredients", async (req, res) => {
    //   const ingredients = req.body;
    //   const result = await document6.insertOne(ingredients);
    //   res.send(result)
    // })


    // Post Method End_________________________

    // Pacth Method Start_________________________
    app.patch("/updateMeal/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const meals = req.body;
      const updatedMeals = {
        $set: {
          title: meals.title,
          description: meals.description,
          duration: meals.duration,
          price: meals.price,
          recipeImage: meals.recipeImage,
        }
      }
      const result = await document8.updateOne(query, updatedMeals);
      res.send(result);
    })

    //Put Method End_________________________


    //Delete Method Start_________________________
    app.delete("/deleteMeal/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await document8.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    })
    // Delete Method End_________________________

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})