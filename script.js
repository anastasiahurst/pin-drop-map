"use strict";

const form = document.querySelector(".form");
const inputType = document.querySelector(".form__input--type");
const inputDescription = document.querySelector(".form__input--description");
const cardTitle = document.querySelector(".cards__title");
const typeOption = document.querySelector(".type_option");
const sideBar = document.querySelector(".sidebar");

class Place {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  constructor(coords, type, description) {
    this.coords = coords; //[lat, lng]
    this.type = type; // point of interest OR family and friends - user selection
    this.description = description; // user's input
    this._setDate();
  }

  _setDate() {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    this.dateDescription = `${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class App {
  #map;
  #mapEvent;
  #places = [];

  constructor() {
    // get user's position
    this._getPosition();

    // get data from local storage
    this._getLocalStorage();

    // attach event handlers
    form.addEventListener("submit", this._newPlace.bind(this));
    sideBar.addEventListener("click", this._moveToPopup.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert(
            "We could not get your location, please refresh your page or check your settings"
          );
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    //   If we have coordinates, display the following map with the pin
    this.#map = L.map("map").setView(coords, 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    // Handling clicks on map
    this.#map.on("click", this._showForm.bind(this));

    this.#places.forEach((place) => {
      this._renderPlace(place);
      this._renderPlaceMarker(place);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.getElementsByClassName.display = "none";
    form.classList.remove("hidden");
  }

  _hideForm() {
    inputType.value = inputDescription.value = "";
    form.classList.add("hidden");
  }

  _newPlace(e) {
    e.preventDefault();

    //Get data from the form
    const type = inputType.value;
    const description = inputDescription.value;
    const { lat, lng } = this.#mapEvent.latlng;

    // Create a new Place object
    const place = new Place([lat, lng], type, description);

    // add new object to the Places array
    this.#places.push(place);

    // render place on map (marker)
    this._renderPlaceMarker(place);

    // // render place on the list
    this._renderPlace(place);

    // hide the formm + clear input fields
    this._hideForm();

    // set local storage
    this._setLocalStorage();
  }

  _renderPlaceMarker(place) {
    L.marker(place.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${place.type}--popup`,
        })
      )
      .setPopupContent(
        `${place.type === "point-of-interest" ? "????" : "????"} ${
          place.description
        }`
      )
      .openPopup();
  }

  _renderPlace(place) {
    let html = `
    <div class="new_place ${place.type}--card" data-id="${place.id}">
        <div class="icon">${
          place.type === "point-of-interest" ? "????" : "????"
        }</div>
        <div class="card__flex-row">
          <p class="left-flex">Type:</p>
          <p class="right-flex">${
            place.type === "point-of-interest"
              ? "Point of interest"
              : "Family and friends"
          }</p>
        </div>
        <div class="card__flex-row">
          <p class="left-flex">Description:</p>
          <p class="right-flex">${place.description}</p>
        </div>
        <div class="card__flex-row">
          <p class="left-flex">Added on:</p>
          <p class="right-flex">${place.dateDescription}</p>
        </div>
      </div>
    `;
    cardTitle.insertAdjacentHTML("afterend", html);
  }

  _moveToPopup(e) {
    const placeEl = e.target.closest(".new_place");
    if (!placeEl) return;
    const place = this.#places.find((place) => place.id === placeEl.dataset.id);
    this.#map.setView(place.coords, 14, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem("places", JSON.stringify(this.#places));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("places"));

    if (!data) return;

    this.#places = data;
  }
}

const app = new App();
