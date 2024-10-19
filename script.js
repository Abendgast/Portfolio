document.addEventListener('DOMContentLoaded', () => {
    // Мобильное меню
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');

        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });

        burger.classList.toggle('toggle');
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    const faders = document.querySelectorAll('.fade-in');
    const sliders = document.querySelectorAll('.slide-in');

    const appearOptions = {
        threshold: 0,
        rootMargin: "0px 0px -100px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(
        entries,
        appearOnScroll
    ) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('appear');
                appearOnScroll.unobserve(entry.target);
            }
        });
    },
    appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    sliders.forEach(slider => {
        appearOnScroll.observe(slider);
    });



    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
        contactForm.reset();
    });

    const typedText = document.querySelector('.hero h1');
    const text = typedText.textContent;
    typedText.textContent = '';
    let i = 0;

    function typeWriter() {
        if (i < text.length) {
            typedText.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }

    typeWriter();
});

//-------------------------------------------------------------------------*ANIM2
document.addEventListener('DOMContentLoaded', () => {
  const bg = document.querySelector('.shimmer-matter-bg');
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 15}s`;
    bg.appendChild(particle);
  }
});
//-------------------------------------------------------------------------*ANIM2

//-------------------------------------------------------------------------*ANIM3
//document.addEventListener('DOMContentLoaded', () => {
//  const container = document.querySelector('.bg-container');
//  const blobCount = 20; // Adjust this number to add more or fewer blobs
//
//  function createBlob() {
//    const blob = document.createElement('div');
//    blob.classList.add('amorphous-blob');
//
//    const size = Math.random() * 100 + 50; // Random size between 50px and 150px
//    blob.style.width = `${size}px`;
//    blob.style.height = `${size}px`;
//
//    blob.style.left = `${Math.random() * 100}%`;
//    blob.style.top = `${Math.random() * 100}%`;
//
//    blob.style.animationDuration = `${Math.random() * 10 + 15}s`; // Random duration between 15s and 25s
//    blob.style.animationDelay = `-${Math.random() * 10}s`; // Random delay up to -10s
//
//    container.appendChild(blob);
//  }
//
//  for (let i = 0; i < blobCount; i++) {
//    createBlob();
//  }
//});
//-------------------------------------------------------------------------*ANIM3
