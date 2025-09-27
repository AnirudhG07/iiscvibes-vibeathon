// Quick password hash generator for demo users
const bcrypt = require('bcryptjs');

async function generateHashes() {
  console.log('Generating password hashes...\n');
  
  // Generate hash for demo123
  const demoHash = await bcrypt.hash('demo123', 12);
  console.log('Password: demo123');
  console.log('Hash:', demoHash);
  console.log('Test:', await bcrypt.compare('demo123', demoHash));
  console.log('');
  
  // Generate hash for admin123  
  const adminHash = await bcrypt.hash('admin123', 12);
  console.log('Password: admin123');
  console.log('Hash:', adminHash);
  console.log('Test:', await bcrypt.compare('admin123', adminHash));
  console.log('');
  
  // Test current hashes
  const currentDemoHash = '$2a$12$cftmP6Xr4V40HImyiTbS/eFerRfhKFhXQFtNFVOGCGBQcDf9i2TAC';
  const currentAdminHash = '$2b$12$XyZ8E3vTQ7G2nF5bQw9Ug.4pL6mN8vR1cB9eK7sM3dX2yH5tU0wA.';
  
  console.log('Testing current hashes:');
  console.log('Current demo hash matches demo123:', await bcrypt.compare('demo123', currentDemoHash));
  console.log('Current admin hash matches admin123:', await bcrypt.compare('admin123', currentAdminHash));
  
  // Try common passwords
  const commonPasswords = ['demo123', 'admin123', 'password', '123456', 'demo', 'admin'];
  
  console.log('\nTesting common passwords against current demo hash:');
  for (const pwd of commonPasswords) {
    const match = await bcrypt.compare(pwd, currentDemoHash);
    if (match) {
      console.log(`✅ FOUND: "${pwd}" matches the current demo hash!`);
    }
  }
  
  console.log('\nTesting common passwords against current admin hash:');
  for (const pwd of commonPasswords) {
    const match = await bcrypt.compare(pwd, currentAdminHash);
    if (match) {
      console.log(`✅ FOUND: "${pwd}" matches the current admin hash!`);
    }
  }
}

generateHashes().catch(console.error);