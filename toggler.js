// ==UserScript==
// @name         Keybind Image Toggler 4chan
// @namespace    http://dasphotias.ht/
// @version      0.0.1
// @author       Dasphotiasht
// @include      *://boards.4chan.org/*/thread/*
// @include      *://boards.4channel.org/*/thread/*
// @description  Add keybind to be able to toggle the top most image on screen
// @run-at       document-end
// ==/UserScript==

class BoardImage {
  _imageEl;
  _expandedImage;
  _clicked = false;

  constructor(imageEl) {
    this._imageEl = imageEl;
  }

  getRelativeTop() {
    return this._imageEl.getBoundingClientRect().top || this._expandedImage.getBoundingClientRect().top;
  }

  click() {
    if (this._clicked) {
      this._expandedImage.click();
      this._expandedImage = null;
      this._clicked = false;
    } else {
      this._imageEl.click();
      this._expandedImage = this._imageEl.nextElementSibling;
      this._clicked = true;
    }
  }
}

class Toggler {
  _images;
  _key;

  constructor(parentEl = document, key = "d") {
    this._key = key;
    this._init(parentEl);
  }

  _init(parentEl) {
    document.addEventListener("keypress", this._keyPressHandler.bind(this));
    const images = Array.from(parentEl.querySelectorAll("img"));
    this._images = images.map(image => new BoardImage(image));
  }

  _keyPressHandler(event) {
    if (event.key === this._key) {
      let topMostImage = this._images.find(image => image.getRelativeTop() > 0);
      if (topMostImage) {
        topMostImage.click();
      }
    }
  }
}

const toggler = new Toggler(document.querySelector(".board"));