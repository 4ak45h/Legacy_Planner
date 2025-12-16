const express = require('express');
    const mongoose = require('mongoose');
    const dotenv = require('dotenv');
    const cors = require('cors');
    const willRoutes = require('./routes/willRoutes');
    // Import Routes
    const authRoutes = require('./routes/authRoutes');
    const userRoutes = require('./routes/userRoutes');
    const profileRoutes = require('./routes/profileRoutes');
    const contactRoutes = require('./routes/contactRoutes'); // <-- NEW IMPORT
    const ledgerRoutes = require('./routes/ledgerRoutes');
    
    dotenv.config();

    const app = express();

    // Middleware
    app.use(express.json()); // Allows us to use req.body
    app.use(cors()); 

    const PORT = process.env.PORT || 5000;

    // Connect to MongoDB
    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error(err));

    // Define Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/profile', profileRoutes);
    app.use('/api/contacts', contactRoutes); // <-- NEW ROUTE MIDDLEWARE
    app.use('/api/will', willRoutes);
    app.use('/api/ledger', ledgerRoutes);

    app.get('/', (req, res) => {
      res.send('Legacy Planner API is running!');
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });