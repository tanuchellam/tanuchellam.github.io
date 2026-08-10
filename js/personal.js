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
    // If the menu was left open and the viewport is then resized past the
    // mobile breakpoint (e.g. rotating a tablet), .nav-links reverts to the
    // desktop row via CSS regardless of the class — but drop the stale
    // class too, so narrowing back below the breakpoint afterwards starts
    // from closed rather than snapping back open.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) navLinks.classList.remove('open');
    });
  }

  // Career: a sticky year-index down the left, scroll-synced to whichever
  // entry has crossed 45% down the viewport — that entry (and its matching
  // year) lights up, everything else recedes. Clicking a year jumps to its
  // entry via the anchor link (scroll-margin-top on .career-entry keeps it
  // clear of the sticky site nav).
  (function () {
    var entries = Array.prototype.slice.call(document.querySelectorAll('.career-entry'));
    var yearLinks = Array.prototype.slice.call(document.querySelectorAll('.year-link'));
    if (!entries.length || !yearLinks.length) return;

    var ticking = false;

    function visibleEntries() {
      return entries.filter(function (entry) { return entry.offsetParent !== null; });
    }

    function updateActive() {
      ticking = false;
      var visible = visibleEntries();
      if (!visible.length) return;

      var triggerY = window.innerHeight * 0.45;
      var active = visible[0];
      visible.forEach(function (entry) {
        if (entry.getBoundingClientRect().top <= triggerY) active = entry;
      });

      entries.forEach(function (entry) {
        entry.classList.toggle('active-entry', entry === active);
      });
      var activeRole = active.dataset.role;
      yearLinks.forEach(function (link) {
        link.classList.toggle('active', link.dataset.role === activeRole);
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateActive);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateActive);
    setTimeout(updateActive, 50);
    updateActive();

    // Earlier roles toggle — expands both the nav's extra years and the
    // matching entries together, then re-measures so the newly (un)hidden
    // entries are correctly included/excluded from the active-year sync.
    var earlierToggle = document.querySelector('.career-earlier-toggle');
    var navEarlier = document.querySelector('.career-nav-earlier');
    var entriesEarlier = document.querySelector('.career-entries-earlier');
    if (earlierToggle && navEarlier && entriesEarlier) {
      earlierToggle.addEventListener('click', function () {
        var open = entriesEarlier.classList.toggle('open');
        navEarlier.classList.toggle('open', open);
        earlierToggle.textContent = open ? 'Hide earlier roles' : 'Earlier roles';
        setTimeout(updateActive, 350);
      });
    }
  })();

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
