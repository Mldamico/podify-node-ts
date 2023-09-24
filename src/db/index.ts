import mongoose from 'mongoose'
import { MONGO_URI } from '@/utils/variables'

mongoose.connect(MONGO_URI).then(() => {
    console.log('Db is connected')
}).catch((err) => {
    console.log('DB connection failed ', err)
})