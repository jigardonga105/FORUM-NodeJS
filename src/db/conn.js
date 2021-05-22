const mongoose = require('mongoose');

mongoose.connect('mongodb://' + process.env.DB_HOST + '/' + process.env.DB_NAME, {
        useCreateIndex: true,
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log("connection successfull.....");
    })
    .catch((err) => {
        console.log(err);
    });