const express = require('express');
const env = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

// routes
// const authRoutes = require('./routes/auth');
// const adminAuthRoutes = require('./routes/admin/auth');
// const categoryRoutes = require('./routes/category');
// const productRoutes = require('./routes/product');
// const cartRoutes = require('./routes/cart');
// const initialDataRoutes = require('./routes/admin/initialData');
// const pageRoutes = require('./routes/admin/page');

const app = express();


env.config();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'uploads')));
// app.use('/api', authRoutes);
// app.use('/api', adminAuthRoutes);
// app.use('/api', categoryRoutes);
// app.use('/api', productRoutes);
// app.use('/api', cartRoutes);
// app.use('/api', initialDataRoutes);
// app.use('/api', pageRoutes);

mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_DB_USER}:${process.env.MONGODB_DB_PASSWORD}@${process.env.MONGODB_DB_ID}.mongodb.net/${process.env.MONGODB_DB_NAME}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(()=>{
  console.log("Database connected");
}).catch((error)=>{
  console.log(error);
});

app.listen(PORT, ()=>{
  console.log(`Server started on port ${PORT}`);
});

app.get('/', (req, res, next)=>{
  res.status(200).json({
    message: 'Hello from Ankur'
  });
})