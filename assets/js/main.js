const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Menu Toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            navMenu.classList.toggle('active', !isExpanded);
            menuToggle.setAttribute('aria-expanded', String(!isExpanded));
        });
    }

    // Filter current project listings by name, location, and availability.
    const projectSearchForm = document.getElementById('project-search-form');
    if (projectSearchForm) {
        const searchInput = document.getElementById('project-search-query');
        const statusFilter = document.getElementById('project-status-filter');
        const projectCards = Array.from(document.querySelectorAll('.property-listing-card'));
        const resultCount = document.getElementById('project-results-count');
        const emptyState = document.getElementById('project-empty-state');

        const filterProjects = () => {
            const query = searchInput.value.trim().toLocaleLowerCase();
            const status = statusFilter.value;
            let visibleCount = 0;

            projectCards.forEach(card => {
                const matchesQuery = card.dataset.search.includes(query);
                const matchesStatus = status === 'all' || card.dataset.status === status;
                const isVisible = matchesQuery && matchesStatus;

                card.hidden = !isVisible;
                if (isVisible) visibleCount++;
            });

            resultCount.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? 'project' : 'projects'}`;
            emptyState.hidden = visibleCount !== 0;
        };

        projectSearchForm.addEventListener('submit', event => {
            event.preventDefault();
            filterProjects();
            document.getElementById('current-projects').scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start',
            });
        });
        searchInput.addEventListener('input', filterProjects);
        statusFilter.addEventListener('change', filterProjects);
    }

    // Interactive project photo and video gallery.
    const mediaCards = Array.from(document.querySelectorAll('.media-card'));
    const mediaLightbox = document.querySelector('.media-lightbox');
    if (mediaCards.length && mediaLightbox) {
        const lightboxImage = mediaLightbox.querySelector('.media-lightbox-image');
        const lightboxVideo = mediaLightbox.querySelector('.media-lightbox-video');
        const lightboxCaption = mediaLightbox.querySelector('.media-lightbox-caption');
        let currentMediaIndex = 0;

        const visibleMediaCards = () => mediaCards.filter(card => !card.hidden);
        const showMedia = card => {
            const isVideo = card.dataset.mediaType === 'video';
            lightboxImage.hidden = isVideo;
            lightboxVideo.hidden = !isVideo;
            lightboxVideo.pause();
            lightboxVideo.removeAttribute('src');

            if (isVideo) {
                lightboxVideo.src = card.dataset.mediaSrc;
                lightboxVideo.poster = card.dataset.mediaPoster || '';
                lightboxVideo.load();
            } else {
                lightboxImage.src = card.dataset.mediaSrc;
                lightboxImage.alt = card.dataset.mediaCaption || '';
            }

            lightboxCaption.textContent = card.dataset.mediaCaption || '';
        };
        const openMedia = card => {
            currentMediaIndex = visibleMediaCards().indexOf(card);
            showMedia(card);
            mediaLightbox.showModal();
        };
        const stepMedia = direction => {
            const visibleCards = visibleMediaCards();
            if (!visibleCards.length) return;
            currentMediaIndex = (currentMediaIndex + direction + visibleCards.length) % visibleCards.length;
            showMedia(visibleCards[currentMediaIndex]);
        };

        mediaCards.forEach(card => card.addEventListener('click', () => openMedia(card)));
        mediaLightbox.querySelector('.media-lightbox-close').addEventListener('click', () => mediaLightbox.close());
        mediaLightbox.querySelector('.media-lightbox-prev').addEventListener('click', () => stepMedia(-1));
        mediaLightbox.querySelector('.media-lightbox-next').addEventListener('click', () => stepMedia(1));
        mediaLightbox.addEventListener('click', event => {
            if (event.target === mediaLightbox) mediaLightbox.close();
        });
        mediaLightbox.addEventListener('close', () => {
            lightboxVideo.pause();
            lightboxVideo.removeAttribute('src');
            lightboxImage.removeAttribute('src');
        });

        document.querySelectorAll('[data-gallery-filter]').forEach(filter => {
            filter.addEventListener('click', () => {
                const category = filter.dataset.galleryFilter;
                document.querySelectorAll('[data-gallery-filter]').forEach(button => {
                    const isActive = button === filter;
                    button.classList.toggle('active', isActive);
                    button.setAttribute('aria-pressed', String(isActive));
                });
                mediaCards.forEach(card => {
                    card.hidden = category !== 'all' && card.dataset.galleryCategory !== category;
                });
            });
        });

        document.addEventListener('keydown', event => {
            if (!mediaLightbox.open) return;
            if (event.key === 'ArrowLeft') stepMedia(-1);
            if (event.key === 'ArrowRight') stepMedia(1);
            if (event.key === 'Escape') {
                event.preventDefault();
                mediaLightbox.close();
            }
        });
    }

    // 2. Intersection Observer for Scroll Reveals (unless reduced motion)
    
    // 2. High-End Animations & Smooth Scroll
    
    if (!prefersReducedMotion) {
        // Initialize Lenis for buttery smooth scrolling
        if (typeof Lenis !== 'undefined') {
            const lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                gestureDirection: 'vertical',
                smooth: true,
                mouseMultiplier: 1,
                smoothTouch: false,
                touchMultiplier: 2,
                infinite: false,
                anchors: true,
            });

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }

        // Automatic Text Splitter for text-reveal elements
        const textElements = document.querySelectorAll('.auto-text-reveal');
        textElements.forEach(el => {
            const words = el.innerText.split(' ');
            el.innerHTML = '';
            words.forEach(word => {
                const wrapper = document.createElement('span');
                wrapper.className = 'text-reveal-wrapper';
                const inner = document.createElement('span');
                inner.className = 'text-reveal';
                inner.innerText = word + '\u00A0';
                wrapper.appendChild(inner);
                el.appendChild(wrapper);
            });
        });

        const revealElements = document.querySelectorAll('.reveal, .scroll-fade-up, .scroll-scale-in, .img-reveal');
        const textReveals = document.querySelectorAll('.text-reveal');
        
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        });

        // Add stagger to text reveals
        const textObserver = new IntersectionObserver((entries, observer) => {
            let delay = 0;
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('active');
                    }, delay * 50);
                    delay++;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(el => revealObserver.observe(el));
        textReveals.forEach(el => textObserver.observe(el));
    } else {
        document.querySelectorAll('.reveal, .scroll-fade-up, .scroll-scale-in, .img-reveal, .text-reveal').forEach(el => el.classList.add('active'));
    }

    // 3. Animated Stats Counter
    const statNumbers = document.querySelectorAll('.stat-number');
    let hasCounted = false;

    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasCounted && !prefersReducedMotion) {
                hasCounted = true;
                statNumbers.forEach(stat => {
                    const target = +stat.getAttribute('data-target');
                    const duration = 2000; // ms
                    const increment = target / (duration / 16); // 60fps
                    let current = 0;

                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            stat.innerText = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            stat.innerText = target;
                        }
                    };
                    updateCounter();
                });
            } else if (entry.isIntersecting && prefersReducedMotion) {
                statNumbers.forEach(stat => {
                    stat.innerText = stat.getAttribute('data-target');
                });
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats-grid');
    if (statsSection) {
        countObserver.observe(statsSection);
    }

    // 4. Parallax Effect for Backgrounds
    const parallaxSections = document.querySelectorAll('.parallax-section');
    if (!prefersReducedMotion) {
        window.addEventListener('scroll', () => {
            let scrollY = window.scrollY;
            parallaxSections.forEach(section => {
                const speed = 0.4;
                const yPos = -(scrollY * speed);
                // section.style.backgroundPosition = `center ${yPos}px`;
                // More robust parallax using getBoundingClientRect
                const rect = section.getBoundingClientRect();
                if(rect.top < window.innerHeight && rect.bottom > 0) {
                     const offset = rect.top * speed;
                     section.style.backgroundPosition = `center ${offset}px`;
                }
            });
        }, {passive: true});
    }

    // 5. 3D Tilt Effect on Cards
    const tiltCards = document.querySelectorAll('.tilt-card');
    if (!prefersReducedMotion) {
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10; // max 10 deg
                const rotateY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });
    }

    // 6. Global Inquiry Form Toggle
    const globalFormWrapper = document.querySelector('.inquiry-form-wrapper');
    const toggleBtn = document.querySelector('.inquiry-toggle-btn');
    const toggleBtnInline = document.querySelector('.inquiry-toggle-btn-inline');
    const closeBtn = document.querySelector('.inquiry-close-btn');

    const toggleForm = (e) => {
        if(e) e.preventDefault();
        globalFormWrapper.classList.toggle('active');
    };

    if (toggleBtn) toggleBtn.addEventListener('click', toggleForm);
    if (toggleBtnInline) toggleBtnInline.addEventListener('click', toggleForm);
    if (closeBtn) closeBtn.addEventListener('click', toggleForm);

    // 7. Prepare property inquiries for WhatsApp.
    const whatsappInquiryForms = document.querySelectorAll('.whatsapp-inquiry-form');
    const inquiryNumbers = [
        { label: '+91 82793 17522', number: '918279317522' },
        { label: '+91 99715 38800', number: '919971538800' },
    ];

    whatsappInquiryForms.forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault();

            const name = form.elements.namedItem('name').value.trim();
            const phone = form.elements.namedItem('phone').value.trim();
            const message = form.elements.namedItem('message').value.trim();
            const phoneDigits = phone.replace(/\D/g, '');
            const response = form.querySelector('.form-response');

            if (!name || phoneDigits.length < 7 || phoneDigits.length > 15) {
                form.elements.namedItem('phone').setCustomValidity('Enter a valid phone number with 7 to 15 digits.');
                form.elements.namedItem('phone').reportValidity();
                form.elements.namedItem('phone').setCustomValidity('');
                return;
            }

            const inquiry = [
                'Hello, I am interested in The Solitaire Group projects.',
                `Name: ${name}`,
                `My phone: ${phone}`,
                message ? `Inquiry: ${message}` : '',
            ].filter(Boolean).join('\n');

            response.replaceChildren();
            const notice = document.createElement('p');
            notice.textContent = 'Your inquiry is ready. Choose a WhatsApp number, then press Send in WhatsApp:';
            response.appendChild(notice);

            const links = document.createElement('div');
            links.className = 'whatsapp-inquiry-links';
            inquiryNumbers.forEach(contact => {
                const link = document.createElement('a');
                link.href = `https://wa.me/${contact.number}?text=${encodeURIComponent(inquiry)}`;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = `Send to ${contact.label}`;
                links.appendChild(link);
            });
            response.appendChild(links);
        });
    });

    // 8. AJAX Form Submission
    const handleFormSubmit = (formId) => {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const responseDiv = form.querySelector('.form-response');
            
            btn.disabled = true;
            btn.innerText = 'Sending...';
            
            const formData = new FormData(form);
            formData.append('action', 'solitaire_inquiry'); // WP action hook

            fetch(solitaire_ajax.ajax_url, {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                btn.disabled = false;
                btn.innerText = 'Submit';
                
                if (data.success) {
                    responseDiv.className = 'form-response success';
                    responseDiv.innerText = 'Thank you! We will get back to you shortly.';
                    form.reset();
                    // Close form after a few seconds if it's the global one
                    if(formId === 'global-inquiry-form') {
                        setTimeout(() => {
                            globalFormWrapper.classList.remove('active');
                            responseDiv.innerText = '';
                        }, 3000);
                    }
                } else {
                    responseDiv.className = 'form-response error';
                    responseDiv.innerText = data.data || 'An error occurred.';
                }
            })
            .catch(err => {
                btn.disabled = false;
                btn.innerText = 'Submit';
                responseDiv.className = 'form-response error';
                responseDiv.innerText = 'An error occurred while sending.';
            });
        });
    };

    handleFormSubmit('page-contact-form');

    // 9. Gallery Lightbox Logic
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.querySelector('.solitaire-lightbox');
    
    if (galleryItems.length > 0 && lightbox) {
        const lightboxImg = lightbox.querySelector('.lightbox-img');
        const closeLB = lightbox.querySelector('.lightbox-close');
        const overlayLB = lightbox.querySelector('.lightbox-overlay');
        const prevLB = lightbox.querySelector('.lightbox-prev');
        const nextLB = lightbox.querySelector('.lightbox-next');
        
        let currentIndex = 0;
        const images = Array.from(galleryItems).map(item => item.getAttribute('data-full'));

        const openLightbox = (index) => {
            currentIndex = index;
            lightboxImg.src = images[currentIndex];
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // prevent scroll
        };

        const closeLightbox = () => {
            lightbox.style.display = 'none';
            document.body.style.overflow = '';
        };

        const showPrev = () => {
            currentIndex = (currentIndex === 0) ? images.length - 1 : currentIndex - 1;
            lightboxImg.src = images[currentIndex];
        };

        const showNext = () => {
            currentIndex = (currentIndex === images.length - 1) ? 0 : currentIndex + 1;
            lightboxImg.src = images[currentIndex];
        };

        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => openLightbox(index));
        });

        closeLB.addEventListener('click', closeLightbox);
        overlayLB.addEventListener('click', closeLightbox);
        prevLB.addEventListener('click', showPrev);
        nextLB.addEventListener('click', showNext);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (lightbox.style.display === 'flex') {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') showPrev();
                if (e.key === 'ArrowRight') showNext();
            }
        });
    }

});
