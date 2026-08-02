document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------------------------------
     1. NAVBAR SOLIDIFY ON SCROLL
  ------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  /* -------------------------------------------------------------
     2. STRICT SCROLL-DRIVEN FRAME ENGINE (NO AUTO-PLAY, NO TIMERS)
        Frames ONLY advance when the user physically scrolls.
  ------------------------------------------------------------- */
  const canvas = document.getElementById('heroScrubCanvas');
  const heroScrollTrack = document.getElementById('heroScrollTrack');
  const scrubProgressFill = document.getElementById('scrubProgressFill');
  const scrubHint = document.getElementById('scrubHint');
  const heroContent = document.getElementById('heroContent');

  if (canvas && heroScrollTrack) {
    const ctx = canvas.getContext('2d');
    const totalFrames = 100;
    const images = [];
    let loadedCount = 0;
    let currentFrameIndex = 0;

    // Handle canvas resizing for full cover
    function resizeCanvas() {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      drawFrame(currentFrameIndex);
    }

    function drawFrame(idx) {
      if (!images[idx] || !images[idx].complete) return;
      const img = images[idx];
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    }

    // Preload all 100 frames
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `assets/frames/frame_${frameNum}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1) {
          resizeCanvas();
          updateScrollScrub();
        }
      };
      images.push(img);
    }

    window.addEventListener('resize', resizeCanvas);

    // Pure scroll handler: frame index is strictly locked to scroll progress
    function updateScrollScrub() {
      const rect = heroScrollTrack.getBoundingClientRect();
      const maxScroll = heroScrollTrack.offsetHeight - window.innerHeight;
      const currentScroll = Math.max(0, Math.min(maxScroll, -rect.top));
      const progress = Math.max(0, Math.min(1, currentScroll / maxScroll));

      // Calculate exact frame index from scroll position
      const targetFrame = Math.min(totalFrames - 1, Math.floor(progress * totalFrames));

      if (currentFrameIndex !== targetFrame) {
        currentFrameIndex = targetFrame;
        drawFrame(currentFrameIndex);
      }

      // Update scrub hint progress bar
      if (scrubProgressFill) {
        scrubProgressFill.style.width = `${(progress * 100).toFixed(1)}%`;
      }

      // Fade out hero UI cards & text immediately as user starts scrubbing
      if (heroContent) {
        const fadeOpacity = Math.max(0, 1 - progress * 6);
        heroContent.style.opacity = fadeOpacity;
        heroContent.style.transform = `translateY(${progress * -30}px)`;
        heroContent.style.pointerEvents = fadeOpacity < 0.1 ? 'none' : 'auto';
      }

      if (scrubHint) {
        scrubHint.style.opacity = Math.max(0, 1 - progress * 6);
      }
    }

    // Bind strictly to user scroll event
    window.addEventListener('scroll', updateScrollScrub, { passive: true });
    updateScrollScrub();
  }

  /* -------------------------------------------------------------
     3. INTERACTIVE PORTFOLIO TABS (Completed / Ongoing / Upcoming)
  ------------------------------------------------------------- */
  const portfolioTabs = document.querySelectorAll('.portfolio-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  portfolioTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = `tab-${tab.getAttribute('data-tab')}`;

      portfolioTabs.forEach(t => {
        t.classList.remove('active');
        t.style.background = 'rgba(22, 41, 45, 0.08)';
        t.style.color = 'var(--text-dark)';
      });

      tab.classList.add('active');
      tab.style.background = 'var(--bg-dark)';
      tab.style.color = 'var(--text-light)';

      tabContents.forEach(content => {
        if (content.id === targetId) {
          content.style.display = 'block';
        } else {
          content.style.display = 'none';
        }
      });
    });
  });

  /* -------------------------------------------------------------
     4. PROJECT COST CALCULATOR LOGIC
  ------------------------------------------------------------- */
  const calcArea = document.getElementById('calcArea');
  const calcPackage = document.getElementById('calcPackage');
  const breakdownAreaText = document.getElementById('breakdownAreaText');
  const breakdownCivil = document.getElementById('breakdownCivil');
  const breakdownTotal = document.getElementById('breakdownTotal');
  const calcBookBtn = document.getElementById('calcBookBtn');
  const heroConsultBtn = document.getElementById('heroConsultBtn');

  function calculateEstimate() {
    if (!calcArea || !calcPackage) return;
    const area = parseFloat(calcArea.value) || 4000;
    const rate = parseFloat(calcPackage.value) || 3400;
    const total = area * rate;

    const formattedArea = area.toLocaleString('en-IN');
    const formattedRate = rate.toLocaleString('en-IN');
    const formattedTotal = total.toLocaleString('en-IN');

    if (breakdownAreaText) breakdownAreaText.textContent = `${formattedArea} sq ft × ₹${formattedRate}`;
    if (breakdownCivil) breakdownCivil.textContent = `₹${formattedTotal}`;
    if (breakdownTotal) breakdownTotal.textContent = `₹${formattedTotal}`;
  }

  if (calcArea) calcArea.addEventListener('input', calculateEstimate);
  if (calcPackage) calcPackage.addEventListener('change', calculateEstimate);
  calculateEstimate();

  /* -------------------------------------------------------------
     5. MODAL & SCROLL ACTION HANDLERS
  ------------------------------------------------------------- */
  const bookingModal = document.getElementById('bookingModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  if (heroConsultBtn) {
    heroConsultBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const estimateSec = document.getElementById('estimate');
      if (estimateSec) estimateSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (calcBookBtn) {
    calcBookBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (bookingModal) bookingModal.classList.add('active');
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      if (bookingModal) bookingModal.classList.remove('active');
    });
  }

  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        bookingModal.classList.remove('active');
      }
    });
  }

  /* LIGHTBOX GALLERY */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const galleryItems = document.querySelectorAll('.gallery-item, .amenity-feature-card');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightbox.classList.add('active');
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      if (lightbox) lightbox.classList.remove('active');
    });
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
      }
    });
  }
});
