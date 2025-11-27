// Simple Firebase connection test
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCJxY5Xz6bTMzHelLXuyTJK0hBK7MvlP8Y",
  authDomain: "deep-analyzer-390e7.firebaseapp.com",
  projectId: "deep-analyzer-390e7",
  storageBucket: "deep-analyzer-390e7.firebasestorage.app",
  messagingSenderId: "899258306632",
  appId: "1:899258306632:web:5e34d6b0de6a3f8920487d"
};

async function testFirebase() {
  console.log('\n🔥 Testing Firebase Connection...\n');

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
    console.error('1. Firestore Database not created - Go to Firebase Console → Build → Firestore Database → Create database');
    console.error('2. Security rules not set - Go to Firestore Database → Rules tab → Publish the rules');
    console.error('3. Wrong project - Check that you\'re using project: deep-analyzer-390e7');
    console.error('\n');
    process.exit(1);
  }

  process.exit(0);
}

testFirebase();
