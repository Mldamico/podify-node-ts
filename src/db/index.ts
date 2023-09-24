import mongoose from 'mongoose'

const URI = process.env.MONGO_URI;

mongoose.connect(`${URI}`).then(() => {
    console.log('Db is connected')
}).catch((err) => {
    console.log('DB connection failed ', err)
})