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

  visualize() {
    if (this._clicked) {
      this._expandedImage.style.border = "3px solid green";
    } else {
      this._imageEl.style.border = "3px solid green";
    }
  }

  devisualize() {
    if (this._clicked) {
      this._expandedImage.style.border = "";
    } else {
      this._imageEl.style.border = "";
    }
  }
}

class KeyHandler {
  _onPressKey;
  _key;

  constructor(onPressKey, key = "d") {
    this._key = key;
    this._onPressKey = onPressKey;
    document.addEventListener("keypress", this._keyPressHandler.bind(this));
  }

  _keyPressHandler(event) {
    if (event.key === this._key) {
      this._onPressKey();
    }
  }
}

class ScrollHandler {
  _onScroll;

  constructor(onScroll) {
    this._onScroll = onScroll;
    this._createScrollStopListener(this._scrollHandler.bind(this));
  }

  _createScrollStopListener(callback, timeout = 200) {
    var handle = null;
    var onScroll = function() {
      if (handle) clearTimeout(handle); 
      handle = setTimeout(callback, timeout);
    };
    document.addEventListener("scroll", onScroll);
  }

  _scrollHandler() {
    this._onScroll();
  }
}

class BoardImageManager {
  _images;
  _curVisualized;

  constructor(parentEl = document) {
    const imageElements = Array.from(parentEl.querySelectorAll("img"))
    this._images = imageElements.map(image => new BoardImage(image));
    const toggler = new KeyHandler(this._onPressKey.bind(this));
    const visualizer = new ScrollHandler(this._onScroll.bind(this));
  }

  _getTopMostImage() {
    return this._images.find(image => image.getRelativeTop() > 0);
  }

  _onScroll() {
    if (this._curVisualized) {
      this._curVisualized.devisualize();
    }

    const topMostImage = this._getTopMostImage();
    if (topMostImage) { 
      this._curVisualized = topMostImage;
      topMostImage.visualize();
    }
  }

  _onPressKey() {
    const topMostImage = this._getTopMostImage();
    if (topMostImage) topMostImage.click();
  }
}

const manager = new BoardImageManager(document.querySelector(".board"))