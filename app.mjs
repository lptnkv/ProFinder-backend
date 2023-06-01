import express from "express";
import cors from "cors";
import dbConnect from "./db/dbConnect.mjs"
import bcrypt from "bcrypt"
import User from "./db/userModel.mjs"
import Job from "./db/jobModel.mjs"
import jwt from "jsonwebtoken"

import auth from "./auth.mjs"

dbConnect();

const PORT = 3001

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
});

app.use(cors());
app.use(express.json());

app.post("/register", (request, response) => {
    bcrypt
        .hash(request.body.password, 10)
        .then((hashedPassword) => {
            const user = new User({
                email: request.body.email,
                password: hashedPassword,
            });

            user
                .save()
                .then((result) => {
                    response.status(201).send({
                        message: "User Created Successfully",
                        result,
                    });
                })
                .catch((error) => {
                    response.status(500).send({
                        message: "Error creating user",
                        error,
                    });
                });
        })
        .catch((e) => {
            response.status(500).send({
                message: "Password was not hashed successfully",
                e,
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
    let query = request.query.query
    let limit = request.query.limit || 200;
    Job.find().limit(limit).then(res => {
        response.json(res)
    })
})

app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`)
})