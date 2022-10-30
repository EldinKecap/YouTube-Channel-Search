import logo from './logo.svg';
import './App.css';
import {useEffect,useState} from 'react';
import jwt_decode from 'jwt-decode';

 

function App() {
  const [user,setUser] = useState({});

  function handleCallbackResponse(response) {
    console.log('Encoded JWT ID token: ' + response.credential);
    var userObject = jwt_decode(response.credential);
    console.log(userObject);
    setUser(userObject);
    document.getElementById('signInDiv').hidden = true;
    document.getElementById('searchbarWrapper').style.visibility = 'visible';
  }

  function handleSignOut(event){
      setUser({});
      document.getElementById('signInDiv').hidden = false;
      document.getElementById('searchbarWrapper').style.visibility = 'hidden';
  }

  useEffect(()=>{
    /* global google */
    google.accounts.id.initialize({
      client_id: '968923688843-5ukh6d21pf74s3ihrq0j3faso356oh36.apps.googleusercontent.com',
      callback: handleCallbackResponse
    })

    google.accounts.id.renderButton(
      document.getElementById('signInDiv'),
      {theme:'outline',size:'large'}
    );

    google.accounts.id.prompt();

  },[])

  return (
    <div className="App">
    <div id = "signInDiv"></div>
    {
      Object.keys(user).length != 0 &&
      <button class='btn' onClick={(e)=>handleSignOut(e)}>Sign Out</button>
    }
    {
      user && 
      <div class='right profile-container circle'>
      <img src={user.picture} class='circle profile-img' ></img>
      {/* <p>{user.name}</p> */}
      </div>
    }
    </div>
  );
}

export default App;
