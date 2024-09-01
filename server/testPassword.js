import bcrypt from 'bcrypt';

// Replace these values with the actual user input and stored hash
const userInputPassword = 'skyrim53@gmail.com'; // The password you used
const storedHash = '$2b$10$nw9umUPLqlqrK5y3zOfV2uxuMId7NrhoO/6m5sTWRA.jgwHnqINxC'; // The hash from the database

bcrypt.compare(userInputPassword, storedHash, (err, result) => {
  if (err) throw err;
  console.log(result); // Should be true if the password matches
});
