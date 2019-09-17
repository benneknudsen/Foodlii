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
    appendUserData(user)
    update(user);
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

function update(user) {
  userRef.doc(userId).onSnapshot({
    includeMetadataChanges: true
  }, function(doc) {
    if (!doc.metadata.hasPendingWrites && doc.data()) {
      emtpyTemplate();
      fetchfavorites(doc.data().myFavorites);
    }
  });
}

function saveRestaurant(id) {

  db.collection("users").doc(userId).set({
    myFavorites: firebase.firestore.FieldValue.arrayUnion(id)
  }, {
    merge: true
  });
}

function removeFromFavourites(id) {
  db.collection("users").doc(userId).update({
    myFavorites: firebase.firestore.FieldValue.arrayRemove(id)
  });
}

function removeAllFavourites(id){
  db.collection("users").doc(userId).set({

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
      let rating = "";
      if (post.photos) {
        image = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${post.photos[0].photo_reference}&key=AIzaSyD7CULsQgweSRCbd3f2g7a-I8KOW99p4DA`
      } else {
        image = "billeder/nophoto.png"
      }
      if (post.rating) {
        rating = `${post.rating}`
      } else {
        rating = "NA"
      }
      htmlTemplate += `

        <div class="tinder--card" id='${post.place_id}'>
        <div class="card-img-container">
          <img class="card-img" src="${image}">
          <div class="card-information">
          <h3>${post.name}</h3>
          <p>Rating: <span>${rating} / 5 </span></p>
          </div>
          </div>
        </div>
        </div>
      `;
    }
    document.querySelector('#demo').innerHTML = htmlTemplate;
  }
}

//fetch favorites
function fetchfavorites() {
  let docRef = db.collection("users").doc(userId); //put userId here
  let filteredFavorites;
  docRef.get().then(function(doc) {
    if (doc.exists) {
      filteredFavorites = doc.data().myFavorites;
      console.log("Document data:", filteredFavorites)

      for (let filteredFavorite of filteredFavorites) //go through the array and load each placeID separately
      {
        console.log(filteredFavorite);
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        let favorites = [];
        let favoriteFetchUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${filteredFavorite}&key=AIzaSyD7CULsQgweSRCbd3f2g7a-I8KOW99p4DA`;
        console.log(favoriteFetchUrl)
        fetch(proxyurl + favoriteFetchUrl)
          .then(function(response) {
            return response.json();
          })
          .then(function(json) {
            favorites = json;
            appendFavorites(favorites);
            appendDetails(favorites);
          });
      }

      function appendFavorites(favorites) {
        let htmlTemplate = "";

        let image = "";
        let rating = "";
        if (favorites.result.photos) {
          image = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${favorites.result.photos[0].photo_reference}&key=AIzaSyD7CULsQgweSRCbd3f2g7a-I8KOW99p4DA`
        } else {
          image = "billeder/nophoto.png"
        }
        if (favorites.result.rating) {
          rating = `${favorites.result.rating}`
        } else {
          rating = "NA"
        }
        let open = "";
        if (favorites.result.opening_hours.open_now) {
          open = 'Open'
        } else {
          open = "Closed";
        }

        document.querySelector('#fetchfavorite').innerHTML += `

                <div class="fav-container">
                <div>
                <i class="fas fa-trash" onclick="removeFromFavourites('${favorites.result.place_id}')"></i>
                </div>
                <div class="fav-image" onclick="showPage('button_${favorites.result.place_id}')">
                  <img src="${image}">
                </div>
                <div class="fav-name" onclick="showPage('button_${favorites.result.place_id}')">

                <p class="favorite_header">${favorites.result.name}</p><p> ${open}</p>

                </div>
                <div>
                <i class="fas fa-angle-right"  onclick="showPage('button_${favorites.result.place_id}')" ></i>
                </div>
                </div>
              `;
      }

      function appendDetails(favorites, position) {
        let htmlTemplate = "";
        let image = "";
        let rating = "";
        if (favorites.result.photos) {
          image = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${favorites.result.photos[0].photo_reference}&key=AIzaSyD7CULsQgweSRCbd3f2g7a-I8KOW99p4DA`
        } else {
          image = "billeder/nophoto.png"
        }
        if (favorites.result.rating) {
          rating = `${favorites.result.rating}`
        } else {
          rating = "NA"
        }
        let open = "";
        if (favorites.result.opening_hours.open_now) {
          open = 'Open'
        } else {
          open = "Closed";
        }
        let website = "";
        if (favorites.result.website) {
          website = `${favorites.result.website}`
        } else {
          website = "#home";
        }

        document.querySelector('#detailedView').innerHTML += `
              <section id="button_${favorites.result.place_id}" class="page detail_container">
              <div class="detail">
                <div class="detailimg">
                  <img src="${image}">
                </div>
                <div class="detailtext">
              <h3>${favorites.result.name}</h3>
              <p><i class="fas fa-star"></i>${rating} out of 5 (${favorites.result.user_ratings_total} ratings)</p>
              <p><i class="fas fa-clock"></i>${open}</p>
              <p><i class="fas fa-map-marker-alt"></i>${favorites.result.formatted_address}</p>
              <p><i class="fas fa-phone"></i>${favorites.result.formatted_phone_number}</p>
              <a class="website_button" href="${website}" target="_blank"><i class="fas fa-globe-europe klode" ></i>Visit website</a> <br><br>
              <a class="website_button" href="https://www.google.com/maps/dir/?api=1&origin=&destination=${favorites.result.geometry.location.lat},${favorites.result.geometry.location.lng}" target="_blank"><i class="fas fa-location-arrow klode"></i>Navigate</a>
              </div>
              </div>
              </section>

            `;
      };
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }).catch(function(error) {
    console.log("Error getting document:", error);
  });

}

function emtpyTemplate() {
  document.querySelector("#fetchfavorite").innerHTML = "";
}

function clearAlert() {
  alert("Your discover history has been cleared");
}

function tinder() {
  var tinderContainer = document.querySelector('.tinder');
  var allCards = document.querySelectorAll('.tinder--card');
  var nope = document.getElementById('nope');
  var love = document.getElementById('love');

  function initCards(card, index) {
    var newCards = document.querySelectorAll('.tinder--card:not(.removed)');

    newCards.forEach(function(card, index) {
      card.style.zIndex = allCards.length - index;
      card.style.transform = 'scale(' + (20 - index) / 20 + ') translateY(-' + 30 * index + 'px)';
      card.style.opacity = (10 - index) / 10;
    });

    tinderContainer.classList.add('loaded');
  }
  initCards();




  function createButtonListener(love) {
    return function(event) {
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
