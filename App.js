import React, { Component } from 'react';
import Navigation from './Components/Navigation/Navigation';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import ParticlesBg from 'particles-bg'
import './App.css';
 


const setupClarifai = (imageUrl) => {
const PAT = '307d0546e6074b3ea915ffcb1b190248';
const USER_ID = 'jphil909';       
const APP_ID = 'facedetection';






const raw = JSON.stringify({
    "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
    },
    "inputs": [
        {
            "data": {
                "image": {
                    "url": imageUrl
                }
            }
        }
    ]
});

 const requestOptions = {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT
    },
    body: raw
};
return requestOptions
}

const initialState = {
  
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
      }
    
}
   
class App extends Component {
constructor() {
    super();
    this.state = initialState;
  }

loadUser = (data) => {
  this.setState({user: {
    id: data.id,
    name: data.name,
    email: data.email,
    entries: data.entries,
    joined: data.joined
  }})
}

calculateFaceLocation = (data) => {
  console.log({dataInCalcFaceLocation: data});
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }

  }
  
displayFaceBox = (box) => {
  console.log(box);
  this.setState({box: box});

}

onInputChange = (event) => {
  console.log(event);
  this.setState({input: event.target.value});

}

onButtonSubmit = () => {
  this.setState({imageUrl: this.state.input});
  const MODEL_ID = 'face-detection';
    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID +  "/outputs", setupClarifai(this.state.input)) // <== this api call is passing and returning what it supposed to return
    .then(response => response.json()) // <== added this line because when you use fetch it returns a promise and you have to do response.json() to resolve it which is why we were not getting the proper response 
    .then(response => {
      if (response) {
      console.log("response Before /image api call", response);

        fetch('http://localhost:3001/image', { // you were making post requests to port 3000 but your server was on port 3001
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
         .then(response => response.json())
         // you have two responses one on line 126 and another on line 116 which one do you have to send to calculateFaceLocation
         // assuming the one from line 116?
            .then(count => {
               this.setState(Object.assign(this.state.user, { entries: count}))
    })
     this.displayFaceBox(this.calculateFaceLocation(response))
    }

  })
    .catch(err => console.log(err));  
}

onRouteChange = (route) => {
  if (route === 'signout') {
    this.setState(initialState)
  } else if (route === 'home') {
    this.setState({isSignedIn: true})
  }
    this.setState({route: route});
  }

  render() { 
  return (
    <div className="App">
      <ParticlesBg type="color" bg={true} />
      <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
      { this.state.route === 'home' 
        ? <div>
          <Logo />
          <Rank name={this.state.user.name} entries={this.state.user.entries} />
      <ImageLinkForm 
      onInputChange={this.onInputChange} 
      onButtonSubmit={this.onButtonSubmit} />
      <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
      </div>

      : (
          this.state.route === 'signin' 
          ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        )
      
    }
    </div> 

    );
  }
}
export default App; 
