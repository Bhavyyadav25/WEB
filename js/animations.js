/**
 * GSAP Animations
 * Scroll-triggered animations and interactive effects
 */

class Animations {
    constructor() {
        this.init();
    }

    init() {
        // Register GSAP plugins
        gsap.registerPlugin(ScrollTrigger, TextPlugin);

        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Immediately ensure skill tags are visible (prevent GSAP race conditions)
        document.querySelectorAll('.skill-tag').forEach(tag => {
            tag.style.opacity = '1';
            tag.style.transform = 'scale(1)';
        });

        this.initLoader();
        this.initCursor();
        this.initNavbar();
        this.initHeroAnimations();
        this.initScrollAnimations();
        this.initSkillsAnimation();
        this.initTimelineAnimation();
        this.initProjectsAnimation();
        this.initCounterAnimation();
        this.initTypingEffect();
        this.initParallax();
        this.initMagneticButtons();
        this.ensureVisibility();

        // New features
        this.initScrollProgress();
        this.initSoundEffects();
        this.initPageTransitions();
        this.initInteractiveSkills();
        this.initProjectModal();
        this.initConfetti();
        this.initLiveVisitors();
    }

    // Ensure all content is visible after animations complete
    ensureVisibility() {
        // Fallback to make all content visible after 2 seconds
        setTimeout(() => {
            const elements = document.querySelectorAll(
                '.section-header, .about-image, .about-text, .skill-category, ' +
                '.stat-card, .service-card, .project-card, .timeline-item, ' +
                '.blog-card, .contact-info, .contact-form-container, .skill-tag, ' +
                '.hero-badge, .title-line, .title-name, .hero-roles, .hero-description, ' +
                '.hero-cta .btn, .hero-stats .stat, .code-window, .scroll-indicator, .live-visitors'
            );
            elements.forEach(el => {
                el.style.opacity = '1';
                el.style.visibility = 'visible';
                el.style.transform = 'none';
            });
        }, 2500);
    }

    // Loading Screen Animation
    initLoader() {
        const loader = document.getElementById('loader');
        const progress = document.querySelector('.loader-progress');
        const percent = document.querySelector('.loader-percent');

        let currentProgress = 0;
        const targetProgress = 100;

        const updateProgress = () => {
            if (currentProgress < targetProgress) {
                currentProgress += Math.random() * 15;
                if (currentProgress > targetProgress) currentProgress = targetProgress;

                progress.style.width = `${currentProgress}%`;
                percent.textContent = `${Math.floor(currentProgress)}%`;

                if (currentProgress < targetProgress) {
                    setTimeout(updateProgress, 100);
                } else {
                    // Hide loader
                    gsap.to(loader, {
                        opacity: 0,
                        duration: 0.5,
                        delay: 0.3,
                        onComplete: () => {
                            loader.classList.add('hidden');
                            document.body.classList.remove('loading');
                            this.playHeroEntrance();
                        }
                    });
                }
            }
        };

        document.body.classList.add('loading');
        updateProgress();
    }

    // Custom Cursor - Glowing gradient blob
    initCursor() {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');

        if (!cursor || !follower) return;

        let isHovering = false;

        // Follow cursor exactly (no lag)
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;

            // Center the elements on cursor (adjust offset based on size)
            const cursorOffset = isHovering ? 12.5 : 10;
            const followerOffset = isHovering ? 80 : 60;

            cursor.style.transform = `translate(${x - cursorOffset}px, ${y - cursorOffset}px)`;
            follower.style.transform = `translate(${x - followerOffset}px, ${y - followerOffset}px)`;
        });

        // Hover effects for interactive elements
        const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-tag, .blog-card, .timeline-content, .service-card, .stat-card');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                isHovering = true;
                cursor.classList.add('hover');
                follower.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                isHovering = false;
                cursor.classList.remove('hover');
                follower.classList.remove('hover');
            });
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            follower.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '0.9';
            follower.style.opacity = '1';
        });
    }

    // Navbar Animation
    initNavbar() {
        const navbar = document.getElementById('navbar');
        const navToggle = document.querySelector('.nav-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileLinks = document.querySelectorAll('.mobile-link');
        const navLinks = document.querySelectorAll('.nav-link');

        // Scroll effect
        ScrollTrigger.create({
            start: 'top -100',
            onUpdate: (self) => {
                if (self.direction === 1) {
                    navbar.classList.add('scrolled');
                } else if (window.scrollY < 100) {
                    navbar.classList.remove('scrolled');
                }
            }
        });

        // Mobile menu toggle
        navToggle?.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');

            if (mobileMenu.classList.contains('active')) {
                gsap.from(mobileLinks, {
                    y: 30,
                    opacity: 0,
                    duration: 0.4,
                    stagger: 0.1,
                    ease: 'power2.out'
                });
            }
        });

        // Close mobile menu on link click
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });

        // Active link on scroll
        const sections = document.querySelectorAll('section[id]');
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === current) {
                    link.classList.add('active');
                }
            });
        });
    }

    // Hero Section Entrance
    playHeroEntrance() {
        // Ensure hero elements are visible first
        const heroElements = document.querySelectorAll('.hero-badge, .title-line, .title-name, .hero-roles, .hero-description, .hero-cta .btn, .hero-stats .stat, .code-window, .scroll-indicator, .live-visitors');
        heroElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });

        const tl = gsap.timeline();

        tl.from('.hero-badge', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            immediateRender: false
        })
        .from('.title-line', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            immediateRender: false
        }, '-=0.3')
        .from('.title-name', {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            immediateRender: false
        }, '-=0.4')
        .from('.hero-roles', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            immediateRender: false
        }, '-=0.5')
        .from('.hero-description', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            immediateRender: false
        }, '-=0.4')
        .from('.hero-cta .btn', {
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            immediateRender: false
        }, '-=0.3')
        .from('.live-visitors', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out',
            immediateRender: false
        }, '-=0.2')
        .from('.hero-stats .stat', {
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            immediateRender: false
        }, '-=0.3')
        .from('.code-window', {
            x: 50,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            immediateRender: false
        }, '-=0.8')
        .from('.scroll-indicator', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out',
            immediateRender: false
        }, '-=0.3');
    }

    // Hero specific animations
    initHeroAnimations() {
        // Code window typing effect
        const codeLines = document.querySelectorAll('.window-code code');
        if (codeLines.length) {
            gsap.from(codeLines, {
                scrollTrigger: {
                    trigger: '.code-window',
                    start: 'top 80%'
                },
                opacity: 0,
                y: 10,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out'
            });
        }
    }

    // Scroll-triggered Animations
    initScrollAnimations() {
        // Default ScrollTrigger settings to prevent hidden content
        const defaultScrollTrigger = {
            toggleActions: 'play none none none'
        };

        // Section headers
        gsap.utils.toArray('.section-header').forEach(header => {
            gsap.from(header, {
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%',
                    ...defaultScrollTrigger
                },
                y: 30,
                duration: 0.6,
                ease: 'power3.out',
                immediateRender: false
            });

            const line = header.querySelector('.section-line');
            if (line) {
                gsap.from(line, {
                    scrollTrigger: {
                        trigger: header,
                        start: 'top 85%',
                        ...defaultScrollTrigger
                    },
                    scaleX: 0,
                    transformOrigin: 'left',
                    duration: 0.8,
                    delay: 0.2,
                    ease: 'power3.out',
                    immediateRender: false
                });
            }
        });

        // About section
        gsap.from('.about-image', {
            scrollTrigger: {
                trigger: '.about-content',
                start: 'top 80%',
                ...defaultScrollTrigger
            },
            x: -30,
            duration: 0.6,
            ease: 'power3.out',
            immediateRender: false
        });

        gsap.from('.about-text > *', {
            scrollTrigger: {
                trigger: '.about-content',
                start: 'top 80%',
                ...defaultScrollTrigger
            },
            y: 20,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            immediateRender: false
        });

        // Contact section
        gsap.from('.contact-info > *', {
            scrollTrigger: {
                trigger: '.contact-content',
                start: 'top 80%',
                ...defaultScrollTrigger
            },
            x: -20,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            immediateRender: false
        });

        gsap.from('.contact-form-container', {
            scrollTrigger: {
                trigger: '.contact-content',
                start: 'top 80%',
                ...defaultScrollTrigger
            },
            x: 20,
            duration: 0.6,
            ease: 'power3.out',
            immediateRender: false
        });

        // Blog cards
        gsap.from('.blog-card', {
            scrollTrigger: {
                trigger: '.blog-grid',
                start: 'top 85%',
                ...defaultScrollTrigger
            },
            y: 30,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power3.out',
            immediateRender: false
        });
    }

    // Skills Section Animation
    initSkillsAnimation() {
        // Progress bars animation - simple class-based approach
        const skillBarItems = document.querySelectorAll('.skill-bar-item');

        // Immediately add animate class to show progress bars
        setTimeout(() => {
            skillBarItems.forEach(item => item.classList.add('animate'));
        }, 500);

        // NOTE: Removed all GSAP animations for skill-category, skill-tag, stat-card, and service-card
        // These elements now rely on CSS for visibility (no JS animation)
        // This fixes intermittent rendering issues caused by GSAP race conditions
    }

    // Timeline Animation
    initTimelineAnimation() {
        // Timeline line draw
        gsap.from('.timeline-line', {
            scrollTrigger: {
                trigger: '.experience-timeline',
                start: 'top 80%',
                end: 'bottom 40%',
                scrub: 1
            },
            scaleY: 0,
            transformOrigin: 'top',
            immediateRender: false
        });

        // Timeline items
        gsap.utils.toArray('.timeline-item').forEach((item, i) => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                x: -20,
                duration: 0.6,
                delay: i * 0.05,
                ease: 'power3.out',
                immediateRender: false
            });

            // Marker animation
            const marker = item.querySelector('.marker-dot');
            if (marker) {
                gsap.from(marker, {
                    scrollTrigger: {
                        trigger: item,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    },
                    scale: 0,
                    duration: 0.4,
                    delay: 0.1,
                    ease: 'back.out(2)',
                    immediateRender: false
                });
            }
        });
    }

    // Projects Animation
    initProjectsAnimation() {
        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    const shouldShow = filter === 'all' || category === filter;

                    gsap.to(card, {
                        scale: shouldShow ? 1 : 0.8,
                        opacity: shouldShow ? 1 : 0.3,
                        duration: 0.4,
                        ease: 'power2.out'
                    });
                });
            });
        });

        // Project cards entrance
        gsap.from('.project-card', {
            scrollTrigger: {
                trigger: '.projects-grid',
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            y: 30,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power3.out',
            immediateRender: false
        });

        // Project card hover effect
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    scale: 1.02,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });
    }

    // Counter Animation
    initCounterAnimation() {
        const statNumbers = document.querySelectorAll('.stat-number');

        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));

            ScrollTrigger.create({
                trigger: stat,
                start: 'top 85%',
                onEnter: () => {
                    gsap.to(stat, {
                        innerText: target,
                        duration: 2,
                        snap: { innerText: 1 },
                        ease: 'power2.out'
                    });
                },
                once: true
            });
        });
    }

    // Typing Effect
    initTypingEffect() {
        const roles = [
            'Secure Backend Systems',
            'Microservices Architecture',
            'High-Performance APIs',
            'Distributed Systems',
            'Cloud Infrastructure',
            'System Architecture',
            'Real-time Data Pipelines',
            'Enterprise Solutions'
        ];

        let currentIndex = 0;
        const typedElement = document.getElementById('typed-role');

        if (!typedElement) return;

        const typeText = () => {
            const text = roles[currentIndex];

            gsap.to(typedElement, {
                duration: text.length * 0.05,
                text: text,
                ease: 'none',
                onComplete: () => {
                    gsap.delayedCall(2, deleteText);
                }
            });
        };

        const deleteText = () => {
            gsap.to(typedElement, {
                duration: typedElement.innerText.length * 0.03,
                text: '',
                ease: 'none',
                onComplete: () => {
                    currentIndex = (currentIndex + 1) % roles.length;
                    gsap.delayedCall(0.3, typeText);
                }
            });
        };

        // Start typing after loader
        gsap.delayedCall(2, typeText);
    }

    // Parallax Effect
    initParallax() {
        // Decorative elements parallax
        gsap.utils.toArray('.decoration-circle').forEach(el => {
            gsap.to(el, {
                y: -50,
                scrollTrigger: {
                    trigger: el,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        });

        // Image border parallax
        gsap.utils.toArray('.image-border').forEach(el => {
            gsap.to(el, {
                y: -30,
                x: -10,
                scrollTrigger: {
                    trigger: el,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        });
    }

    // Magnetic Buttons
    initMagneticButtons() {
        const magneticButtons = document.querySelectorAll('.btn-primary, .btn-secondary');

        magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(btn, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.3)'
                });
            });
        });
    }

    // Scroll Progress Indicator
    initScrollProgress() {
        const progressBar = document.getElementById('scroll-progress');
        if (!progressBar) return;

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            progressBar.style.width = `${progress}%`;
        });
    }

    // Sound Effects - Soft & Subtle with Variations
    initSoundEffects() {
        const soundToggle = document.getElementById('sound-toggle');
        if (!soundToggle) return;

        let audioContext = null;
        let soundEnabled = true;
        let audioInitialized = false;

        // Add visual hint that sound needs activation
        soundToggle.classList.add('needs-activation');

        // Initialize audio context on first user interaction
        const initAudioContext = () => {
            if (!audioContext && soundEnabled) {
                try {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    audioInitialized = true;
                    soundToggle.classList.remove('needs-activation');
                    // Play soft activation sound
                    playToggleSound();
                } catch (e) {
                    console.error('Failed to create audio context:', e);
                }
            }
        };

        // Initialize on earliest user activation events
        const activationEvents = ['mousedown', 'touchstart', 'keydown'];
        activationEvents.forEach(event => {
            document.addEventListener(event, initAudioContext, { once: true });
        });

        // Soft hover sound - gentle high-pitched whisper
        const playHoverSound = () => {
            if (!soundEnabled || !audioContext) return;
            try {
                if (audioContext.state === 'suspended') audioContext.resume();

                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1800, audioContext.currentTime + 0.05);
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.05);
            } catch (e) {}
        };

        // Soft click sound - gentle tap
        const playClickSound = () => {
            if (!soundEnabled || !audioContext) return;
            try {
                if (audioContext.state === 'suspended') audioContext.resume();

                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.08);
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.08);
            } catch (e) {}
        };

        // Toggle sound - soft confirmation
        const playToggleSound = () => {
            if (!soundEnabled || !audioContext) return;
            try {
                if (audioContext.state === 'suspended') audioContext.resume();

                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.06);
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.12);
            } catch (e) {}
        };

        // Success sound - gentle pleasant chime
        const playSuccessSound = () => {
            if (!soundEnabled || !audioContext) return;
            try {
                if (audioContext.state === 'suspended') audioContext.resume();

                const playNote = (freq, startTime, duration) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();

                    osc.connect(gain);
                    gain.connect(audioContext.destination);

                    osc.frequency.value = freq;
                    osc.type = 'sine';

                    gain.gain.setValueAtTime(0.04, audioContext.currentTime + startTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + startTime + duration);

                    osc.start(audioContext.currentTime + startTime);
                    osc.stop(audioContext.currentTime + startTime + duration);
                };

                // Gentle ascending chime (C5 - E5 - G5)
                playNote(523, 0, 0.15);
                playNote(659, 0.08, 0.15);
                playNote(784, 0.16, 0.25);
            } catch (e) {}
        };

        // Navigation sound - soft whoosh
        const playNavSound = () => {
            if (!soundEnabled || !audioContext) return;
            try {
                if (audioContext.state === 'suspended') audioContext.resume();

                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                const filter = audioContext.createBiquadFilter();

                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1000, audioContext.currentTime);

                gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            } catch (e) {}
        };

        // Toggle sound button
        soundToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            soundEnabled = !soundEnabled;
            soundToggle.classList.toggle('muted', !soundEnabled);

            if (soundEnabled && !audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                audioInitialized = true;
                soundToggle.classList.remove('needs-activation');
            }

            if (soundEnabled) {
                playToggleSound();
            }
        });

        // Hover sounds for interactive elements
        const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-tag, .blog-card, .timeline-content');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', playHoverSound);
        });

        // Click sounds
        document.addEventListener('click', (e) => {
            if (e.target.closest('a, button, .btn, .project-card, .blog-card')) {
                playClickSound();
            }
        });

        // Navigation sounds for section changes
        document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
            link.addEventListener('click', playNavSound);
        });

        // Store success sound globally for form submit
        window.playSuccessSound = playSuccessSound;
    }

    // Page Transitions
    initPageTransitions() {
        const transition = document.getElementById('page-transition');
        if (!transition) return;

        // Smooth scroll with fade effect for nav links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();

                // Quick fade
                transition.style.opacity = '0.3';
                transition.style.pointerEvents = 'auto';

                setTimeout(() => {
                    const offset = 80;
                    const targetPosition = target.offsetTop - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    transition.style.opacity = '0';
                    transition.style.pointerEvents = 'none';
                }, 150);
            });
        });
    }

    // Interactive Skills - Click to see related projects
    initInteractiveSkills() {
        const skillProjects = {
            'Go': ['DDoS Protection System', 'ICAP Server', 'Log Analysis System', 'Router Config Automation'],
            'Golang': ['DDoS Protection System', 'ICAP Server', 'Log Analysis System'],
            'Java': ['Store Master System', 'Serviceability Dashboard', 'Analytics Pipeline'],
            'Python': ['Analytics Pipeline', 'Automation Scripts', 'Data Processing'],
            'Microservices': ['Store Master System', 'DDoS Protection System', 'Analytics Pipeline'],
            'RESTful APIs': ['Store Master System', 'Serviceability Dashboard', 'PLP API'],
            'Kafka': ['Analytics Pipeline', 'Real-time Data Processing'],
            'PostgreSQL': ['Store Master System', 'Serviceability Dashboard'],
            'Docker': ['All deployment pipelines', 'Containerized services'],
            'WAF Development': ['Web Application Firewall', 'ModSecurity Integration'],
            'DDoS Protection': ['DDoS Protection System', 'Traffic Analysis'],
            'ModSecurity': ['Web Application Firewall', 'GraphQL Parser'],
            'GraphQL': ['GraphQL Parser', 'API Development'],
            'WebSockets': ['Real-time Systems', 'Live Updates'],
            'Security': ['WAF', 'DDoS Protection', 'Anti-APT System', 'ICAP Server']
        };

        const modal = document.getElementById('skill-modal');
        const modalTitle = document.getElementById('skill-modal-title');
        const relatedProjects = document.getElementById('related-projects');

        if (!modal) return;

        // Make skill tags clickable
        document.querySelectorAll('.skill-tag, .skill-name').forEach(tag => {
            tag.style.cursor = 'pointer';
            tag.addEventListener('click', () => {
                const skillName = tag.textContent.trim();
                const projects = skillProjects[skillName] || skillProjects[skillName.split(' ')[0]] || ['Various projects using this skill'];

                modalTitle.textContent = skillName;
                relatedProjects.innerHTML = projects.map(project => `
                    <div class="related-project-item" data-project="${project}">
                        <h4>${project}</h4>
                        <p>Click to view project details</p>
                    </div>
                `).join('');

                // Make related project items clickable
                relatedProjects.querySelectorAll('.related-project-item').forEach(item => {
                    item.style.cursor = 'pointer';
                    item.addEventListener('click', () => {
                        const projectName = item.dataset.project;
                        modal.classList.remove('active');

                        // Find and click the matching project card
                        const projectCards = document.querySelectorAll('.project-card');
                        for (const card of projectCards) {
                            const title = card.querySelector('.project-title')?.textContent?.trim();
                            if (title === projectName) {
                                setTimeout(() => card.click(), 300);
                                return;
                            }
                        }

                        // If no exact match, scroll to projects section
                        const projectsSection = document.getElementById('projects');
                        if (projectsSection) {
                            projectsSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    });
                });

                modal.classList.add('active');
            });
        });

        // Close modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        window.closeSkillModal = () => modal.classList.remove('active');
    }

    // Project Modal - Click to see project details
    initProjectModal() {
        const projectDetails = {
            'DDoS Protection System': {
                badge: 'WiJungle',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
                description: 'Enterprise-grade DDoS protection system built with Go, featuring advanced traffic analysis, real-time threat detection, and automated mitigation. The system processes millions of requests daily while maintaining sub-millisecond latency for legitimate traffic.',
                tech: ['Go', 'Security', 'Real-time', 'Redis', 'NGINX'],
                stats: ['35% faster detection', '60% less downtime', '1M+ requests/day'],
                details: [
                    'Implemented multi-layer traffic analysis with behavioral patterns',
                    'Built real-time dashboard for monitoring attack vectors',
                    'Designed auto-scaling rules based on traffic patterns',
                    'Integrated with existing security infrastructure'
                ]
            },
            'Web Application Firewall': {
                badge: 'WiJungle',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
                description: 'Comprehensive Web Application Firewall protecting 50+ enterprise websites with customized ModSecurity rules, real-time threat monitoring, and advanced SQL injection/XSS prevention.',
                tech: ['ModSecurity', 'Go', 'NGINX', 'Lua'],
                stats: ['50+ websites protected', '25% fewer breaches', '99.9% uptime'],
                details: [
                    'Custom rule development for specific attack patterns',
                    'Integration with threat intelligence feeds',
                    'Real-time alerting and incident response',
                    'Performance optimization for high-traffic sites'
                ]
            },
            'Store Master System': {
                badge: 'Clickpost',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
                description: 'Comprehensive store management backend supporting bulk CRUD operations for 1000+ stores with geolocation validation using Haversine calculations for hyper-local quick commerce delivery.',
                tech: ['Java', 'PostgreSQL', 'Haversine', 'Spring Boot'],
                stats: ['1000+ stores managed', 'Bulk operations', 'Real-time sync'],
                details: [
                    'Bulk import/export with validation',
                    'Geolocation-based store matching',
                    'Real-time inventory synchronization',
                    'API integration with delivery partners'
                ]
            },
            'GraphQL Parser': {
                badge: 'Open Source',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
                description: 'High-performance C++ GraphQL parser integrated with ModSecurity as an adaptive module. Parses complex queries and converts to JSON for security rule evaluation.',
                tech: ['C++', 'GraphQL', 'ModSecurity', 'JSON'],
                stats: ['40% latency reduction', 'Full spec compliance'],
                details: [
                    'Complete GraphQL specification support',
                    'Streaming parser for large queries',
                    'ModSecurity integration module',
                    'Comprehensive test coverage'
                ]
            },
            'Log Analysis System': {
                badge: 'WiJungle',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
                description: 'High-throughput log processing system that converts diverse log formats to JSON and transmits via Unix sockets to Manticore for indexed searching and graph analysis.',
                tech: ['Go', 'Unix Sockets', 'Manticore', 'JSON'],
                stats: ['80% faster processing', '10GB+ logs/day'],
                details: [
                    'Multi-format log parsing (syslog, JSON, custom)',
                    'Real-time streaming via Unix sockets',
                    'Manticore integration for full-text search',
                    'Dashboard for log visualization'
                ]
            },
            'ICAP Server': {
                badge: 'WiJungle',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
                description: 'High-performance ICAP server built with Go and Squid proxy, handling 100,000+ HTTP/HTTPS requests daily for content inspection and security policy enforcement.',
                tech: ['Go', 'Squid', 'ICAP', 'Security'],
                stats: ['100K+ daily requests', 'Sub-ms latency'],
                details: [
                    'Content inspection and modification',
                    'Virus scanning integration',
                    'URL categorization',
                    'SSL/TLS inspection support'
                ]
            },
            'Anti-APT Defense System': {
                badge: 'WiJungle',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
                description: 'Advanced Persistent Threat detection system that analyzes request patterns, detects anomalies, and identifies sophisticated attack campaigns targeting enterprise infrastructure.',
                tech: ['Go', 'Security', 'ML', 'Threat Detection'],
                stats: ['65% threat reduction', 'Zero false positives'],
                details: [
                    'Behavioral analysis of traffic patterns',
                    'Correlation with threat intelligence',
                    'Automated response and blocking',
                    'Detailed forensic reporting'
                ]
            },
            'Router Config Automation': {
                badge: 'WiJungle',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
                description: 'Automated router configuration management system using Go and MQTT protocol, enabling remote configuration updates, monitoring, and CRUD operations across distributed network devices.',
                tech: ['Go', 'MQTT', 'Automation', 'Networking'],
                stats: ['70% less manual work', '500+ devices'],
                details: [
                    'MQTT-based real-time communication',
                    'Configuration templating and validation',
                    'Rollback capability for failed updates',
                    'Audit logging for compliance'
                ]
            }
        };

        const modal = document.getElementById('project-modal');
        if (!modal) return;

        // Make project cards clickable
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('.project-title')?.textContent?.trim();
                const project = projectDetails[title];

                if (project) {
                    document.getElementById('project-modal-icon').innerHTML = project.icon;
                    document.getElementById('project-modal-badge').textContent = project.badge;
                    document.getElementById('project-modal-title').textContent = title;
                    document.getElementById('project-modal-description').textContent = project.description;
                    document.getElementById('project-modal-tech').innerHTML = project.tech.map(t => `<span>${t}</span>`).join('');
                    document.getElementById('project-modal-stats').innerHTML = project.stats.map(s => `<span>${s}</span>`).join('');
                    document.getElementById('project-modal-details').innerHTML = `
                        <h4>Key Achievements</h4>
                        <ul>${project.details.map(d => `<li>${d}</li>`).join('')}</ul>
                    `;
                    modal.classList.add('active');
                }
            });
        });

        // Close modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        window.closeProjectModal = () => modal.classList.remove('active');

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.classList.remove('active');
            }
        });
    }

    // Confetti Animation
    initConfetti() {
        const container = document.getElementById('confetti-container');
        if (!container) return;

        window.triggerConfetti = () => {
            const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'];

            for (let i = 0; i < 100; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.width = Math.random() * 10 + 5 + 'px';
                confetti.style.height = Math.random() * 10 + 5 + 'px';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                container.appendChild(confetti);

                gsap.fromTo(confetti, {
                    y: -20,
                    x: 0,
                    rotation: 0,
                    opacity: 1
                }, {
                    y: window.innerHeight + 100,
                    x: (Math.random() - 0.5) * 400,
                    rotation: Math.random() * 720 - 360,
                    opacity: 0,
                    duration: Math.random() * 2 + 2,
                    ease: 'power1.out',
                    delay: Math.random() * 0.5,
                    onComplete: () => confetti.remove()
                });
            }

            // Play success sound if available
            if (window.playSuccessSound) {
                window.playSuccessSound();
            }
        };
    }

    // Live Visitor Count via WebSocket
    initLiveVisitors() {
        const visitorCountEl = document.getElementById('visitor-count');
        if (!visitorCountEl) return;

        // Get WebSocket URL from config
        const backendUrl = typeof CONFIG !== 'undefined' ? CONFIG.BACKEND_URL : 'https://web-production-f618.up.railway.app';
        const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws';
        const wsUrl = backendUrl.replace(/^https?/, wsProtocol) + '/ws/visitors';

        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        let reconnectTimeout = null;

        const connectWebSocket = () => {
            try {
                const ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    console.log('Live visitors WebSocket connected');
                    reconnectAttempts = 0;
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.count !== undefined) {
                            gsap.to(visitorCountEl, {
                                innerHTML: data.count,
                                duration: 0.3,
                                snap: { innerHTML: 1 }
                            });
                        }
                    } catch (e) {
                        console.error('Error parsing visitor count:', e);
                    }
                };

                ws.onclose = () => {
                    console.log('Live visitors WebSocket closed');
                    // Attempt to reconnect with exponential backoff
                    if (reconnectAttempts < maxReconnectAttempts) {
                        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
                        reconnectTimeout = setTimeout(() => {
                            reconnectAttempts++;
                            connectWebSocket();
                        }, delay);
                    } else {
                        // Fallback to simulated count after max attempts
                        console.log('Max reconnect attempts reached, using simulated count');
                        simulateFallback();
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };

            } catch (error) {
                console.error('Failed to create WebSocket:', error);
                simulateFallback();
            }
        };

        // Fallback simulation if WebSocket fails
        const simulateFallback = () => {
            let count = Math.floor(Math.random() * 5) + 2;
            visitorCountEl.textContent = count;

            setInterval(() => {
                const change = Math.random() > 0.5 ? 1 : -1;
                count = Math.max(1, Math.min(12, count + change));
                gsap.to(visitorCountEl, {
                    innerHTML: count,
                    duration: 0.3,
                    snap: { innerHTML: 1 }
                });
            }, 30000 + Math.random() * 30000);
        };

        // Start WebSocket connection
        connectWebSocket();
    }
}

// Initialize animations
window.animations = new Animations();
