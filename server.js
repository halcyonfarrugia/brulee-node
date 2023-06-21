const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser')

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, 
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true,
    limit:'50mb',
    parameterLimit: 50000
}));


app.use('/user', require('./routes/user'));
app.use('/product', require('./routes/product'));
app.use('/chat', require('./routes/chat'));
app.use('/order', require('./routes/order'));
app.use('/catering', require('./routes/catering'));
app.use('/query', require('./routes/query'));


app.listen(8080, () => console.log(`Server listening at PORT: 8080`));
