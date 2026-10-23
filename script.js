/**
 * HIMA MANIKANTA VASAMSETTI (MANU) — PORTFOLIO SCRIPT
 * Synchronizes background canvas animation with page scrolling & handles interactive UI
 */

(() => {
  'use strict';

  // --- Constants & Config ---
  const TOTAL_FRAMES = 226;
  const FRAME_DIR = 'Man-adjusting-suit-posture-1080p';
  const LERP_FACTOR = 0.06; // Buttery smooth lerp

  // --- DOM Elements ---
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const navbar = document.getElementById('navbar');
  const navMenu = document.getElementById('nav-menu');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navItems = document.querySelectorAll('.nav-item');
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const formSubmitBtn = document.getElementById('form-submit-btn');

  const images = new Array(TOTAL_FRAMES);
  let targetProgress = 0;
  let currentProgress = 0;
  let lastRenderedFrame = -1;

  // Frame URL constructor: 0 -> "Man-adjusting-suit-posture-1080p/0001.jpg"
  function getFramePath(index) {
    const frameNumber = String(index + 1).padStart(4, '0');
    return `${FRAME_DIR}/${frameNumber}.jpg`;
  }

  // Draw image with responsive cover centering
  function renderImage(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;

    // Dark clear using Midnight Velvet #0D0E10
    ctx.fillStyle = '#0D0E10';
    ctx.fillRect(0, 0, cw, ch);

    const hRatio = cw / img.naturalWidth;
    const vRatio = ch / img.naturalHeight;
    const ratio = Math.max(hRatio, vRatio);

    const drawW = img.naturalWidth * ratio;
    const drawH = img.naturalHeight * ratio;
    const offsetX = (cw - drawW) / 2;
    const offsetY = (ch - drawH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, offsetX, offsetY, drawW, drawH);
  }

  // Render frame with fallback
  function renderFrame(index) {
    let img = images[index];

    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = images[index - offset];
        if (prev && prev.complete && prev.naturalWidth !== 0) {
          img = prev;
          break;
        }
        const next = images[index + offset];
        if (next && next.complete && next.naturalWidth !== 0) {
          img = next;
          break;
        }
      }
    }

    if (img && img.complete && img.naturalWidth !== 0) {
      renderImage(img);
    }
  }

  // Retina Canvas Resize
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);

    const curFrame = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1)))
    );
    renderFrame(curFrame);
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  // Load first frame immediately
  const firstImg = new Image();
  firstImg.src = getFramePath(0);
  firstImg.onload = () => {
    images[0] = firstImg;
    renderFrame(0);

    // Preload remaining frames concurrently
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        images[i] = img;
        const curIdx = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1)))
        );
        if (curIdx === i) {
          renderFrame(i);
        }
      };
    }
  };

  // Scroll tracking across the whole document height
  function getMaxScroll() {
    return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  function updateScroll() {
    const maxScroll = getMaxScroll();
    targetProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));

    // Navbar blur styling on scroll
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active Section Tracking
    highlightActiveNav();
  }

  window.addEventListener('scroll', updateScroll, { passive: true });

  // Smooth Active Nav Link Highlighting
  const sections = document.querySelectorAll('section[id]');
  function highlightActiveNav() {
    const scrollPos = window.scrollY + 200;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Mobile Menu Toggle
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });

    navItems.forEach((item) => {
      item.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
      });
    });
  }

  // Contact Form Submission via Web3Forms API
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const subject = document.getElementById('form-subject').value.trim();
      const message = document.getElementById('form-message').value.trim();

      if (!name || !email || !subject || !message) {
        formStatus.textContent = 'Please fill out all required fields.';
        formStatus.className = 'form-status error';
        formStatus.style.display = 'block';
        return;
      }

      formSubmitBtn.disabled = true;
      formSubmitBtn.innerHTML = '<span>Sending Message...</span>';
      formStatus.style.display = 'none';

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: '403a0e36-95d3-4f85-a804-906ec21147fb',
            name: name,
            email: email,
            subject: `[Portfolio Inquiry] ${subject}`,
            message: message,
            from_name: `${name} (Portfolio Contact Form)`
          })
        });

        const result = await response.json();

        if (response.ok && (result.success || result.status === 200)) {
          formStatus.textContent = `Thank you, ${name}! Your message has been sent directly to my email inbox. I will reply to ${email} as soon as possible.`;
          formStatus.className = 'form-status success';
          formStatus.style.display = 'block';
          contactForm.reset();
        } else {
          formStatus.textContent = result.message || 'Something went wrong while sending your message. Please reach out directly to himamanikanta.v@gmail.com.';
          formStatus.className = 'form-status error';
          formStatus.style.display = 'block';
        }
      } catch (err) {
        formStatus.textContent = 'Network error while sending message. Please reach out directly to himamanikanta.v@gmail.com.';
        formStatus.className = 'form-status error';
        formStatus.style.display = 'block';
      } finally {
        formSubmitBtn.disabled = false;
        formSubmitBtn.innerHTML = `<span>Send Message</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
      }
    });
  }

  // Smooth Lerp Render Loop
  function loop() {
    const delta = targetProgress - currentProgress;
    if (Math.abs(delta) > 0.00005) {
      currentProgress += delta * LERP_FACTOR;
    } else {
      currentProgress = targetProgress;
    }

    const frameToDraw = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1)))
    );

    if (frameToDraw !== lastRenderedFrame) {
      renderFrame(frameToDraw);
      lastRenderedFrame = frameToDraw;
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
