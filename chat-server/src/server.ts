import  express from "express";
import  cors from "cors";
import  bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from '../config/db'
import userRoutes from '../routes/userRoutes'

dotenv.config();

connectDB()
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json())


app.get('/', (req, res) => {
              res.send('Hello, world!');
            });

app.use('/api/user', userRoutes)

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
