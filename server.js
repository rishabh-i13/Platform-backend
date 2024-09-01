const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
const app = express();
const cors = require('cors');
const cookieParser=require('cookie-parser');
const User = require('./models/User');

// Load environment variables from the .env file
const dotenv = require('dotenv');
dotenv.config();

// Get MongoDB connection URL from environment variables
const Mongo_URL = process.env.MONGODB_URL;

const salt = bcrypt.genSaltSync(10); //Salt creation
const secret='dfs68d74sc1sdce';

app.use(cors({credentials:true,origin:'http://localhost:5173'}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB using the correct connection string
mongoose.connect(Mongo_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

//to register user
app.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const userDoc = await User.create({ email, username, password:bcrypt.hashSync(password,salt) });
    res.json(userDoc);
  } catch (err) {
    res.status(500).json(err);
  }
});

//to login user
app.post('/login',async (req,res)=>{
    try {
        const {email,password}=req.body;
        const userDoc=await User.findOne({email});
        if (!userDoc) {
            return res.status(404).json({ error: 'User not found' });
            console.log("User nt fnd")
          }
        const passOk=bcrypt.compareSync(password, userDoc.password);  
        if(passOk){
          jwt.sign({email,id:userDoc._id},secret,{},(err,token)=>{
            if(err) throw err;
            res.cookie('token',token).json('ok');
          });
        }
        else{
          res.status(400).json("Wrong Credentials");
        }
    } catch (err) {
        res.status(400).json(err);
    }
})

//profile Information
app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.json(info);
  });
});


app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
