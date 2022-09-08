"use strict";

const form = document.querySelector(".form");
const inputType = document.querySelector(".form__input--type");
const inputDescription = document.querySelector(".form__input--description");
let map, mapEvent;

// getting location and storing latitude and longitude
if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      const coords = [latitude, longitude];
      console.log(latitude, longitude);
      console.log(coords);

      //   If we have coordinates, display the following map with the pin

      map = L.map("map").setView(coords, 13);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Handling clicks on map
      map.on("click", function (mapE) {
        mapEvent = mapE;
        form.classList.remove("hidden");
      });
    },
    function () {
      alert(
        "We could not get your location, please refresh your page or check your settings"
      );
    }
  );

form.addEventListener("submit", function (e) {
  e.preventDefault;
  // clear input fields
  inputType.value = inputDescription.value = "";

  // Display the pin drop
  const { lat, lng } = mapEvent.latlng;
  // Marker
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: "homes-popup",
      })
    )
    .setPopupContent("Text")
    .openPopup();
});
