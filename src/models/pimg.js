const express = require('express');
const router2 = new express.Router();
const router = require('./route');
const hbs = require('hbs');
const multer = require('multer');
const session = require('express-session');

const { signupCollection, categorieCollection, threadCollection, commentCollection, profileCollection } = require('./collection');

// This is for where you can store your profile Images
const profileFileStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/profileimg')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
});

router2.use(multer({ storage: profileFileStorage }).single('profile_img'));

var sess;

router2.get('/cprofile', async(req, res) => {
    sess = req.session;

    // console.log(sess.email);
    // console.log(sess.user_id);


    const result = await profileCollection.find({ user_id: sess.email });
    const categories = await categorieCollection.find();

    if (result.length === 1) {
        res.render('profile', {
            profile: true,
            catListResult: req.catListResult,
            categories: categories
        });
    } else {
        res.render('profile', {
            profile: false,
            catListResult: req.catListResult,
            categories: categories
        });
    }
});

// router.post('/cprofile', img_func, async(req, res) => {
//     console.log('post cprofile');
//     console.log(req.body.fname);
//     console.log(req.body.lname);
//     console.log(req.body.phnum);
//     console.log(req.body.birth);
//     console.log(req.body.state);
//     console.log(req.body.zipcode);
//     console.log(req.body.bio);

//     // let checkboxArry = [];
//     for (var checkbox in req.body.checkbox) {
//         if (req.body.checkbox) {
//             items = req.body.checkbox;
//             checkbox = JSON.stringify(items).replace(/]|[[]|"/g, '', )
//             console.log(items);
//             // checkboxArry.push(checkbox);
//         }
//     }
//     console.log(req.body.checkbox);
//     console.log(req.body.fname);
// });

router2.post('/cprofile', async(req, res) => {
    sess = req.session;

    let img = req.file;
    let profile_img = img.path;
    profile_img = profile_img.replace('public', '');
    profile_img = profile_img.replace(img.originalname, sess.email + '.jpg');
    profile_img = String.raw `${profile_img}`.split('\\').join('/');
    console.log(profile_img);

    let user_id = sess.user_id;
    let first_name = req.body.fname;
    let last_name = req.body.lname;
    let phone_number = req.body.phnum;
    let birthdate = req.body.birth;
    let state = req.body.state;
    let zipcode = req.body.zipcode;
    let checkboxArry = [];
    for (var checkbox in req.body.checkbox) {
        if (req.body.checkbox) {
            items = req.body.checkbox;
            checkbox = JSON.stringify(items).replace(/]|[[]|"/g, '', )
                // console.log(items);
            checkboxArry.push(checkbox);
        }
    }
    let bio = req.body.bio;

    console.log(user_id);
    console.log(first_name);
    console.log(last_name);
    console.log(phone_number);
    console.log(birthdate);
    console.log(state);
    console.log(zipcode);
    console.log(checkboxArry);
    console.log(bio);

    res.send(user_id, first_name, last_name, phone_number, birthdate, state, zipcode, checkboxArry, bio, profile_img);

});

module.exports = router2;