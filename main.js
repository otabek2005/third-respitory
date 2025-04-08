// Start-up of the website
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT  || 3000;

//Database
mongoose.connect(process.env.DB_URI);  //I disabled this part for later use if needed:  {useNewUrlParser: true, useUnifiedTopology: true} 
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', ()=> console.log("Conncted to the database"));

//Middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session(
    {
        secret: "My secret key",
        saveUninitialized: true,
        resave:false,
    }
));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next()
})

//for displaying images stored at uplads folder part of middleware
app.use(express.static("uploads"));

// Template engine
app.set("view engine", "ejs");


// Routes file connection
app.use("", require("./routes/routes"))

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})

//static folder for css codes
app.use(express.static("public"));







