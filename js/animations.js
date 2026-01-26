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
    }

    // Ensure all content is visible after animations complete
    ensureVisibility() {
        // Fallback to make all content visible after 2 seconds
        setTimeout(() => {
            const elements = document.querySelectorAll(
                '.section-header, .about-image, .about-text, .skill-category, ' +
                '.stat-card, .service-card, .project-card, .timeline-item, ' +
                '.blog-card, .contact-info, .contact-form-container'
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

    // Custom Cursor
    initCursor() {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');

        if (!cursor || !follower) return;

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const animate = () => {
            // Smooth cursor movement
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;

            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
            follower.style.left = `${followerX}px`;
            follower.style.top = `${followerY}px`;

            requestAnimationFrame(animate);
        };
        animate();

        // Hover effects
        const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-tag');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                follower.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                follower.classList.remove('hover');
            });
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
        const tl = gsap.timeline();

        tl.from('.hero-badge', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out'
        })
        .from('.title-line', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.3')
        .from('.title-name', {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.4')
        .from('.hero-roles', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.5')
        .from('.hero-description', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.4')
        .from('.hero-cta .btn', {
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out'
        }, '-=0.3')
        .from('.hero-stats .stat', {
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out'
        }, '-=0.3')
        .from('.code-window', {
            x: 50,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.8')
        .from('.scroll-indicator', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
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
        // Stats cards animation
        gsap.from('.stat-card', {
            scrollTrigger: {
                trigger: '.skills-stats',
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            y: 20,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            immediateRender: false
        });

        // Progress bars animation - trigger immediately and on scroll
        const skillBarItems = document.querySelectorAll('.skill-bar-item');
        skillBarItems.forEach(item => {
            ScrollTrigger.create({
                trigger: item,
                start: 'top 90%',
                onEnter: () => item.classList.add('animate'),
                once: true
            });
        });
        // Also trigger after a delay as fallback
        setTimeout(() => {
            skillBarItems.forEach(item => item.classList.add('animate'));
        }, 1500);

        // Skill categories
        gsap.from('.skill-category', {
            scrollTrigger: {
                trigger: '.skills-categories',
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            y: 20,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            immediateRender: false
        });

        // Services cards
        gsap.from('.service-card', {
            scrollTrigger: {
                trigger: '.services-section',
                start: 'top 90%',
                toggleActions: 'play none none none'
            },
            y: 20,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            immediateRender: false
        });

        // Skill tags pop-in
        gsap.utils.toArray('.skill-tags').forEach(container => {
            gsap.from(container.children, {
                scrollTrigger: {
                    trigger: container,
                    start: 'top 85%'
                },
                scale: 0,
                opacity: 0,
                duration: 0.4,
                stagger: 0.05,
                ease: 'back.out(1.7)'
            });
        });
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
            'DDoS Protection',
            'RESTful APIs',
            'Scalable Solutions'
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
}

// Initialize animations
window.animations = new Animations();
