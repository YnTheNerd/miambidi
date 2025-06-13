#!/usr/bin/env node

/**
 * Firestore Index Deployment Script
 * Automates the deployment of required Firestore indexes for MiamBidi
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 MiamBidi Firestore Index Deployment');
console.log('=====================================\n');

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI detected');
} catch (error) {
  console.error('❌ Firebase CLI not found. Please install it first:');
  console.error('   npm install -g firebase-tools');
  process.exit(1);
}

// Check if firestore.indexes.json exists
const indexesPath = path.join(path.dirname(__dirname), 'firestore.indexes.json');
if (!fs.existsSync(indexesPath)) {
  console.error('❌ firestore.indexes.json not found in project root');
  process.exit(1);
}

console.log('✅ firestore.indexes.json found');

// Read and validate indexes file
try {
  const indexesContent = fs.readFileSync(indexesPath, 'utf8');
  const indexes = JSON.parse(indexesContent);
  
  const blogIndexes = indexes.indexes.filter(index => 
    index.collectionGroup === 'blogs'
  );
  
  console.log(`📊 Found ${indexes.indexes.length} total indexes`);
  console.log(`📝 Found ${blogIndexes.length} blog-specific indexes`);
  
  if (blogIndexes.length === 0) {
    console.warn('⚠️  No blog indexes found. Blog functionality may not work properly.');
  }
  
} catch (error) {
  console.error('❌ Error reading firestore.indexes.json:', error.message);
  process.exit(1);
}

// Check if user is logged in to Firebase
try {
  execSync('firebase projects:list', { stdio: 'pipe' });
  console.log('✅ Firebase authentication verified');
} catch (error) {
  console.error('❌ Not logged in to Firebase. Please run:');
  console.error('   firebase login');
  process.exit(1);
}

// Deploy indexes
console.log('\n🔄 Deploying Firestore indexes...');
try {
  const output = execSync('firebase deploy --only firestore:indexes', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  console.log('✅ Indexes deployed successfully!');
  console.log('\n📋 Deployment output:');
  console.log(output);
  
} catch (error) {
  console.error('❌ Error deploying indexes:', error.message);
  console.error('\n💡 Troubleshooting tips:');
  console.error('1. Ensure you have the correct Firebase project selected:');
  console.error('   firebase use <project-id>');
  console.error('2. Check your Firebase project permissions');
  console.error('3. Verify firestore.indexes.json syntax');
  process.exit(1);
}

console.log('\n🎉 Index deployment completed!');
console.log('\n📝 Next steps:');
console.log('1. Wait 5-10 minutes for indexes to be fully created');
console.log('2. Test blog functionality in your application');
console.log('3. Monitor Firebase Console for index creation status');
console.log('4. Check application logs for any remaining index errors');

console.log('\n🔗 Useful links:');
console.log('- Firebase Console: https://console.firebase.google.com/');
console.log('- Firestore Indexes: https://console.firebase.google.com/project/_/firestore/indexes');
console.log('- Documentation: docs/firestore-setup.md');

console.log('\n✨ Happy blogging with MiamBidi! ✨');
