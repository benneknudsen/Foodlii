"use strict";

// hide all pages
function hideAllPages() {
  let pages = document.querySelectorAll(".page");
  for (let page of pages) {
    page.style.display = "none";
  }
}

// show page or tab
function showPage(pageId) {
  hideAllPages();
  document.querySelector(`#${pageId}`).style.display = "block";
  location.href = `#${pageId}`;
  setActiveTab(pageId);
}

// sets active tabbar/ menu item
function setActiveTab(pageId) {
  let pages = document.querySelectorAll(".tabbar a");
  for (let page of pages) {
    if (`#${pageId}` === page.getAttribute("href")) {
      page.classList.add("active");
    } else {
      page.classList.remove("active");
    }

  }
}

// set default page
function setDefaultPage() {
  let page = "home";
  if (location.hash) {
    page = location.hash.slice(1);
  }
  showPage(page);
}

setDefaultPage();

function showLoader(show) {
  let loader = document.querySelector('#loader');
  if (show) {
    loader.classList.remove("hide");
  } else {
    loader.classList.add("hide");
  }
}

// ========== Firebase sign in functionality ========== //


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDsmOzscOqD9s6drRG0xX6z5eAG1Wn51o",
  authDomain: "foodlii.firebaseapp.com",
  databaseURL: "https://foodlii.firebaseio.com",
  projectId: "foodlii",
  storageBucket: "",
  messagingSenderId: "511622875493",
  appId: "1:511622875493:web:7d0d7c7e4e3af6b041b98c"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// Firebase UI configuration
const uiConfig = {
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  signInSuccessUrl: '#home',
};

// Init Firebase UI Authentication
let userId = "";
const ui = new firebaseui.auth.AuthUI(firebase.auth());

// Listen on authentication state change
firebase.auth().onAuthStateChanged(function(user) {
  let tabbar = document.querySelector('#tabbar');
  console.log(user);
  if (user) { // if user exists and is authenticated
    setDefaultPage();
    userId = user.uid;
    tabbar.classList.remove("hide");
    appendUserData(user);
    createDataBase(user);
  } else { // if user is not logged in
    showPage("login");
    userId = "";
    tabbar.classList.add("hide");
    ui.start('#firebaseui-auth-container', uiConfig);
  }
  showLoader(false);
});

const db = firebase.firestore();
const userRef = db.collection("users");

// ========== READ ==========
// watch the database ref for changes
userRef.onSnapshot(function(snapshotData) {
  let users = snapshotData.docs;
  // appendUsers(users);
});

// append users to the DOM
/* function appendUsers(users) {
  let htmlTemplate = "";
  for (let user of users) {
    htmlTemplate += `
      <img src="${user.data().img}">
    `;
  }
  document.querySelector('#profile_img').innerHTML = htmlTemplate;
}
*/
// connects the userId with the Databse


function createDataBase(user){

  let name = user.displayName;
  let mail = user.email;
  console.log(name);
  console.log(mail);

  db.collection("users").doc(userId).set({
    name: name,
    mail: mail,
  })
}

function saveRestaurant(id) {

  db.collection("users").doc(userId).set({
    myFavorites: firebase.firestore.FieldValue.arrayUnion(id)
  }, {
    merge: true
  });
}





function appendUserData(user) {
  document.querySelector('#profile').innerHTML += `
    <h2>${user.displayName}</h2>
    <p>${user.email}</p>
    <a class="right" href="#" onclick="logout()">Logout</a>
  `;
}
// sign out user

function logout() {
  firebase.auth().signOut();
}


let slider = document.getElementById("myRange");
let output = document.getElementById("demo2");
output.innerHTML = slider.value + " m";

slider.oninput = function() {
  output.innerHTML = this.value + " m";
}
//append nearby restaurants
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  let pos = {
    lat: position.coords.latitude,
    lng: position.coords.longitude
  };
  const proxyurl = "https://cors-anywhere.herokuapp.com/";
  let posts = [];
  let postFetchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${pos.lat},${pos.lng}&radius=${slider.value}&type=restaurant&key=AIzaSyD7CULsQgweSRCbd3f2g7a-I8KOW99p4DA`;
  console.log(postFetchUrl)
  fetch(proxyurl + postFetchUrl)
    .then(function(response) {
      console.log("OK")
      return response.json();
    })
    .then(function(json) {

      posts = json.results;

      function shuffle(posts) {
        let currentIndex = posts.length,
          temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;

          // And swap it with the current element.
          temporaryValue = posts[currentIndex];
          posts[currentIndex] = posts[randomIndex];
          posts[randomIndex] = temporaryValue;
        }

        return posts;
      }

      // Used like so
      posts = shuffle(posts);
      console.log(posts);
      appendResults(posts);
    });

    function appendResults(posts) {
     let htmlTemplate = "";
     for (let post of posts) {
       console.log("OK3");
       let image = "";
     if (post.photos){image = post.photos[0].photo_reference}
       htmlTemplate += `

        <div class="tinder--card" id='${post.place_id}'>
          <img src="https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${image}&key=AIzaSyD7CULsQgweSRCbd3f2g7a-I8KOW99p4DA">
          <h3>${post.name}</h3>
          <p>Address: ${post.vicinity}</p>
          <p>Rating: ${post.rating}</p>
        </div>
      `;
    }
    document.querySelector('#demo').innerHTML = htmlTemplate;
  }
}

function clearAlert() {
  alert("Your discover history has been cleared");
}
function tinder(){
var tinderContainer = document.querySelector('.tinder');
var allCards = document.querySelectorAll('.tinder--card');
var nope = document.getElementById('nope');
var love = document.getElementById('love');

function initCards(card, index) {
  var newCards = document.querySelectorAll('.tinder--card:not(.removed)');

  newCards.forEach(function (card, index) {
    card.style.zIndex = allCards.length - index;
    card.style.transform = 'scale(' + (20 - index) / 20 + ') translateY(-' + 30 * index + 'px)';
    card.style.opacity = (10 - index) / 10;
  });

  tinderContainer.classList.add('loaded');
}
initCards();




function createButtonListener(love) {
  return function (event) {
    var cards = document.querySelectorAll('.tinder--card:not(.removed)');
    var moveOutWidth = document.body.clientWidth * 1.5;

    if (!cards.length) return false;

    var card = cards[0];

    card.classList.add('removed');
    if (love) {
      card.style.transform = 'translate(' + moveOutWidth + 'px, -100px) rotate(-30deg)';
      console.log("liked")
      saveRestaurant(card.id)
    } else {
      card.style.transform = 'translate(-' + moveOutWidth + 'px, -100px) rotate(30deg)';
      console.log("disliked")
    }

    initCards();

    event.preventDefault();
  };
}

var nopeListener = createButtonListener(false);
var loveListener = createButtonListener(true);

nope.addEventListener('click', nopeListener);
love.addEventListener('click', loveListener);
}

//timeout

let myVar;

function timeOut() {
  myVar = setTimeout(tinder, 2000);
}
timeOut();
getLocation();
