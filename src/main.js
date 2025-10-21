import { getPricingPlans, createBooking } from './booking.js';
import { isStripeConfigured } from './stripe.js';

const loader = document.getElementById('loader');
const content = document.getElementById('content');
const lines = document.querySelector('#terminal-content');

function initMacOSLoader() {
  let index = 0;
  const text = lines.textContent;
  lines.textContent = '';

  const interval = setInterval(() => {
    if (index < text.length) {
      lines.textContent += text[index++];
    } else {
      clearInterval(interval);
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
          loader.style.display = 'none';
          content.style.display = 'block';
          initAnimations();
          startTyping();
        }, 500);
      }, 800);
    }
  }, 30);
}

const words = ['<Hello World/>', 'console.log("Hello JS");', 'print("Hello Python")', 'fmt.Println("Hello Go")', 'System.out.println("Java")'];
const typingEl = document.getElementById('typing');
let wordIndex = 0, charIndex = 0, deleting = false;

function startTyping() {
  const current = words[wordIndex];
  typingEl.textContent = current.substring(0, charIndex);
  if (!deleting && charIndex < current.length) {
    charIndex++;
    setTimeout(startTyping, 80);
  } else if (deleting && charIndex > 0) {
    charIndex--;
    setTimeout(startTyping, 40);
  } else if (!deleting && charIndex === current.length) {
    deleting = true;
    setTimeout(startTyping, 2000);
  } else if (deleting && charIndex === 0) {
    deleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    setTimeout(startTyping, 300);
  }
}

let lastScroll = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > 100) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  lastScroll = currentScroll;
});

function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.portfolio-card, .featured-project, .pricing-card, .schedule-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
    observer.observe(card);
  });

  document.querySelectorAll('.language-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px) scale(0.95)';
    card.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.08}s`;
    observer.observe(card);
  });

  document.querySelectorAll('.hero, .portfolio-header, .contact, .languages-header, .pricing-header, .schedule-header').forEach((section) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(section);
  });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && href !== '') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  });
});

window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= (sectionTop - 100)) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero');
  const scrolled = window.pageYOffset;
  if (hero && scrolled < window.innerHeight) {
    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
  }
});

const cursorGlow = document.querySelector('.cursor-glow');
let mouseX = 0;
let mouseY = 0;
let glowX = 0;
let glowY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  const dx = mouseX - glowX;
  const dy = mouseY - glowY;

  glowX += dx * 0.1;
  glowY += dy * 0.1;

  cursorGlow.style.left = glowX + 'px';
  cursorGlow.style.top = glowY + 'px';

  requestAnimationFrame(animateCursor);
}

animateCursor();

document.querySelectorAll('.contact-btn, .portfolio-card-footer a, .social-btn, .pricing-btn, .schedule-btn').forEach(btn => {
  btn.addEventListener('mouseenter', function() {
    this.style.transition = 'transform 0.2s ease';
  });

  btn.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
  });

  btn.addEventListener('mouseleave', function() {
    this.style.transform = 'translate(0, 0)';
  });
});

async function loadPricingPlans() {
  try {
    const plans = await getPricingPlans();
    const pricingGrid = document.querySelector('.pricing-grid');
    const planSelect = document.getElementById('booking-plan');

    if (pricingGrid && plans) {
      pricingGrid.innerHTML = plans.map(plan => {
        const features = Array.isArray(plan.features) ? plan.features : [];
        const popularBadge = plan.is_popular ? '<div class="popular-badge">Most Popular</div>' : '';

        return `
          <div class="pricing-card ${plan.is_popular ? 'popular' : ''}">
            ${popularBadge}
            <h3>${plan.name}</h3>
            <div class="price">$${plan.price}<span>/project</span></div>
            <p class="pricing-description">${plan.description}</p>
            <ul class="pricing-features">
              ${features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            <button class="pricing-btn" data-plan-id="${plan.id}" data-plan-name="${plan.name}" data-plan-price="${plan.price}">
              Choose Plan
            </button>
          </div>
        `;
      }).join('');

      document.querySelectorAll('.pricing-btn').forEach(btn => {
        btn.addEventListener('click', handlePricingClick);
      });
    }

    if (planSelect && plans) {
      plans.forEach(plan => {
        const option = document.createElement('option');
        option.value = plan.id;
        option.textContent = `${plan.name} - $${plan.price}`;
        planSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading pricing plans:', error);
  }
}

function handlePricingClick(e) {
  const planId = e.target.dataset.planId;
  const planName = e.target.dataset.planName;
  const planPrice = e.target.dataset.planPrice;

  const scheduleSection = document.getElementById('schedule');
  if (scheduleSection) {
    scheduleSection.scrollIntoView({ behavior: 'smooth' });

    const planSelect = document.getElementById('booking-plan');
    if (planSelect) {
      planSelect.value = planId;
    }
  }
}

const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Booking...';
    submitBtn.disabled = true;

    try {
      const formData = {
        customer_name: document.getElementById('booking-name').value,
        customer_email: document.getElementById('booking-email').value,
        customer_phone: document.getElementById('booking-phone').value,
        plan_id: document.getElementById('booking-plan').value || null,
        booking_date: document.getElementById('booking-date').value,
        booking_time: document.getElementById('booking-time').value,
        message: document.getElementById('booking-message').value
      };

      await createBooking(formData);

      alert('Booking submitted successfully! We will contact you soon.');
      bookingForm.reset();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error submitting booking. Please try again or contact us directly.');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

initMacOSLoader();
loadPricingPlans();
