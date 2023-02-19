// ==UserScript==
// @name         Keybind Image Toggler 4chan
// @namespace    http://dasphotias.ht/
// @version      0.4
// @author       Dasphotiasht
// @include      *://boards.4chan.org/*/thread/*
// @include      *://boards.4channel.org/*/thread/*
// @updateURL    https://raw.githubusercontent.com/dasphotiasht/image-toggler-keyboard-4chan/master/toggler.js
// @description  Add keybind to be able to toggle the top most image on screen
// @run-at       document-end
// ==/UserScript==

class BoardImage {
  _imageEl;

  constructor(imageEl) {
    this._imageEl = imageEl;
  }

  _getImgPreview() {
    const sibling = this._imageEl.nextElementSibling;
    if (sibling && sibling.nodeName === "IMG") {
      return sibling;
    }

    const videoElement = this._imageEl.parentElement.nextElementSibling;
    if (videoElement && videoElement.nodeName === "VIDEO") {
      return videoElement;
    }
      
    return null;
  }

  _getToggler() {
    const sibling = this._imageEl.nextElementSibling;
    if (sibling && sibling.nodeName === "IMG") {
      return sibling;
    }

    const linkElements = this._imageEl.parentElement.parentElement.querySelectorAll("a");
    const closeElement = Array.from(linkElements).find(el => el.innerText === "Close");
    if (closeElement) {
      return closeElement;
    }
      
    return null;
  }

  getRelativeTop() {
    const imgSibling = this._getImgPreview();
    if (imgSibling) {
      return imgSibling.getBoundingClientRect().top;
    } else {
      return this._imageEl.getBoundingClientRect().top;
    }
  }

  click() {
    const imgSibling = this._getToggler();
    if (imgSibling) {
      imgSibling.click();
    } else {
      this._imageEl.click();
    }
  }

  visualize() {
    const imgSibling = this._getImgPreview();
    if (imgSibling) {
      imgSibling.style.border = "3px solid green";
    } else {
      this._imageEl.style.border = "3px solid green";
    }
  }

  devisualize() {
    const imgSibling = this._getImgPreview();
    if (imgSibling) {
      imgSibling.style.border = "";
    } else {
      this._imageEl.style.border = "";
    }
  }
}

class KeyHandler {
  _keys;

  constructor() {
    this._keys = {};
    document.addEventListener("keypress", this._keyPressHandler.bind(this));
  }

  addKey(key, handler) {
    this._keys[key] = handler;
  }

  _keyPressHandler(event) {
    const handler = this._keys[event.key]
    if (handler) {
      handler(event);
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
    const keyHandler = new KeyHandler();
    keyHandler.addKey('d', this._onPressKey.bind(this));
    keyHandler.addKey('f', this._onToggleMute.bind(this));
    const visualizer = new ScrollHandler(this._onScroll.bind(this));
  }

  _getTopMostImage() {
    if (this._curVisualized) {
      return this._curVisualized;
    }
    return this._images.find(image => image.getRelativeTop() > 0);
  }

  _onScroll() {
    if (this._curVisualized) {
      this._curVisualized.devisualize();
      this._curVisualized = null;
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

  _onToggleMute() {
    const currentPlayingVideo = document.querySelector('video');
    if (currentPlayingVideo) {
      currentPlayingVideo.muted = !currentPlayingVideo.muted;
    }
  }
}

const manager = new BoardImageManager(document.querySelector(".board"))