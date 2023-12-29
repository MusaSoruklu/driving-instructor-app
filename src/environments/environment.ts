export const environment = {
    production: false, // Set to true for production environment
    firebaseConfig: {
        apiKey: "AIzaSyAVoNW8lGdhi7fNldD9Zq9_WHzGDOkV2Oo",
        authDomain: "lyrns-firebase.firebaseapp.com",
        projectId: "lyrns-firebase",
        storageBucket: "lyrns-firebase.appspot.com",
        messagingSenderId: "393351899048",
        appId: "1:393351899048:web:90e87820bb55a151169f9d",
        measurementId: "G-RJZTZ4KWM0"
    },
    firebaseEmulatorConfig: {
        functionsEmulatorURL: 'http://localhost:5001', // the default URL for functions, change the port if you use a different one
        firestoreEmulatorHost: 'localhost:8080', // the default for firestore, change the port if you use a different one
        authEmulatorHost: 'http://localhost:9099', // the default for auth, change the port if you use a different one
    }
};