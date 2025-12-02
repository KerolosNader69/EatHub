/**
 * Simple script to generate a bcrypt hash for a password
 * Usage: node scripts/hashPassword.js <password>
 */

const bcrypt = require('bcrypt');

const args = process.argv.slice(2);

if (args.length !== 1) {
  console.log('Usage: node scripts/hashPassword.js <password>');
  console.log('Example: node scripts/hashPassword.js MySecurePassword123!');
  process.exit(1);
}

const password = args[0];

if (password.length < 8) {
  console.error('Password must be at least 8 characters long');
  process.exit(1);
}

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('\nBcrypt Hash:');
    console.log(hash);
    console.log('\nUse this hash in your MongoDB document for the password field.');
  })
  .catch(error => {
    console.error('Error generating hash:', error.message);
    process.exit(1);
  });
