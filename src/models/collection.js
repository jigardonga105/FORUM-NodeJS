const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// This Collection is for SignUp--------------------------------------------------------------------------------
const signupDetailsSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            validator.isEmail(value);
        }
    },
    password: {
        type: String,
        required: true
    },
    Date_Time: {
        type: Date,
        default: Date.now()
    }
});

signupDetailsSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
})

const signupCollection = mongoose.model('user', signupDetailsSchema);
//----------------------------------------------------------------------------------------------------------------



// This Collection is for Add categories--------------------------------------------------------------------------------
const categoriesDetailsSchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: true,
        unique: true
    },
    category_description: {
        type: String,
        required: true
    },
    category_image: {
        type: String,
        required: true
    },
    Date_Time: {
        type: Date,
        default: Date.now()
    }
});

const categorieCollection = mongoose.model('categorie', categoriesDetailsSchema);
//----------------------------------------------------------------------------------------------------------------



// This Collection is for Add thread--------------------------------------------------------------------------------
const threadDetailsSchema = new mongoose.Schema({
    thread_title: {
        type: String,
        required: true
    },
    thread_desc: {
        type: String,
        required: true
    },
    thread_cat_id: {
        type: String,
        required: true
    },
    thread_user_id: {
        type: String,
        required: true
    },
    thread_user_name: {
        type: String,
        required: true
    },
    Date_Time: {
        type: Date,
        default: Date.now()
    }
});

const threadCollection = mongoose.model('threadlist', threadDetailsSchema);
//----------------------------------------------------------------------------------------------------------------



// This Collection is for Add Comments--------------------------------------------------------------------------------
const commentDetailsSchema = new mongoose.Schema({
    comment_content: {
        type: String,
        required: true
    },
    thread_id: {
        type: String,
        required: true,
    },
    comment_by: {
        type: String,
        required: true
    },
    comment_user_name: {
        type: String,
        required: true
    },
    Date_Time: {
        type: Date,
        default: Date.now()
    }
});

const commentCollection = mongoose.model('comment', commentDetailsSchema);
//----------------------------------------------------------------------------------------------------------------


// This Collection is for Add Images--------------------------------------------------------------------------------
const profileDetailsSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    user_email: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    phone_number: {
        type: Number,
        required: true
    },
    birthdate: {
        type: Date,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipcode: {
        type: String,
        required: true
    },
    fav_language: {
        type: Array,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    profile_img: {
        type: String,
        required: true
    },
    Date_Time: {
        type: Date,
        default: Date.now()
    }
});

const profileCollection = mongoose.model('profile', profileDetailsSchema);
//----------------------------------------------------------------------------------------------------------------

module.exports = { signupCollection, categorieCollection, threadCollection, commentCollection, profileCollection };