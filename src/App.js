import React, { Component } from 'react';
import Particles from 'react-particles-js';
// import Clarifai from 'clarifai';
import Navigation from './Components/Navigation/Navigation.js';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition.js';
import Logo from './Components/Logo/Logo.js';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm.js';
import Rank from './Components/Rank/Rank.js';
import SignIn from './Components/SignIn/SignIn.js';
import Register from './Components/Register/Register.js';
import './App.css';

// const app = new Clarifai.App({
//   apiKey: '13940750695a4f419b3bb54c588f9677',
// });

const particlesOption = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_are: 800
      }
    }
  }
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

  // -----------------------------
  // Comunicación con el backend

  // componentDidMount() {
  //   fetch('http://localhost:3001/')
  //     .then(response => response.json())
  //     .then(console.log);                   // data se usa automaticamente
  // }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,       
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  // -----------------------------

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }

  onPictureSubmit = () => {
    this.setState({imageUrl: this.state.input});

    //app.models.predict('c0c0ac362b03416da06ab3fa36fb58e3', this.state.input).then(
    // app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    fetch('http://localhost:3001/imageurl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })              
      })
    .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('http://localhost:3001/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })              
          })
            .then(response => response.json())
            .then(count => {
              // this.setState({user: {
              //     entries: count
              // }})
              this.setState(Object.assign(this.state.user, { entries: count }));
            })
            .catch(console.log);   
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })          
      .catch(err => console.log(err)); 
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      //this.setState({isSignedIn: false})
      this.setState(initialState)
    } else if (route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  
  render() {
    const { isSignedIn, imageUrl, route, box, user } = this.state;
    return (
      <div className="App">
        <Particles className="particles" params={particlesOption}/>
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home'
          ? <div>
              <Logo />
              <Rank name={user.name} entries={user.entries} />
              <ImageLinkForm onInputChange={this.onInputChange} onPictureSubmit={this.onPictureSubmit}/>
              <FaceRecognition box={box} imageUrl={imageUrl}/>
            </div>
          : (
            route === 'signin'
            ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )                    
        }
      </div>
    );
  }
}

export default App;
