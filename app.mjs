import express, { request } from "express";
import cors from "cors";
import dbConnect from "./db/dbConnect.mjs";
import bcrypt from "bcrypt";
import User from "./db/userModel.mjs";
import Job from "./db/jobModel.mjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const { Schema } = mongoose;

import auth from "./auth.mjs";

dbConnect();

const PORT = 3001;

const app = express();

app.use(cors());
app.use(express.json());

app.post("/register", (request, response) => {
    const requestUser = request.body;
    bcrypt
        .hash(request.body.password, 10)
        .then((hashedPassword) => {
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: request.body.email,
                password: hashedPassword,
                role: "user",
            });
            console.log(user);

            user.save()
                .then((result) => {
                    response.status(201).send({
                        message: "User Created Successfully",
                        result,
                    });
                })
                .catch((error) => {
                    console.log(error);
                    response.status(500).send({
                        message: "Error creating user",
                        error,
                    });
                });
        })
        .catch((error) => {
            console.log(error);
            response.status(500).send({
                message: "Password was not hashed successfully",
                error: error,
            });
        });
});

app.post("/login", (request, response) => {
    User.findOne({ email: request.body.email })
        .then((user) => {
            bcrypt
                .compare(request.body.password, user.password)
                .then((passwordCheck) => {
                    if (!passwordCheck) {
                        return response.status(400).send({
                            message: "Passwords does not match",
                            error,
                        });
                    }

                    const token = jwt.sign(
                        {
                            userId: user._id,
                            userEmail: user.email,
                        },
                        "RANDOM-TOKEN",
                        { expiresIn: "24h" }
                    );

                    response.status(200).send({
                        message: "Login Successful",
                        email: user.email,
                        token,
                        id: user.id,
                    });
                })
                // catch error if password does not match
                .catch((error) => {
                    response.status(400).send({
                        message: "Passwords does not match",
                        error,
                    });
                });
        })
        // catch error if email does not exist
        .catch((e) => {
            response.status(404).send({
                message: "Email not found",
                e,
            });
        });
});

app.get("/free-endpoint", (request, response) => {
    response.json({ message: "You are free to access me anytime" });
});

app.get("/auth-endpoint", auth, (request, response) => {
    response.json({ message: "You are authorized to access me" });
});

app.get("/jobs", (request, response) => {
    const query = request.query.query || "";
    console.log(query);
    const limit = request.query.limit || 200;
    Job.find({ name: { $regex: `${query}` } })
        .limit(limit)
        .then((res) => {
            response.json(res);
            console.log("serving get jobs method ");
        });
});

app.get("/users", (request, response) => {
    User.find()
        .then((res) => {
            console.log(res);
            response.json(res);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/jobs/:jobId", (request, response) => {
    const jobId = request.params.jobId;
    let creator_id;
    Job.findById(jobId)
        .then((jobRes) => {
            creator_id = jobRes._creator
            User.findById(creator_id).then((userRes => {
                const res = {}
                res.name = jobRes.name;
                res.descr = jobRes.descr;
                res._creator = jobRes._creator;
                res._id = jobRes._id;
                res.price = jobRes.price;
                res.email = userRes.email;
                res.phone = userRes.phone;
                console.log(res);
                response.json(res);
            }))
            console.log("serving get jobs by id method ");
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/user/:userId", (request, response) => {
    const userId = request.params.userId;
    User.findById(userId)
        .then((res) => {
            console.log(res);
            response.json(res);
            console.log("serving get user by id method ");
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/user/:userId/jobs", (request, response) => {
    const userId = request.params.userId;
    let user;
    User.findById(userId)
        .then((res) => (user = res))
        .catch((err) => {
            console.log(err);
        });
    Job.find({ _creator: userId })
        .then((res) => {
            res.email = user.email;
            res.phone = user.phone;
            response.json(res);
            console.log(res);
            console.log("serving get user's jobs");
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post("/addJob", (request, response) => {
    console.log("serving add job endpoint");
    console.log(request);
    const job = new Job({
        _id: new mongoose.Types.ObjectId(),
        name: request.body.jobName,
        descr: request.body.jobDescr,
        _creator: request.body.creatorId,
        price: request.body.jobPrice,
    });
    console.log(job);

    job.save()
        .then((result) => {
            response.status(201).send({
                message: "Job Created Successfully",
                result,
            });
        })
        .catch((error) => {
            console.log(error);
            response.status(500).send({
                message: "Error creating job",
                error,
            });
        });
});

app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`);
});
