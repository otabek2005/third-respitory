const express = require('express')
const router = express.Router();


//adding the database scheme to the file or server
const User = require('../models/users');


// multer for uplaoding images 
const multer = require('multer');
const users = require('../models/users');


//for replacing old image with new one
const fs = require('fs');
const { type } = require('os');


// it is for working with file or directery paths
const path = require('path');


//image upload code: Storing and naming of the images
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./uploads");
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + "_"+Date.now() + "_" + file.originalname);
    },
});


// a single image must be uploaded
var upload = multer({
    storage: storage,
}).single("image");  



//insert an user into database code //upload is an varable created above
router.post("/add", upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });

        await user.save();

        req.session.message = {
            type: "success",
            message: "User added successfully!",
        };

        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});



// connecting htlm files to server  //Get all users route
router.get("/", async (req, res) => {
    try {
        
        const users = await User.find();


        res.render('index', {
            title: "Home Page",
            users: users,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});


// Opening an adding page of an user
router.get("/add", (req, res) => {
    res.render('add_users', {title: "Add users"})
})

// Opening an editing page of an user
router.get("/edit/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.redirect("/");
        }
        res.render('edit_users', { title: "Edit User", user: user });
    } catch (err) {
        console.error(err);
        res.redirect("/");
    }
});




// Updating an user after editing by Post method
router.post("/update/:id", upload, async (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;  
        try {
            fs.unlinkSync(path.join(__dirname, 'uploads', req.body.old_image));
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        
        const result = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,  
        }, { new: true });  

        
        req.session.message = {
            type: 'success',
            message: 'User updated sucessfully',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});


// Deleting a user
router.get("/delete/:id", async (req, res) => {
    let id = req.params.id;
    try {
        const result = await User.findByIdAndDelete(id);

        if (result && result.image) {
            try {
                fs.unlinkSync('./uploads/' + result.image); 
            } catch (err) {
                console.log("Error happened deleting the file:", err);
            }
        }

        req.session.message = {
            type: "info",
            message: "User daleted successfully!", 
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message });
    }
});




module.exports = router;