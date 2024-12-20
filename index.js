const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ynxz4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const uri =
  "mongodb+srv://baler_backend:kahonbintezaman@cluster0.80ztv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// MongoDB Client Configuration
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the MongoDB server
    await client.connect();
    const userCollection = client.db("coffeeDB").collection("user");
    const coffeeCollection = client.db("all_coffee").collection("coffee");

    // GET endpoint to fetch all coffee
    app.get("/coffee", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      console.log(result);
      res.send(result);
    });

    // GET endpoint to fetch a single coffee by ID
    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const coffee = await coffeeCollection.findOne(query);
      if (coffee) {
        res.send(coffee);
      } else {
        res.status(404).send({ message: "Coffee not found" });
      }
    });

    // PUT endpoint to update a coffee by ID
    app.put("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedCoffee = req.body;
      const updateDoc = {
        $set: {
          name: updatedCoffee.name,
          chef: updatedCoffee.chef,
          supplier: updatedCoffee.supplier,
          taste: updatedCoffee.taste,
          category: updatedCoffee.category,
          details: updatedCoffee.details,
          photo: updatedCoffee.photo,
        },
      };
      const options = { upsert: true };

      try {
        const result = await coffeeCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        if (result.modifiedCount === 1 || result.upsertedCount === 1) {
          res.send({ message: "Coffee updated successfully", success: true });
        } else {
          res.status(404).send({ message: "Coffee not found", success: false });
        }
      } catch (error) {
        console.error("Error updating coffee:", error);
        res
          .status(500)
          .send({ message: "Failed to update coffee", success: false });
      }
    });

    // POST endpoint to add a new coffee
    app.post("/coffee", async (req, res) => {
      try {
        const newCoffee = req.body;
        console.log("Received new coffee:", newCoffee);
        const result = await coffeeCollection.insertOne(newCoffee);
        res.send(result);
      } catch (error) {
        console.error("Error inserting coffee:", error);
        res.status(500).send("Failed to add coffee.");
      }
    });

    // DELETE endpoint to delete a coffee by ID
    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Received ID to delete:", id);

      try {
        const query = { _id: new ObjectId(id) };
        const result = await coffeeCollection.deleteOne(query);

        if (result.deletedCount === 1) {
          console.log("Successfully deleted coffee:", id);
          res.send({ message: "Coffee deleted successfully", success: true });
        } else {
          console.log("No coffee found with the provided ID:", id);
          res.status(404).send({ message: "Coffee not found", success: false });
        }
      } catch (error) {
        console.error("Error deleting coffee:", error);
        res
          .status(500)
          .send({ message: "Failed to delete coffee", success: false });
      }
    });

    // GET endpoint to fetch all users
    app.get("/user", async (req, res) => {
      const cursor = userCollection.find();
      const users = await cursor.toArray();
      res.send(users);
    });

    // POST endpoint to add a new user
    app.post("/user", async (req, res) => {
      try {
        const user = req.body;
        console.log(user);
        const result = await userCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        console.error("Error inserting user:", error);
        res.status(500).send({ message: "Failed to add user." });
      }
    });

    // DELETE endpoint to delete a user by ID
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // Confirm connection with MongoDB
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

run().catch(console.dir);

// Basic root route
app.get("/", (req, res) => {
  res.send("Coffee-making server is running");
});

app.listen(port, () => {
  console.log(`Coffee server is running on port: ${port}`);
});
