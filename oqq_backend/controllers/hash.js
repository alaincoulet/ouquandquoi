// hash.js
const bcrypt = require('bcryptjs');
const password = 'user123';
bcrypt.hash(password, 10).then(hash => {
  console.log('Hash pour admin123 :', hash);
});
