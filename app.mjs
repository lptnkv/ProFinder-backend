import express, { request } from "express";
import cors from "cors";
import dbConnect from "./db/dbConnect.mjs"
import bcrypt from "bcrypt"
import User from "./db/userModel.mjs"
import Job from "./db/jobModel.mjs"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
const {Schema} = mongoose;

import auth from "./auth.mjs"

dbConnect();

const PORT = 3001

const app = express();

app.use(cors());
app.use(express.json());

app.post("/register", (request, response) => {
    const requestUser = request.body
    bcrypt
        .hash(request.body.password, 10)
        .then((hashedPassword) => {
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: request.body.email,
                password: hashedPassword,
                role: "user"
            });
            console.log(user)

            user
                .save()
                .then((result) => {
                    response.status(201).send({
                        message: "User Created Successfully",
                        result,
                    });
                })
                .catch((error) => {
                    console.log(error)
                    response.status(500).send({
                        message: "Error creating user",
                        error,
                    });
                });
        })
        .catch((error) => {
            console.log(error)
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
    const query = request.query.query || ''
    console.log(query)
    const limit = request.query.limit || 200;
    Job.find({ "name": { $regex: `${query}` } }).limit(limit).then(res => {
        response.json(res)
        console.log("serving get jobs method ")
    })
})

app.get("/users", (request, response) => {
    User.find().then(res => {
        console.log(res)
        response.json(res)
    })
    .catch(err => {
        console.log(err);
    })
})

app.get("/jobs/:jobId", (request, response) => {
    const jobId = request.params.jobId;
    Job.findById(jobId).then(res => {
        response.json(res);
        console.log("serving get jobs by id method ")
    }).catch(err => {
        console.log(err);
    })
})

app.get("/user/:userId", (request, response) => {
    const userId = request.params.userId;
    User.findById(userId).then(res => {
        response.json(res);
        console.log("serving get user by id method ")
    }).catch(err => {
        console.log(err);
    })
})

app.get("/user/:userId/jobs", (request, response) => {
    const userId = request.params.userId;
    Job.find({"creator_id": userId}).then(res => {
        response.json(res);
        console.log("serving get user's jobs")
    }).catch(err => {
        console.log(err);
    })
})

app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`)
})