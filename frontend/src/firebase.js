import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
     apiKey: 'AIzaSyBVZ5Asa-jvZfDdHT_cCRWUcZtitAYmVJI',
     authDomain: 'analysisic.firebaseapp.com',
     projectId: 'analysisic',
     storageBucket: 'analysisic.firebasestorage.app',
     messagingSenderId: '538822735646',
     appId: '1:538822735646:web:87643447dc85e9133e7b0f',
     measurementId: 'G-EK1K3LM6MJ'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
