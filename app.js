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

    // Flight stages with room info callouts
    const roomStages = [
      {
        minFrame: 0,
        maxFrame: 15,
        tag: 'ARCHITECTURE & FACADE',
        title: 'Grand Entrance & Villa Facade',
        desc: 'Double-height glass entryway featuring handcrafted teak fins, cantilevered portico, and ambient architectural lighting.'
      },
      {
        minFrame: 16,
        maxFrame: 35,
        tag: 'LIVING SPACES',
        title: 'Great Room & Double-Height Living',
        desc: '24-foot soaring ceilings, floor-to-ceiling panoramic glass walls, and polished Italian Statuario marble flooring.'
      },
      {
        minFrame: 36,
        maxFrame: 55,
        tag: 'CULINARY SANCTUARY',
        title: 'Bespoke Italian Kitchen & Dining',
        desc: 'Bookmatched waterfall quartzite island, custom teak modular cabinetry, and integrated German luxury appliances.'
      },
      {
        minFrame: 56,
        maxFrame: 75,
        tag: 'PRIVATE SUITES',
        title: 'Primary Master Bedroom & Suite',
        desc: 'Acoustic teak wall paneling, automated blackout drapery, private sun terrace, and integrated climate control.'
      },
      {
        minFrame: 76,
        maxFrame: 90,
        tag: 'WELLNESS & SPA',
        title: 'Master Bathroom & Spa Sanctuary',
        desc: 'Freestanding soaking bathtub, frameless dual rainfall shower, custom soapstone vanity, and radiant heated marble.'
      },
      {
        minFrame: 91,
        maxFrame: 100,
        tag: 'OUTDOOR & RESORT',
        title: 'Infinity Pool Terrace & Fire Pit',
        desc: 'Hardscape poolside deck, sunken fire pit lounge, glass balustrades, and panoramic waterfront sunset view.'
      }
    ];

    const roomHud = document.getElementById('roomFlightHud');
    const hudTag = document.getElementById('hudTag');
    const hudTitle = document.getElementById('hudTitle');
    const hudDesc = document.getElementById('hudDesc');

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

      // Dynamic Room Flight HUD callout logic
      if (roomHud && progress > 0.06 && progress < 0.98) {
        const currentStage = roomStages.find(stage => targetFrame >= stage.minFrame && targetFrame <= stage.maxFrame);
        if (currentStage) {
          if (hudTitle && hudTitle.textContent !== currentStage.title) {
            if (hudTag) hudTag.textContent = currentStage.tag;
            hudTitle.textContent = currentStage.title;
            if (hudDesc) hudDesc.textContent = currentStage.desc;
          }
          roomHud.classList.add('visible');
        }
      } else if (roomHud) {
        roomHud.classList.remove('visible');
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

  /* LIGHTBOX GALLERY WITH DETAILED ROOM CALLOUT CARDS */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const galleryItems = document.querySelectorAll('.gallery-item, .amenity-feature-card');

  const roomDataMap = {
    'primary_suite.jpg': {
      tag: 'MASTER BEDROOM & SUITE',
      title: 'Primary Suite Bedroom',
      desc: 'Featuring acoustic teak wood wall paneling, floor-to-ceiling panoramic windows, motorized blackout drapery, walk-in dressing room, and private garden balcony access.'
    },
    'soaking_bath.jpg': {
      tag: 'BATHROOM & SPA SANCTUARY',
      title: 'Master Bathroom & Soaking Tub',
      desc: 'Designed with a freestanding solid-surface soaking tub, frameless dual rainfall shower, honed Nero Marquina marble walls, custom soapstone vanity, and radiant heated marble floors.'
    },
    'kitchen.jpg': {
      tag: 'KITCHEN & CULINARY',
      title: 'Bespoke Italian Kitchen',
      desc: 'Custom modular teak cabinetry with soft-close Blum hardware, bookmatched waterfall quartzite island, built-in Miele appliances, and ambient under-cabinet LED illumination.'
    },
    'great_room.jpg': {
      tag: 'GREAT ROOM & LIVING LOUNGE',
      title: 'Double-Height Great Room',
      desc: 'Soaring 24ft architectural ceiling with floor-to-ceiling double glazing, polished Italian Statuario marble floors, and custom acoustic ceiling treatment.'
    },
    'reading_nook.jpg': {
      tag: 'LIBRARY & STUDY',
      title: 'Private Reading Nook & Alcove',
      desc: 'Bespoke teak shelving built-ins, comfortable leather lounge seating, indirect warm accent lighting, and serene courtyard garden views.'
    },
    'hot_tub_sauna.jpg': {
      tag: 'WELLNESS & HYDROTHERAPY',
      title: 'Outdoor Hot Tub & Sauna',
      desc: 'Private thermal hydrotherapy hot tub surrounded by cedar wood decking, accompanied by a custom glass-front Finnish sauna.'
    },
    'fire_pit.jpg': {
      tag: 'OUTDOOR LOUNGE',
      title: 'Sunken Fire Pit & Pool Deck',
      desc: 'Custom circular sunken outdoor lounge with integrated smokeless gas fire pit, travertine coping, and integrated seat wall lighting.'
    },
    'exterior_day.jpg': {
      tag: 'VILLA EXTERIOR & ARCHITECTURE',
      title: 'Contemporary Luxury Villa Facade',
      desc: 'Bespoke villa elevation featuring cantilevered overhangs, natural teak timber louvers, high-efficiency low-E glass, and manicured tropical landscaping.'
    },
    'hero_exterior.jpg': {
      tag: 'TURNKEY ARCHITECTURE',
      title: 'Grand Villa Estate Facade',
      desc: 'Architectural masterpiece showcasing double-height entrance portico, natural stone cladding, and custom perimeter water features.'
    },
    'dock_canoe.jpg': {
      tag: 'WATERFRONT RESORT',
      title: 'Lakefront Deck & Jetty',
      desc: 'Private teak timber dock with glass safety railing, lounge seating, and direct access to serene lakefront waters.'
    }
  };

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;

        // Find matching room details by image filename
        const srcParts = img.src.split('/');
        const filename = srcParts[srcParts.length - 1];
        const roomData = roomDataMap[filename] || {
          tag: 'LUXURY RESIDENCE',
          title: img.alt || 'Architectural Feature',
          desc: 'Crafted with premium materials, structural excellence, and timeless luxury architecture by Luxury Homes of India.'
        };

        const lightboxTag = document.getElementById('lightboxTag');
        const lightboxTitle = document.getElementById('lightboxTitle');
        const lightboxDesc = document.getElementById('lightboxDesc');

        if (lightboxTag) lightboxTag.textContent = roomData.tag;
        if (lightboxTitle) lightboxTitle.textContent = roomData.title;
        if (lightboxDesc) lightboxDesc.textContent = roomData.desc;

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
