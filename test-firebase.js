// Simple Firebase connection test
// Loads Firebase config from .env.local
require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function testFirebase() {
  console.log('\n🔥 Testing Firebase Connection...\n');

  // Check if environment variables are loaded
  if (!firebaseConfig.apiKey) {
    console.error('❌ ERROR: Firebase configuration not found in .env.local');
    console.error('Make sure .env.local exists with all NEXT_PUBLIC_FIREBASE_* variables');
    process.exit(1);
  }

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
    console.log('✅ Firestore connected');

    // Test write
    console.log('\n📝 Testing write to Firestore...');
    const testDoc = await addDoc(collection(db, 'analyses'), {
      test: true,
      message: 'Firebase connection test',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Write successful! Document ID:', testDoc.id);

    // Test read
    console.log('\n📖 Testing read from Firestore...');
    const querySnapshot = await getDocs(collection(db, 'analyses'));
    console.log(`✅ Read successful! Found ${querySnapshot.size} document(s)`);

    // Clean up test document
    console.log('\n🧹 Cleaning up test document...');
    await deleteDoc(doc(db, 'analyses', testDoc.id));
    console.log('✅ Test document deleted');

    console.log('\n🎉 ALL TESTS PASSED! Firebase is configured correctly!\n');
    console.log('Your app is ready to use. Open http://localhost:3005 to start analyzing videos.\n');

  } catch (error) {
    console.error('\n❌ FIREBASE TEST FAILED:\n');
    console.error('Error:', error.message);
    console.error('\nCommon issues:');
    console.error('1. Missing .env.local file - Copy from .env.example and fill in your Firebase credentials');
    console.error('2. Firestore Database not created - Go to Firebase Console → Build → Firestore Database → Create database');
    console.error('3. Security rules not set - Go to Firestore Database → Rules tab → Publish the rules');
    console.error('4. Wrong Firebase config - Check your .env.local has correct NEXT_PUBLIC_FIREBASE_* values');
    console.error('\n');
    process.exit(1);
  }

  process.exit(0);
}

testFirebase();
