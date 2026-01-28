/**
 * Main JavaScript
 * Core functionality and integrations
 */

class App {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initSmoothScroll();
            this.initContactForm();
            this.initGitHubRepos();
            this.initResumeAnalyzer();
            this.initScrollReveal();
            this.initFormValidation();
        });
    }

    // Smooth Scroll for anchor links
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const offset = 80; // Navbar height
                    const targetPosition = target.offsetTop - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Contact Form Handling with Go Backend
    initContactForm() {
        const form = document.getElementById('contact-form');
        const successMessage = document.getElementById('form-success');

        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.innerHTML = `
                <span>Sending...</span>
                <div class="loading-spinner" style="width: 18px; height: 18px; border-width: 2px;"></div>
            `;
            submitBtn.disabled = true;

            // Get form data
            const formData = {
                name: form.querySelector('#name').value,
                email: form.querySelector('#email').value,
                subject: form.querySelector('#subject').value,
                message: form.querySelector('#message').value
            };

            try {
                // Send via Railway backend API
                const response = await fetch(getApiUrl('contact'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    // Show success message
                    form.style.display = 'none';
                    successMessage.classList.remove('hidden');

                    // Trigger confetti celebration
                    if (window.triggerConfetti) {
                        window.triggerConfetti();
                    }

                    // Reset after delay
                    setTimeout(() => {
                        form.reset();
                        form.style.display = 'flex';
                        successMessage.classList.add('hidden');
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }, 5000);
                } else {
                    throw new Error(result.message || 'Submission failed');
                }

            } catch (error) {
                console.error('Form submission error:', error);

                // Fallback: Open email client
                const mailtoLink = `mailto:yadavbhavy25@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`;
                window.location.href = mailtoLink;

                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // GitHub Repositories
    initGitHubRepos() {
        const reposContainer = document.getElementById('github-repos');
        if (!reposContainer) return;

        // Custom descriptions for repos without GitHub descriptions
        const customDescriptions = {
            'VideoAI': 'AI-powered video creation app using Stable Diffusion. Chat interface for text-to-video generation with local GPU processing.',
            'ChatApp': 'AI interview assistant with real-time audio transcription and Claude-powered responses for DSA & System Design.',
            'Habit-Tracker': 'Beautiful gamified habit tracker for Linux with mood logging, Pomodoro timer, and progress leveling system.',
            'System-Info': 'System information utility built in Go for monitoring hardware and OS details.',
            'CLI-task-manager': 'Go-powered CLI task manager with add, list, mark done, delete tasks and PDF export feature.',
            'go-indexer': 'CLI tool for indexing and searching text files using Redis with RediSearch.',
            'torrent': 'BitTorrent client implementation in Go.',
            'High-Performance-Web-Server-GoLang-': 'High-performance web server built with Go for handling concurrent requests efficiently.',
            'log-listener': 'Real-time log monitoring and listening utility built in Go.',
            'newSite': 'Web development project with modern HTML/CSS design.',
            'Golang-Webserver': 'Simple and efficient web server implementation in Go.'
        };

        // Repos to exclude from display
        const excludeRepos = ['Hotel-Reservation-Backend', 'VulnHunter', 'WEB'];

        this.fetchGitHubRepos('Bhavyyadav25')
            .then(repos => {
                // Filter out excluded repos
                const filteredRepos = repos.filter(repo => !excludeRepos.includes(repo.name));

                if (filteredRepos.length === 0) {
                    reposContainer.innerHTML = `
                        <div class="repo-card">
                            <h4>Check out my GitHub</h4>
                            <p>Visit my GitHub profile to see my latest projects and contributions.</p>
                            <div class="repo-meta">
                                <span>github.com/Bhavyyadav25</span>
                            </div>
                        </div>
                    `;
                    return;
                }

                reposContainer.innerHTML = filteredRepos.slice(0, 6).map(repo => {
                    // Use custom description if available, otherwise use GitHub description
                    const description = repo.description || customDescriptions[repo.name] || 'Explore this project on GitHub';
                    return `
                    <a href="${repo.html_url}" target="_blank" class="repo-card">
                        <h4>${this.escapeHtml(repo.name)}</h4>
                        <p>${this.escapeHtml(description)}</p>
                        <div class="repo-meta">
                            ${repo.language ? `<span>${this.escapeHtml(repo.language)}</span>` : ''}
                            <span>${repo.stargazers_count} stars</span>
                            <span>${repo.forks_count} forks</span>
                        </div>
                    </a>
                `}).join('');
            })
            .catch(error => {
                console.error('GitHub API error:', error);
                reposContainer.innerHTML = `
                    <div class="repo-card">
                        <h4>GitHub Repositories</h4>
                        <p>Visit my GitHub profile to explore my projects.</p>
                        <div class="repo-meta">
                            <span>github.com/Bhavyyadav25</span>
                        </div>
                    </div>
                `;
            });
    }

    async fetchGitHubRepos(username) {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);

        if (!response.ok) {
            throw new Error('Failed to fetch repos');
        }

        return await response.json();
    }

    // Resume Analyzer Modal
    initResumeAnalyzer() {
        const modal = document.getElementById('resume-analyzer');
        const analyzerBtn = document.querySelector('[data-open-analyzer]');
        const closeBtn = modal?.querySelector('.modal-close');

        // Open on special trigger (could add a button)
        analyzerBtn?.addEventListener('click', () => {
            modal.classList.add('active');
            this.animateAnalyzer();
        });

        // Close modal
        closeBtn?.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // Keyboard shortcut to open (Ctrl/Cmd + I)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                modal?.classList.toggle('active');
                if (modal?.classList.contains('active')) {
                    this.animateAnalyzer();
                }
            }
        });
    }

    animateAnalyzer() {
        const meters = document.querySelectorAll('.meter-fill');
        meters.forEach(meter => {
            const fill = meter.style.getPropertyValue('--fill');
            meter.style.width = '0%';
            setTimeout(() => {
                meter.style.width = fill;
            }, 100);
        });
    }

    // Scroll Reveal Animation (throttled)
    initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal');
        let ticking = false;

        const revealOnScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const windowHeight = window.innerHeight;
                revealElements.forEach(el => {
                    if (!el.classList.contains('active')) {
                        const elementTop = el.getBoundingClientRect().top;
                        if (elementTop < windowHeight - 150) {
                            el.classList.add('active');
                        }
                    }
                });
                ticking = false;
            });
        };

        window.addEventListener('scroll', revealOnScroll, { passive: true });
        revealOnScroll(); // Initial check
    }

    // Form Validation
    initFormValidation() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea');

        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) existingError.remove();

        // Validation rules
        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;

            case 'text':
            case 'textarea':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'This field is required';
                }
                break;
        }

        if (!isValid && value) {
            field.classList.add('error');
            const errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            errorEl.textContent = errorMessage;
            errorEl.style.cssText = 'color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem; display: block;';
            field.parentNode.appendChild(errorEl);
        }

        return isValid;
    }

    // Utility: Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize App
window.app = new App();

// Performance: Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable PWA
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('SW registered'))
        //     .catch(err => console.log('SW registration failed'));
    });
}

// Console Easter Egg
console.log(`
%c Bhavy Yadav's Portfolio
%c Looking for the source code? Check out github.com/bhavy
%c Built with love using vanilla JS, Three.js, and GSAP

%c Want to hire me? Email: yadavbhavy25@gmail.com
`,
'font-size: 20px; font-weight: bold; color: #6366f1;',
'font-size: 12px; color: #a1a1aa;',
'font-size: 12px; color: #a1a1aa;',
'font-size: 14px; color: #22c55e; font-weight: bold;'
);
