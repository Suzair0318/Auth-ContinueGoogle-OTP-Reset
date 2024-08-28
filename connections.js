const mongoose  = require('mongoose');

mongoose.connect(`mongodb://localhost:27017/practice`).then(() => {
    console.log('mongoDB Connected')
}).catch((error) => {
    console.log(error)
})

