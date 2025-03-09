const path = require('path');
global.appRoot = path.resolve(__dirname);

const express = require('express');
const app = express();
const apiRoutes = require('./routes/apiRoutes');
const publicRoutes = require('./routes/publicRoutes')
const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser');

require('dotenv').config()



app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')))

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/', publicRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.HOST_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listens http://localhost:${PORT}`);
});