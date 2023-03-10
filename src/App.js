import './App.css';
import { initializeApp } from "firebase/app";
import axios from 'axios'
import moment from 'moment'
import { getDocs, getFirestore, onSnapshot } from "firebase/firestore"
import { collection, addDoc } from "firebase/firestore"; 
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import { useEffect, useState } from 'react';

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [newMessage, setNewMessage] = useState()
  const [allowedUsers, setAllowedUsers] = useState([])
  const [newMessageUser, setNewMessageUser] = useState()
  const [messages, setMessages] = useState([])
  const [currentUID, setCurrentUID] = useState()
  const [gifURL, setGifURL] = useState()
  const [successfulPost, setSuccessfulPost] = useState(false)
  const provider = new GoogleAuthProvider();
  const currentDate = new Date()
  const revealDate = new Date('12-30-2023')
  
  const GIPHY_API_KEY = process.env.REACT_APP_GIPHY_API_KEY

  const firebaseConfig = {
    apiKey: "AIzaSyAZ5_P5jqxM6ctmZFTqSHQ2Y565kQko8JY",
    authDomain: "gratitude-jar-79dfa.firebaseapp.com",
    projectId: "gratitude-jar-79dfa",
    storageBucket: "gratitude-jar-79dfa.appspot.com",
    messagingSenderId: "932710267715",
    appId: "1:932710267715:web:ef060b23bc823156354df6"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  const auth = getAuth(app);

  const db = getFirestore(app)

  useEffect(() => onSnapshot(collection(db, "messages"), (snapshot) =>
      setMessages(snapshot.docs.map(doc => doc.data()))
  ),[db])

  useEffect(() => {
    const getData = async () => {
      const colRef = collection(db, "allowed-users")
      const docSnap = await getDocs(colRef)
      docSnap.forEach((doc) => {
        setAllowedUsers(allowedUsers => [...allowedUsers, doc.id])
      })
    }
    getData()
  },[db])

  useEffect(() => {
    const getData = async () => {
      await axios.get('https://api.giphy.com/v1/gifs/random?api_key=' + GIPHY_API_KEY + '&tag=%27wait%27')
        .then((response) => {
          setGifURL(response.data.data.images.downsized.url)
        })
    }
    getData()
  },[GIPHY_API_KEY])
  
  
  const postData = (e) => {
    e.preventDefault()
    addDoc(collection(db, "messages"), {
      message: newMessage,
      name: newMessageUser,
      date: new Date()
    })
    showPostSuccessful()
  }

  const formatDate = (date) => {
    const outputDate= new Date(date.seconds * 1000)
    //onst outputDate = Date.parse(UKFormat)
    return outputDate
  }

  const signIn = () => {
    signInWithPopup(auth, provider)
    .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    //const credential = GoogleAuthProvider.credentialFromResult(result);
    //const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    setCurrentUID(user.uid)
    setLoggedIn(true)
  // ...
  }).catch((error) => {
    // Handle Errors here.
    //const errorCode = error.code;
    //const errorMessage = error.message;
    //const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
}

const showContent = () => {
  if (loggedIn && allowedUsers.includes(currentUID, 0)) {
    return false
  } else {
    return true
  }
}

const showGratitude = () => {
  if (currentDate > revealDate) {
    //show gratitude
    return false
  } else {
    return true
  }
}

const showPostSuccessful = () => {
  setSuccessfulPost(true)
  setTimeout(() => setSuccessfulPost(false), 3000)

}
  
  return (
    <div className="App">
      <body>
        <div className="container px-4 text-center">
          <div className="row">
            <button type="submit" className="btn btn-primary mb-3" onClick={signIn} hidden={loggedIn}> Sign in with Google</button>
          </div>


          <div className="loggedInBody" hidden={showContent()}>
            <div className="row">
              <h1>What are you grateful for?</h1>
            </div>
            <div className="row">
              <form>
              <div className="input-group col">
                <div class="alert alert-success" role="alert" hidden={!successfulPost}>
                  Posted successfully
                </div>
                <span className="input-group-text">I am grateful for...</span>
                <textarea className="form-control" aria-label="grateful-comments" onChange={(e) => setNewMessage(e.target.value)}></textarea>
                <select className = "form-select form-select-sm" aria-label=".form-select-sm example" onChange={(e) => setNewMessageUser(e.target.value)}>
                  <option defaultValue>Open this select menu</option>
                  <option value="Isla">Isla</option>
                  <option value="Isabelle">Isabelle</option>
                  <option value="Daddy">Daddy</option>
                  <option value="Mummy">Mummy</option>
                </select>
              </div>
              <div className = "row gy-3">
                <div className="col gx-3">
                  <button type="submit" className="btn btn-primary mb-3" onClick={(e) => postData(e)}>Post</button>
                </div>
              </div>
            </form>
            <div className="row gx-3 gy-3" hidden={!showGratitude()}>
              <img src={gifURL} alt="wait gif" />
              <h4>{Math.ceil((revealDate - currentDate) / 1000 / 60 / 60 / 24)} days until gratitude reveal</h4>
            </div>
            <div className="row gx-3 gy-3" hidden={showGratitude()}>
              {messages.map((message, index) =>
              <div className = "col">
                <div key={index} className="card p-3">
                  <div className='card-body'>
                      <h5 className="card-title">{message.name}</h5>
                      <p className="badge text-bg-success">Week { moment(formatDate(message.date)).week() }</p>
                      <p>{new Date(message.date.seconds * 1000).toLocaleDateString("en-GB")}</p>
                      <p className="card-text">{message.message}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js" integrity="sha384-mQ93GR66B00ZXjt0YO5KlohRA5SY2XofN4zfuZxLkoj1gXtW8ANNCe9d5Y3eG5eD" crossOrigin="anonymous"></script>
      </body>
    </div>
  );
}

export default App;
