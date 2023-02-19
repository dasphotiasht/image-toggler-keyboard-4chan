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

const FORWARD_AMOUNT = 3;
const FORWARD_KEY = "d";
const REWIND_KEY = "a";
const TOGGLE_MUTE_KEY = "c";                                                                                     ;
const TOGGLE_FULLSCREEN_KEY = "f";
const TOGGLE_IMG_KEY = "e"; 

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

  focus() {
    const imgSibling = this._getImgPreview();
    if (imgSibling) {
      imgSibling.focus();
    } else {
      this._imageEl.focus();
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
  _listeners;

  constructor() {
    this._listeners = [];
    this._createScrollStopListener(this._scrollHandler.bind(this));
  }

  addListener(listener) {
    this._listeners.push(listener);
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
    this._listeners.forEach(listener => listener());
  }
}

class BoardImageManager {
  _images;
  _curVisualized;

  constructor(parentEl = document) {
    const imageElements = Array.from(parentEl.querySelectorAll("img"))
    this._images = imageElements.map(image => new BoardImage(image));
    const keyHandler = new KeyHandler();
    keyHandler.addKey(TOGGLE_IMG_KEY, this._onToggleImg.bind(this));
    keyHandler.addKey(TOGGLE_MUTE_KEY, this._onToggleMute.bind(this));
    keyHandler.addKey(TOGGLE_FULLSCREEN_KEY, this._onToggleFullscreen.bind(this));
    keyHandler.addKey(FORWARD_KEY, this._onForwardVideo.bind(this));
    keyHandler.addKey(REWIND_KEY, this._onRewindVideo.bind(this));
    const scrollHandler = new ScrollHandler();
    scrollHandler.addListener(this._onScroll.bind(this));
  }

  _getTopMostImage() {
    if (this._curVisualized) {
      return this._curVisualized;
    }

    const windowHeight = window.innerHeight;
    return this._images.find(image => {
      const relTop = image.getRelativeTop();
      return (relTop > 0 && relTop < windowHeight);
    });
  }

  _getLastVideoElement() {
    const videoEls = document.querySelectorAll("video");
    if (videoEls.length > 0) {
      const lastVidEl = videoEls[videoEls.length - 1];
      return lastVidEl;
    }
    return null;
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

  _onToggleImg() {
    if (this._curVisualized) {
      this._curVisualized.click();
      this._curVisualized.focus();
    }
  }

  _onToggleMute() {
    const lastVidEl = this._getLastVideoElement()
    if(lastVidEl) {
      lastVidEl.muted = !lastVidEl.muted;
    }
  }

  _onToggleFullscreen() {
    const lastVidEl = this._getLastVideoElement()
    if(lastVidEl) {
      lastVidEl.requestFullscreen();
    }
  }

  _onForwardVideo() {
    const lastVidEl = this._getLastVideoElement()
    if(lastVidEl) {
      lastVidEl.currentTime += FORWARD_AMOUNT;
    }
  }

  _onRewindVideo() {
    const lastVidEl = this._getLastVideoElement()
    if(lastVidEl) {
      lastVidEl.currentTime -= FORWARD_AMOUNT;
    }
  }
}

const manager = new BoardImageManager(document.querySelector(".board"))