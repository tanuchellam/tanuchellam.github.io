(function () {
  'use strict';

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { navLinks.classList.remove('open'); });
    });
  }

  // Career timeline reveal
  var rows = document.querySelectorAll('.timeline-row');
  if (rows.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });
    rows.forEach(function (row) { observer.observe(row); });
  } else {
    rows.forEach(function (row) { row.classList.add('in-view'); });
  }

  // Earlier roles toggle
  var earlierToggle = document.querySelector('.earlier-toggle');
  var earlierSection = document.querySelector('.timeline-earlier');
  if (earlierToggle && earlierSection) {
    earlierToggle.addEventListener('click', function () {
      var open = earlierSection.classList.toggle('open');
      earlierToggle.textContent = open ? 'Hide earlier roles' : 'Show earlier roles (2005–2017)';
      if (open) {
        earlierSection.querySelectorAll('.timeline-row').forEach(function (row) {
          if ('IntersectionObserver' in window) { observer.observe(row); } else { row.classList.add('in-view'); }
        });
      }
    });
  }

  // Portfolio slider + modal
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.slider-dots button'));
  var infoCategory = document.querySelector('.slide-category');
  var infoTitle = document.querySelector('.slide-title');
  var infoDesc = document.querySelector('.slide-desc');
  var indexLabel = document.querySelector('.slide-index-label');
  var countLabel = document.querySelector('.slide-count-label');
  var modalOverlay = document.querySelector('.modal-overlay');
  var modalBox = document.querySelector('.modal-box');

  if (slides.length) {
    var current = 0;

    function goTo(i) {
      current = ((i % slides.length) + slides.length) % slides.length;
      slides.forEach(function (s, idx) { s.classList.toggle('active', idx === current); });
      dots.forEach(function (d, idx) { d.classList.toggle('active', idx === current); });
      var data = slides[current].dataset;
      if (infoCategory) infoCategory.textContent = data.category || '';
      if (infoTitle) infoTitle.textContent = data.title || '';
      if (infoDesc) infoDesc.textContent = data.desc || '';
      if (indexLabel) indexLabel.textContent = String(current + 1).padStart(2, '0');
      if (countLabel) countLabel.textContent = String(slides.length).padStart(2, '0');
    }

    dots.forEach(function (d, idx) { d.addEventListener('click', function () { goTo(idx); }); });

    var prevBtn = document.querySelector('.slider-prev');
    var nextBtn = document.querySelector('.slider-next');
    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); goTo(current + 1); });

    var sliderHit = document.querySelector('.slider-hit');
    if (sliderHit && modalOverlay) {
      sliderHit.addEventListener('click', function () { openModal(current); });
    }

    function openModal(i) {
      var data = slides[i].dataset;
      var modalCategory = modalOverlay.querySelector('.modal-category');
      var modalTitle = modalOverlay.querySelector('.modal-title');
      var modalBody = modalOverlay.querySelector('.modal-body');
      var modalTagsWrap = modalOverlay.querySelector('.modal-tags');
      var modalLink = modalOverlay.querySelector('.modal-link');
      var modalImages = modalOverlay.querySelector('.modal-images');

      if (modalCategory) modalCategory.textContent = data.category || '';
      if (modalTitle) modalTitle.textContent = data.title || '';

      // swap in the pre-authored modal content for this slide
      var sourceBody = document.getElementById(data.modalBody);
      if (modalBody && sourceBody) modalBody.innerHTML = sourceBody.innerHTML;

      var sourceImages = document.getElementById(data.modalImages);
      if (modalImages) {
        modalImages.innerHTML = sourceImages ? sourceImages.innerHTML : '';
        modalImages.style.display = sourceImages ? 'grid' : 'none';
      }

      if (modalTagsWrap) {
        modalTagsWrap.innerHTML = '';
        (data.meta || '').split('|').filter(Boolean).forEach(function (tag) {
          var span = document.createElement('span');
          span.textContent = tag;
          modalTagsWrap.appendChild(span);
        });
      }
      if (modalLink) {
        if (data.link) {
          modalLink.href = data.link;
          modalLink.style.display = 'inline-block';
        } else {
          modalLink.style.display = 'none';
        }
      }

      modalOverlay.classList.add('open');
    }

    function closeModal() { modalOverlay.classList.remove('open'); }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', closeModal);
      if (modalBox) modalBox.addEventListener('click', function (e) { e.stopPropagation(); });
      var closeBtn = modalOverlay.querySelector('.modal-close');
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
      });
    }

    goTo(0);
  }
})();
