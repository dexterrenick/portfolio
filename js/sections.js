(function () {
  function extractSection(htmlText) {
    var container = document.createElement('div');
    container.innerHTML = htmlText;
    var title = container.querySelector('.title-section');
    var main = container.querySelector('.main-content');
    var fragment = '';
    if (title) fragment += title.outerHTML;
    if (main) fragment += main.outerHTML;
    return fragment;
  }

  function reinitPortfolio() {
    try {
      if (typeof CBPGridGallery !== 'undefined') {
        var galleryEl = document.getElementById('grid-gallery');
        if (galleryEl) new CBPGridGallery(galleryEl);
      }
      // Re-bind header hide/show on slideshow open/close
      var header = document.getElementById('navbar-collapse-toggle');
      var gridFigures = document.querySelectorAll('.grid figure');
      gridFigures.forEach(function (fig) {
        fig.addEventListener('click', function () {
          if (header) header.classList.add('hide-header');
        });
      });
      var navClose = document.querySelector('.nav-close');
      if (navClose) {
        navClose.addEventListener('click', function () {
          if (header) header.classList.remove('hide-header');
        });
      }
      var navPrev = document.querySelector('.nav-prev');
      var navNext = document.querySelector('.nav-next');
      if (navPrev) {
        navPrev.addEventListener('click', function () {
          var first = document.querySelector('.slideshow ul li:first-child');
          if (first && first.classList.contains('current') && header) header.classList.remove('hide-header');
        });
      }
      if (navNext) {
        navNext.addEventListener('click', function () {
          var last = document.querySelector('.slideshow ul li:last-child');
          if (last && last.classList.contains('current') && header) header.classList.remove('hide-header');
        });
      }
    } catch (e) {
      // noop
    }
  }

  function loadInto(containerSelector, url, after) {
    var container = document.querySelector(containerSelector);
    if (!container) return;
    fetch(url)
      .then(function (res) { return res.text(); })
      .then(function (html) {
        container.innerHTML = extractSection(html);
        if (typeof after === 'function') after();
      })
      .catch(function () { /* ignore */ });
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadInto('.about', 'about.html');
    loadInto('.portfolio', 'portfolio.html', reinitPortfolio);
    loadInto('.contact', 'contact.html');
  });
})();


