const mongoose = require('mongoose');

// Подключение к MongoDB
mongoose.connect('mongodb://localhost/auth-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  console.log('Connected to MongoDB');
  
  // Удаление базы данных
  db.dropDatabase(function(err, result) {
    if (err) {
      console.error('Error dropping database:', err);
    } else {
      console.log('Database dropped successfully:', result);
    }
    mongoose.connection.close();
  });
});