"use strict";


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
let postFetchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${pos.lat},${pos.lng}&radius=1500&type=restaurant&key=AIzaSyD7CULsQgweSRCbd3f2g7a-I8KOW99p4DA`;
fetch(postFetchUrl)
  .then(function(response) {
    return response.json();
  })
  .then(function(posts) {
    console.log(json);
    appendResults();
  });
  function appendResults(posts) {
    let htmlTemplate = "";
    for (let post of posts) {
      console.log(posts);
      htmlTemplate += `
        <article>
          <p>${post.results.name}</p>
        </article>
      `;
    }
    document.querySelector('#demo').innerHTML = htmlTemplate;
  }
}
