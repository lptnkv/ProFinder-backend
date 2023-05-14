import express from "express";
import db from "../db/dbConnect.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

// List all jobs
router.get("/", async (req, res) => {
    let collection = await db.collection("jobs");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
});

// Job by id
router.get("/:id", async (req, res) => {
    let collection = await db.collection("jobs");
    let query = { _id: new ObjectId(req.params.id) };
    let result = await collection.findOne(query);

    if (!result) {
        res.send("Not found").status(404);
    }
    else {
        res.send(result).status(200);
    }
});

// Create a job
router.post("/", async (req, res) => {
    let newDocument = {
        name: req.body.name,
        position: req.body.position,
        level: req.body.level,
    };
    let collection = await db.collection("jobs");
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
});

// Update a job by id
router.patch("/:id", async (req, res) => {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
        $set: {
            name: req.body.name,
            position: req.body.position,
            level: req.body.level
        }
    };

    let collection = await db.collection("jobs");
    let result = await collection.updateOne(query, updates);

    res.send(result).status(200);
});

// Delete a job by id
router.patch("/:id", async (req, res) => {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
        $set: {
            name: req.body.name,
            position: req.body.position,
            level: req.body.level
        }
    };

    let collection = await db.collection("jobs");
    let result = await collection.updateOne(query, updates);

    res.send(result).status(200);
});

export default router;