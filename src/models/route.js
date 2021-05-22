const express = require('express');
const router = new express.Router();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const handlebars = require('handlebars');
const hbs = require('hbs');
const url = require('url');
const multer = require('multer');
const path = require('path');
const { signupCollection, categorieCollection, threadCollection, commentCollection, profileCollection } = require('./collection');


// This is for show top categories in navbar
var showCategoryList = async function(req, res, next) {
    const catListResult = await categorieCollection.find()
        .select({ _id: 1, category_name: 1 })
        .limit(5);
    req.catListResult = catListResult;
    next();
}

// This is for where you can store your Images
const profileFileStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploadedImages')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
    }
});

router.use(multer({ storage: profileFileStorage }).single('image'));
router.use(showCategoryList);
router.use(express.urlencoded({ extended: false }));
router.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: true }));

var sess;


//Rendering
router.get('/', showCategoryList, async(req, res) => {
    sess = req.session;

    // console.log(req.catListResult);

    let getResult = req.query.msg;
    if (getResult) {
        if (sess.email) {
            res.render('index', {
                loggedin: true,
                username: sess.email,
                userid: sess.user_id,
                msg: getResult,
                catListResult: req.catListResult
            });

        } else {
            res.render('index', {
                catListResult: req.catListResult
            });
        }
    } else {
        if (sess.email) {
            res.render('index', {
                loggedin: true,
                username: sess.email,
                userid: sess.user_id,
                catListResult: req.catListResult
            });

        } else {
            res.render('index', {
                catListResult: req.catListResult
            });
        }
    }

});

router.get('/index', showCategoryList, async(req, res) => {
    // console.log(req.catListResult);

    sess = req.session;

    if (sess.email) {
        res.render('index', {
            loggedin: true,
            username: sess.email,
            userid: sess.user_id,
            catListResult: req.catListResult
        });

    } else {
        res.render('index', {
            catListResult: req.catListResult
        });
    }

});

//Profile---------------------------------------------------------------------------------------------
router.get('/cprofile', async(req, res) => {
    sess = req.session;
    let getResult = req.query.msg;

    const result = await profileCollection.find({ user_id: sess.user_id });

    if (result) {
        const categories = await categorieCollection.find();
        if (result.length === 1) {

            // const fav_lang_result = result[0].fav_language;
            // var showFavArray = [];
            // for (i = 0; i <= result.length; i++) {
            //     var value = fav_lang_result[i];
            //     showFavArray.push({ value: value });
            // }

            res.render('profile', {
                profile: true,
                loggedin: true,
                userid: sess.user_id,
                username: sess.email,
                catListResult: req.catListResult,
                profileDetail: result,
                // fav_lang_result: showFavArray,
                // array: fav_lang_result,
                categories: categories,
                msg: getResult
            });
        } else {
            res.render('profile', {
                profile: false,
                loggedin: true,
                userid: sess.user_id,
                username: sess.email,
                catListResult: req.catListResult,
                profileDetail: result,
                categories: categories,
                msg: getResult
            });
        }
    }
});

router.post('/cprofile', async(req, res) => {
    sess = req.session;

    const result2 = await signupCollection.find({ _id: sess.user_id });
    console.log(result2[0].email);

    let user_id = sess.user_id;
    let user_email = result2[0].email;
    let first_name = req.body.fname;
    let last_name = req.body.lname;
    let phone_number = req.body.phnum;
    let birthdate = req.body.birth;
    let state = req.body.state;
    let zipcode = req.body.zipcode;
    let fav_language = req.body.checkbox
    let bio = req.body.bio;
    let profile_img = req.file.filename;
    console.log(profile_img);

    const registerEmployeeProfile = new profileCollection({
        user_id,
        user_email,
        first_name,
        last_name,
        phone_number,
        birthdate,
        state,
        zipcode,
        fav_language,
        bio,
        profile_img
    });

    const registered = await registerEmployeeProfile.save();
    console.log(registered);

    if (registered) {
        res.status(201).redirect('/cprofile?msg=profile_success');
        console.log('Employee Profile Registration Successful!');
    } else {
        res.status(401).redirect('/cprofile?msg=profile_failed');
        console.log('Employee Profile Registration has failed!');
    }
});

router.post('/cprofileimg', async(req, res) => {
    sess = req.session;

    let update_profile_img = req.file.filename;
    console.log(update_profile_img);

    const result = await profileCollection.updateOne({ user_id: sess.user_id }, { $set: { profile_img: update_profile_img } });

    if (result) {
        res.status(201).redirect('/cprofile?msg=update_profile_img_success');
        console.log('Employee Profile Registration Successful!');
    } else {
        res.status(401).redirect('/cprofile?msg=update_profile_img_failed');
        console.log('Employee Profile Registration has failed!');
    }

});
//Profile---------------------------------------------------------------------------------------------


//Signup---------------------------------------------------------------------------------------------
router.post('/signup', async(req, res) => {

    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        if (password === cpassword) {

            const registerEmployee = new signupCollection({
                username: req.body.username,
                email: req.body.email,
                password: password
            });

            const registered = await registerEmployee.save();

            // console.log(registered);

            if (registered) {
                res.status(201).render('index', {
                    msg: 'success_signup'
                })
                console.log('Employee Registration Successful!');
            } else {
                res.status(401).render('index')
                console.log('Employee Registration has failed!');
            }
        } else {
            res.status(401).render('index', {
                msg: 'signup_pass_failed'
            })
        }
    } catch (err) {
        res.status(401).render('index', {
            msg: err
        })
    }
});
//Signup---------------------------------------------------------------------------------------------


//Login-------------------------------------------------------------------------------------------------------
router.post('/login', async(req, res) => {

    try {
        const email = req.body.email;
        const password = req.body.password;


        const userLogin = await signupCollection.find({ $or: [{ username: email }, { email: email }] });

        if (userLogin) {

            const userHashPassword = await bcrypt.compare(password, userLogin[0].password);

            if (userHashPassword) {
                sess = req.session;
                sess.email = req.body.email;
                sess.user_id = userLogin[0]._id;

                // res.status(200).render('index', {
                //     msg: 'success_login'
                // });

                res.status(200).redirect('/?msg=success_login');

                console.log('Employee Successfully login!');
            } else {
                res.status(401).render('index', {
                    msg: 'login_pass_failed'
                });
                console.log('Employee not Successfully login!');
            }
        } else {
            res.status(401).render('index', {
                msg: 'login_user_not'
            });
        }

    } catch (error) {
        res.status(401).render('index', {
            msg: error
        })
    }
});
//Login-------------------------------------------------------------------------------------------------------


//Logout-------------------------------------------------------------------------------------
router.get('/logout', async(req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/');
    });
});
//Logout-------------------------------------------------------------------------------------


//categories --------------------------------------------------------------------------------
router.get('/categories', showCategoryList, async(req, res) => {
    sess = req.session;

    let getResult = req.query.msg;
    if (getResult) {
        if (sess.email) {

            const categories = await categorieCollection.find();
            if (categories) {
                res.render('categories', {
                    list: categories,
                    listLength: categories.length,
                    loggedin: true,
                    username: sess.email,
                    userid: sess.user_id,
                    catListResult: req.catListResult,
                    msg: getResult
                });
            }
        } else {
            const categories = await categorieCollection.find();
            if (categories) {
                res.render('categories', {
                    list: categories,
                    listLength: categories.length,
                    catListResult: req.catListResult,
                    msg: getResult
                });
            }
        }
    } else {
        if (sess.email) {

            const categories = await categorieCollection.find();
            if (categories) {
                res.render('categories', {
                    list: categories,
                    listLength: categories.length,
                    loggedin: true,
                    username: sess.email,
                    userid: sess.user_id,
                    catListResult: req.catListResult,
                    msg: getResult
                });
            }
        } else {
            const categories = await categorieCollection.find();
            if (categories) {
                res.render('categories', {
                    list: categories,
                    listLength: categories.length,
                    catListResult: req.catListResult,
                    msg: getResult
                });
            }
        }
    }
});

router.post('/categories', async(req, res) => {
    try {
        let cat_name = req.body.cat_title;
        let cat_description = req.body.cat_desc;
        let cat_img = req.file.filename;


        const addCategories = new categorieCollection({
            category_name: cat_name,
            category_description: cat_description,
            category_image: cat_img
        });

        const registered = await addCategories.save();

        // console.log(registered);

        if (registered) {
            res.status(200).redirect('/categories?msg=cat_success')
            console.log('Your Response has been submitted successfully');
        } else {
            res.status(200).redirect('/categories?msg=cat_failed')
            console.log('Your Response has not been submitted successfully.');
        }
    } catch (err) {
        res.status(200).redirect('/categories?msg=cat_failed')
    }
});
//categories -----------------------------------------------------------------------------------


//Threadlist ------------------------------------------------------------------------------------
router.get('/threadlist', showCategoryList, async(req, res) => {
    // console.log(req.url);

    sess = req.session;
    let getResult = req.query.msg;
    if (getResult) {
        if (sess.email) {
            const catname = req.query.catname;
            // console.log(catname);

            const descresult = await categorieCollection.find({ _id: catname })
                // console.log(descresult);
                // console.log(descresult[0]._id);
                // console.log(descresult[0].category_description);
            const threadresult = await threadCollection.find({ thread_cat_id: catname })
                // console.log(threadresult);


            hbs.registerHelper('isdefined', function(value) {
                if (value > 0) {
                    let threadlist_Length = true;
                } else {
                    let threadlist_Length = false;
                }
                return value;
            });



            res.render('threadlist', {
                loggedin: true,
                username: sess.email,
                userid: sess.user_id,
                threadlistLength: threadresult.length,
                catid: descresult[0]._id,
                catname: descresult[0].category_name,
                catdesc: descresult[0].category_description,
                threadlist: threadresult,
                catListResult: req.catListResult,
                msg: getResult
            })

        } else {
            const catname = req.query.catname;
            // console.log(catname);

            const descresult = await categorieCollection.find({ _id: catname })
                // console.log(descresult[0].category_name);
                // console.log(descresult[0].category_description);

            const threadresult = await threadCollection.find({ thread_cat_name: catname })
                // console.log(threadresult);

            hbs.registerHelper('isdefined', function(value) {
                if (value > 0) {
                    let threadlist_Length = true;
                } else {
                    let threadlist_Length = false;
                }
                return value;
            });

            res.render('threadlist', {
                threadlistLength: threadresult.length,
                catid: descresult[0]._id,
                catname: descresult[0].category_name,
                catdesc: descresult[0].category_description,
                threadlist: threadresult,
                catListResult: req.catListResult,
                msg: getResult

            });
        }
    } else {
        if (sess.email) {
            const catname = req.query.catname;
            // console.log(catname);

            const descresult = await categorieCollection.find({ _id: catname })
                // console.log(descresult[0].category_name);
                // console.log(descresult[0].category_description);
            const threadresult = await threadCollection.find({ thread_cat_name: catname })
                // console.log(threadresult);


            hbs.registerHelper('isdefined', function(value) {
                if (value > 0) {
                    let threadlist_Length = true;
                } else {
                    let threadlist_Length = false;
                }
                return value;
            });



            res.render('threadlist', {
                loggedin: true,
                username: sess.email,
                userid: sess.user_id,
                threadlistLength: threadresult.length,
                catid: descresult[0]._id,
                catname: descresult[0].category_name,
                catdesc: descresult[0].category_description,
                threadlist: threadresult,
                catListResult: req.catListResult,
                msg: getResult
            })

        } else {
            const catname = req.query.catname;
            // console.log(catname);

            const descresult = await categorieCollection.find({ _id: catname })
                // console.log(descresult[0].category_name);
                // console.log(descresult[0].category_description);

            const threadresult = await threadCollection.find({ thread_cat_name: catname })
                // console.log(threadresult);

            hbs.registerHelper('isdefined', function(value) {
                if (value > 0) {
                    let threadlist_Length = true;
                } else {
                    let threadlist_Length = false;
                }
                return value;
            });

            res.render('threadlist', {
                threadlistLength: threadresult.length,
                catid: descresult[0]._id,
                catname: descresult[0].category_name,
                catdesc: descresult[0].category_description,
                threadlist: threadresult,
                catListResult: req.catListResult,
                msg: getResult
            });
        }
    }
});

router.post('/threadlist', async(req, res) => {
    const catname = req.query.catname;
    try {
        // console.log(catname);

        const thread_title = req.body.title;
        const thread_desc = req.body.desc;
        const thread_userid = sess.user_id;

        const userresult = await signupCollection.find({ _id: thread_userid });


        const addThread = new threadCollection({
            thread_title: thread_title,
            thread_desc: thread_desc,
            thread_cat_id: catname,
            thread_user_id: thread_userid,
            thread_user_name: userresult[0].username,
        });

        const registered = await addThread.save();

        // console.log(registered);

        if (registered) {
            res.status(200).redirect('/threadlist?msg=threadlist_success&catname=' + catname)
            console.log('adding thread Successful!');
        } else {
            res.status(200).redirect('/threadlist?msg=threadlist_failed&catname=' + catname)
            console.log('adding thread has failed!');
        }
    } catch (err) {
        res.status(200).redirect('/threadlist?msg=threadlist_failed&catname=' + catname)
    }
});
//Threadlist ------------------------------------------------------------------------------------


//Threads-------------------------------------------------------------------------------------------
router.get('/thread', showCategoryList, async(req, res) => {

    sess = req.session;
    let getResult = req.query.msg;
    if (getResult) {
        if (sess.email) {
            const threadid = req.query.threadid;
            // console.log(threadid);
            const result = await threadCollection.find({ _id: threadid })
                // console.log(result);
            const commentresult = await commentCollection.find({ thread_id: threadid })
                // console.log(commentresult);

            hbs.registerHelper('isdefined', function(value) {
                if (value > 0) {
                    let threadlist_Length = true;
                } else {
                    let threadlist_Length = false;
                }
                return value;
            });

            res.render('thread', {
                loggedin: true,
                username: sess.email,
                userid: sess.user_id,
                _id: threadid,
                commentlistLength: commentresult.length,
                threadTitle: result[0].thread_title,
                threadDesc: result[0].thread_desc,
                threadCatName: result[0].thread_cat_name,
                commentlist: commentresult,
                catListResult: req.catListResult,
                msg: getResult
            });

        } else {
            const threadid = req.query.threadid;
            // console.log(threadid);
            const result = await threadCollection.find({ _id: threadid })
                // console.log(result);
            const commentresult = await commentCollection.find({ thread_id: threadid })
                // console.log(commentresult);

            hbs.registerHelper('isdefined', function(value) {
                if (value > 0) {
                    let threadlist_Length = true;
                } else {
                    let threadlist_Length = false;
                }
                return value;
            });

            res.render('thread', {
                _id: threadid,
                commentlistLength: commentresult.length,
                threadTitle: result[0].thread_title,
                threadDesc: result[0].thread_desc,
                threadCatName: result[0].thread_cat_name,
                commentlist: commentresult,
                catListResult: req.catListResult,
                msg: getResult
            });
        }
    } else {
        if (sess.email) {
            const threadid = req.query.threadid;
            // console.log(threadid);
            const result = await threadCollection.find({ _id: threadid })
                // console.log(result);
            const commentresult = await commentCollection.find({ thread_id: threadid })
                // console.log(commentresult);

            hbs.registerHelper('isdefined', function(value) {
                if (value > 0) {
                    let threadlist_Length = true;
                } else {
                    let threadlist_Length = false;
                }
                return value;
            });

            res.render('thread', {
                loggedin: true,
                username: sess.email,
                userid: sess.user_id,
                _id: threadid,
                commentlistLength: commentresult.length,
                threadTitle: result[0].thread_title,
                threadDesc: result[0].thread_desc,
                threadCatName: result[0].thread_cat_name,
                commentlist: commentresult,
                catListResult: req.catListResult,
                msg: getResult
            });

        } else {
            const threadid = req.query.threadid;
            // console.log(threadid);
            const result = await threadCollection.find({ _id: threadid })
                // console.log(result);
            const commentresult = await commentCollection.find({ thread_id: threadid })
                // console.log(commentresult);

            hbs.registerHelper('isdefined', function(value) {
                if (value > 0) {
                    let threadlist_Length = true;
                } else {
                    let threadlist_Length = false;
                }
                return value;
            });

            res.render('thread', {
                _id: threadid,
                commentlistLength: commentresult.length,
                threadTitle: result[0].thread_title,
                threadDesc: result[0].thread_desc,
                threadCatName: result[0].thread_cat_name,
                commentlist: commentresult,
                catListResult: req.catListResult,
                msg: getResult
            });
        }
    }
});

router.post('/thread', async(req, res) => {

    const threadid = req.query.threadid;
    try {

        const comment = req.body.comment;
        const comment_userid = sess.user_id;

        const userresult = await signupCollection.find({ _id: comment_userid });


        const addComment = new commentCollection({
            comment_content: comment,
            thread_id: threadid,
            comment_by: comment_userid,
            comment_user_name: userresult[0].username

        });

        const registered = await addComment.save();

        // console.log(registered);

        if (registered) {
            res.status(200).redirect('thread?msg=comment_success&threadid=' + threadid)
            console.log('adding comment Successful!');
        } else {
            res.status(200).redirect('thread?msg=comment_failed&threadid=' + threadid)
            console.log('adding comment has failed!');
        }
    } catch (err) {
        res.status(200).redirect('thread?msg=comment_failed&threadid=' + threadid)
        res.status(401).send(err);
    }
});
//Threads-------------------------------------------------------------------------------------------


//All Questions-------------------------------------------------------------------------------------------
router.get('/allQues', showCategoryList, async(req, res) => {
    sess = req.session;

    if (sess.email) {

        const allQuesResult = await threadCollection.find();

        hbs.registerHelper('isdefined', function(value) {
            if (value > 0) {
                let threadlist_Length = true;
            } else {
                let threadlist_Length = false;
            }
            return value;
        });

        res.render('allQues', {
            loggedin: true,
            username: sess.email,
            userid: sess.user_id,
            quesResult: allQuesResult,
            quesResultLength: allQuesResult.length,
            catListResult: req.catListResult

        })
    } else {
        const allQuesResult = await threadCollection.find();

        hbs.registerHelper('isdefined', function(value) {
            if (value > 0) {
                let threadlist_Length = true;
            } else {
                let threadlist_Length = false;
            }
            return value;
        });

        res.render('allQues', {
            quesResult: allQuesResult,
            quesResultLength: allQuesResult.length,
            catListResult: req.catListResult
        })
    }
});
//All Questions-------------------------------------------------------------------------------------------


//Users-------------------------------------------------------------------------------------------
router.get('/users', showCategoryList, async(req, res) => {
    sess = req.session;

    if (sess.email) {

        const usersResult = await signupCollection.find();

        hbs.registerHelper('isdefined', function(value) {
            if (value > 0) {
                let threadlist_Length = true;
            } else {
                let threadlist_Length = false;
            }
            return value;
        });

        res.render('users', {
            loggedin: true,
            username: sess.email,
            userid: sess.user_id,
            userResult: usersResult,
            userResultLength: usersResult.length,
            catListResult: req.catListResult

        })
    } else {
        const usersResult = await signupCollection.find();

        hbs.registerHelper('isdefined', function(value) {
            if (value > 0) {
                let threadlist_Length = true;
            } else {
                let threadlist_Length = false;
            }
            return value;
        });

        res.render('users', {
            userResult: usersResult,
            userResultLength: usersResult.length,
            catListResult: req.catListResult
        })
    }
});
//Users-------------------------------------------------------------------------------------------

router.get('*', async(req, res) => {
    res.status(404).send('Page not found');
});

module.exports = router;