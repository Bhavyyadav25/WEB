/**
 * AI Chatbot
 * Smart assistant with knowledge about Bhavy
 * Uses Groq API (free tier) or falls back to intelligent pre-programmed responses
 */

class Chatbot {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        this.conversationHistory = [];
        this.lastTopic = null; // Track conversation context

        // Bhavy's information for AI context
        this.bhavyInfo = {
            name: "Bhavy Yadav",
            title: "Software Development Engineer",
            currentCompany: "Clickpost",
            previousCompany: "WiJungle",
            location: "Delhi, India",
            email: "yadavbhavy25@gmail.com",
            phone: "+91 7303345356",
            linkedin: "linkedin.com/in/yadavbhavy",
            github: "github.com/Bhavyyadav25",
            twitter: "x.com/bhavy_yadav",
            education: {
                institution: "IIT Delhi",
                degree: "B.Tech in Fiber Science & Nanotechnology",
                years: "2019-2023",
                achievements: [
                    "Captain, Badminton Team - Led team to state gold medal and IIT Delhi GC win",
                    "Coordinator, Rendezvous IIT Delhi - Led team of 35 for event management",
                    "Academic Mentor - Mentored students in engineering drawing"
                ]
            },
            skills: {
                languages: ["Go", "Java", "Python", "C++"],
                backend: ["Microservices", "RESTful APIs", "Kafka", "NGINX", "Docker"],
                databases: ["PostgreSQL", "ScyllaDB", "Manticore", "Redis"],
                security: ["ModSecurity", "WAF", "DDoS Protection", "Anti-APT"],
                protocols: ["GraphQL", "WebSockets", "Unix Sockets", "MQTT", "ICAP"]
            },
            experience: {
                clickpost: {
                    role: "Software Development Engineer",
                    period: "Sep 2025 - Present",
                    highlights: [
                        "Store Master System: Backend for 1000+ stores with geolocation validation",
                        "Serviceability Dashboard: RESTful APIs for delivery configurations",
                        "Shipment Analytics Pipeline: High-throughput bulk data processing",
                        "PLP Delivery Options API: Real-time delivery for e-commerce platforms"
                    ]
                },
                wijungle: {
                    role: "Software Development Engineer",
                    period: "Jul 2023 - Apr 2025",
                    highlights: [
                        "GraphQL Parser: C++ parser with 40% latency reduction",
                        "DDoS Protection: 35% faster detection, 60% less downtime",
                        "WAF: Protected 50+ client websites, 25% fewer breaches",
                        "Log Analyzer: 80% faster log processing",
                        "Anti-APT System: 65% reduction in threats",
                        "ICAP Server: Handling 100,000+ daily requests"
                    ]
                }
            },
            achievements: [
                "Team Lead at WiJungle - Managed 3 engineers",
                "Product Owner - Led WAF project with team of 7",
                "National Science Olympiad - Ranked 599 internationally",
                "International Mathematical Olympiad - Top 2.5%"
            ],
            availability: "Open to freelance projects and full-time opportunities"
        };

        this.init();
    }

    init() {
        this.chatbot = document.getElementById('chatbot');
        this.toggle = document.getElementById('chatbot-toggle');
        this.minimize = document.querySelector('.chatbot-minimize');
        this.messagesContainer = document.getElementById('chatbot-messages');
        this.form = document.getElementById('chatbot-form');
        this.input = document.getElementById('chatbot-input-field');
        this.suggestions = document.querySelectorAll('.suggestion');

        if (!this.chatbot) return;

        this.bindEvents();
    }

    bindEvents() {
        // Toggle chatbot
        this.toggle?.addEventListener('click', () => this.toggleChat());
        this.minimize?.addEventListener('click', () => this.toggleChat());

        // Form submission
        this.form?.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = this.input.value.trim();
            if (message) {
                this.sendMessage(message);
                this.input.value = '';
            }
        });

        // Suggestion clicks
        this.suggestions.forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.getAttribute('data-message');
                this.sendMessage(message);
            });
        });

        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.toggleChat();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatbot.classList.toggle('active', this.isOpen);

        if (this.isOpen) {
            this.input.focus();
        }
    }

    async sendMessage(text) {
        // Add user message
        this.addMessage(text, 'user');
        this.conversationHistory.push({ role: 'user', content: text });

        // Show typing indicator
        this.showTyping();

        let response;
        try {
            response = await this.callBackendChat(text);
        } catch (e) {
            // Fallback to local keyword responses if API fails
            response = this.generateResponse(text);
        }

        this.hideTyping();
        this.addMessage(response, 'bot');
        this.conversationHistory.push({ role: 'assistant', content: response });
    }

    async callBackendChat(message) {
        const apiUrl = typeof getApiUrl === 'function'
            ? getApiUrl('chat')
            : (typeof CONFIG !== 'undefined' ? CONFIG.BACKEND_URL : 'https://web-production-f618.up.railway.app') + '/api/chat';

        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                history: this.conversationHistory.slice(-20)
            })
        });

        if (!res.ok) throw new Error(`API ${res.status}`);

        const data = await res.json();
        if (data.success && data.data?.response) {
            return data.data.response;
        }
        throw new Error('No response from API');
    }

    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${this.formatMessage(text)}</p>
            </div>
        `;

        // Remove typing indicator if exists
        const typingIndicator = this.messagesContainer.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(text) {
        // Convert markdown-like formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    showTyping() {
        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTyping() {
        this.isTyping = false;
        const typingIndicator = this.messagesContainer.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    generateResponse(userMessage) {
        const msg = userMessage.toLowerCase();
        const info = this.bhavyInfo;

        // Handle affirmative responses based on conversation context
        if (this.lastTopic && this.isAffirmative(msg)) {
            const topic = this.lastTopic;
            this.lastTopic = null; // Reset after using
            return this.getTopicResponse(topic);
        }

        // Handle "tell me more" or "more details" type requests
        if (this.lastTopic && this.matchesIntent(msg, ['more', 'detail', 'elaborate', 'explain'])) {
            const topic = this.lastTopic;
            this.lastTopic = null;
            return this.getTopicResponse(topic);
        }

        // Greeting - check first for conversation starters
        if (/^(hi|hello|hey|greetings|good morning|good evening|howdy)[\s!?.]*$/i.test(msg) ||
            (msg.length < 15 && this.matchesIntent(msg, ['hi', 'hello', 'hey']))) {
            this.lastTopic = null;
            const greetings = [
                "Hello! I'm Bhavy's AI assistant. How can I help you today? Feel free to ask about his skills, experience, or projects!",
                "Hey there! Great to meet you. I can tell you all about Bhavy's work in backend development and security. What interests you?",
                "Hi! Welcome to Bhavy's portfolio. Would you like to know about his skills, projects, or how to get in touch?"
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        }

        // Thank you
        if (this.matchesIntent(msg, ['thank', 'thanks', 'appreciate'])) {
            this.lastTopic = null;
            return "You're welcome! If you have any more questions about Bhavy or want to discuss a potential project, feel free to ask. You can also reach out directly using the contact form!";
        }

        // Clickpost specific - check before general experience
        if (this.matchesIntent(msg, ['clickpost'])) {
            this.lastTopic = 'wijungle'; // Suggest WiJungle next
            return `At **Clickpost** (Sep 2025 - Present), Bhavy works as a Software Development Engineer building logistics solutions:\n\n**Key Projects:**\n\n**1. Store Master System**\n- Backend for managing 1000+ stores\n- Geolocation validation & real-time updates\n- Tech: Java, PostgreSQL\n\n**2. Serviceability Dashboard**\n- RESTful APIs for delivery configurations\n- Pincode-based serviceability checks\n\n**3. Shipment Analytics Pipeline**\n- High-throughput bulk data processing\n- Kafka consumers for real-time analytics\n\n**4. PLP Delivery Options API**\n- Real-time delivery estimates for e-commerce\n- Integration with platforms like ARVIND\n\nWant to know about his previous role at WiJungle?`;
        }

        // WiJungle specific - check before general experience
        if (this.matchesIntent(msg, ['wijungle'])) {
            this.lastTopic = 'skills'; // Suggest skills next
            return `At **WiJungle** (Jul 2023 - Apr 2025), Bhavy was an SDE building enterprise security solutions:\n\n**Key Projects:**\n\n**1. DDoS Protection System** (Go)\n- 35% faster attack detection\n- 60% reduction in downtime\n\n**2. Web Application Firewall** (Go + ModSecurity)\n- Protected 50+ client websites\n- 25% fewer security breaches\n\n**3. Anti-APT System**\n- 65% reduction in advanced threats\n- Real-time threat intelligence\n\n**4. ICAP Server**\n- Handles 100,000+ daily HTTP/HTTPS requests\n- Content filtering & malware scanning\n\n**5. GraphQL Parser** (C++)\n- 40% latency reduction\n\n**Leadership:** Team Lead managing 3 engineers, Product Owner for WAF project (team of 7)\n\nWant to know about his technical skills?`;
        }

        // Projects related - check before experience (more specific)
        if (this.matchesIntent(msg, ['project', 'built', 'created', 'developed', 'portfolio', 'made', 'build'])) {
            this.lastTopic = 'contact';
            return `Here are notable projects Bhavy has built:\n\n**At WiJungle (Security):**\n- **DDoS Protection System** (Go) - 35% faster detection\n- **Web Application Firewall** - Protected 50+ websites\n- **Anti-APT System** - 65% threat reduction\n- **ICAP Server** - 100K+ daily requests\n- **GraphQL Parser** (C++) - 40% latency reduction\n\n**At Clickpost (Logistics):**\n- **Store Master System** - 1000+ stores management\n- **Serviceability Dashboard** - Delivery configurations\n- **Shipment Analytics Pipeline** - Kafka-based processing\n- **PLP Delivery API** - Real-time delivery estimates\n\nWant to get in touch with him?`;
        }

        // Experience/Work related - general
        if (this.matchesIntent(msg, ['experience', 'job', 'company', 'career', 'work history', 'employment'])) {
            this.lastTopic = 'clickpost';
            return `Bhavy has 2+ years of professional experience:\n\n**Current: Clickpost** (Sep 2025 - Present)\nSDE building store management, serviceability APIs, and analytics pipelines for quick commerce logistics.\n\n**Previous: WiJungle** (Jul 2023 - Apr 2025)\nSDE & Team Lead building enterprise security solutions - DDoS protection, WAF, Anti-APT systems.\n\n**Highlights:**\n- Led team of 3 engineers\n- Product Owner for WAF project (team of 7)\n- Systems handling 100K+ daily requests\n\nWant to know more about his current role at Clickpost?`;
        }

        // Skills related
        if (this.matchesIntent(msg, ['skill', 'technology', 'tech stack', 'programming', 'language', 'expertise', 'know', 'proficient'])) {
            this.lastTopic = 'projects';
            return `Bhavy's technical skills:\n\n**Languages:** ${info.skills.languages.join(', ')}\n\n**Backend:** ${info.skills.backend.join(', ')}\n\n**Databases:** ${info.skills.databases.join(', ')}\n\n**Security:** ${info.skills.security.join(', ')}\n\n**Protocols:** ${info.skills.protocols.join(', ')}\n\nWant to see the projects he's built with these skills?`;
        }

        // Education related
        if (this.matchesIntent(msg, ['education', 'study', 'college', 'university', 'degree', 'iit', 'school', 'graduate'])) {
            this.lastTopic = 'achievements';
            return `Bhavy graduated from **IIT Delhi** with a B.Tech in Fiber Science & Nanotechnology (2019-2023).\n\n**Highlights:**\n- Captain of Badminton Team (State Gold Medal winner!)\n- Coordinator at Rendezvous (led team of 35)\n- Academic Mentor for engineering drawing\n\nWant to know about his achievements and awards?`;
        }

        // Contact related
        if (this.matchesIntent(msg, ['contact', 'reach', 'email', 'phone', 'connect', 'get in touch', 'talk to'])) {
            this.lastTopic = null;
            return `Here's how to reach Bhavy:\n\n**Email:** ${info.email}\n**Phone:** ${info.phone}\n**LinkedIn:** ${info.linkedin}\n**GitHub:** ${info.github}\n**Twitter:** ${info.twitter}\n\nYou can also use the **Contact form** below to send a message directly. He typically responds within 24 hours!`;
        }

        // Location related
        if (this.matchesIntent(msg, ['where', 'location', 'based', 'live', 'city', 'country'])) {
            this.lastTopic = 'contact';
            return `Bhavy is based in **${info.location}**. He works remotely at Clickpost and is open to both remote and on-site opportunities.\n\nWant his contact info?`;
        }

        // Security related
        if (this.matchesIntent(msg, ['security', 'waf', 'ddos', 'firewall', 'protect', 'cyber', 'threat'])) {
            this.lastTopic = 'wijungle';
            return `Bhavy has deep expertise in **cybersecurity**:\n\n**Projects at WiJungle:**\n- **DDoS Protection System** - 35% faster detection, 60% less downtime\n- **Web Application Firewall** - Protected 50+ websites, 25% fewer breaches\n- **Anti-APT System** - 65% reduction in advanced threats\n- **ICAP Server** - 100K+ daily HTTP/HTTPS requests\n\n**Skills:** ModSecurity, WAF rules, DDoS mitigation, threat intelligence\n\nWant to learn more about his time at WiJungle?`;
        }

        // Backend related
        if (this.matchesIntent(msg, ['backend', 'api', 'microservice', 'server', 'scalable', 'architecture'])) {
            this.lastTopic = 'clickpost';
            return `Bhavy specializes in **backend development**:\n\n**Languages:** Go, Java, Python, C++\n**Architecture:** Microservices, RESTful APIs\n**Message Queues:** Kafka consumers\n**Databases:** PostgreSQL, ScyllaDB, Manticore, Redis\n**Protocols:** GraphQL, WebSockets, MQTT, ICAP\n\nWant to know what he's building at Clickpost?`;
        }

        // Achievements related
        if (this.matchesIntent(msg, ['achievement', 'award', 'accomplish', 'proud', 'olympiad'])) {
            this.lastTopic = 'contact';
            return `Bhavy's notable achievements:\n\n**Professional:**\n- Team Lead at WiJungle (managed 3 engineers)\n- Product Owner for WAF project (team of 7)\n\n**Academic:**\n- IIT Delhi Badminton Captain - State Gold Medal\n- National Science Olympiad - Ranked 599 internationally\n- International Math Olympiad - Top 2.5%\n\n**Impact:**\n- Reduced security breaches by 25%\n- Cut attack detection time by 35%\n- Systems processing 100K+ requests daily\n\nWant to get in touch?`;
        }

        // Hiring/Freelance related
        if (this.matchesIntent(msg, ['freelance', 'hire', 'cost', 'rate', 'available', 'opportunity', 'open to'])) {
            this.lastTopic = 'contact';
            return `Bhavy is currently ${info.availability}!\n\n**Freelance Projects:**\n- Backend development (Go, Java, Python)\n- Security systems & audits\n- API development & integration\n- Microservices architecture\n\n**Full-time Opportunities:**\n- SDE roles in backend/security\n- Team lead positions\n\nWant his contact info?`;
        }

        // About/Introduction - less greedy matching
        if (msg.includes('who is bhavy') || msg.includes('about bhavy') || msg.includes('introduce') ||
            (msg.includes('who') && msg.includes('he')) || msg === 'about') {
            this.lastTopic = 'clickpost';
            return `**Bhavy Yadav** is a Software Development Engineer at Clickpost.\n\n**Background:**\n- IIT Delhi graduate (B.Tech)\n- 2+ years in backend & security\n- Currently building logistics solutions\n\n**Expertise:**\n- Go, Java, Python, C++\n- Security systems (WAF, DDoS protection)\n- Microservices & distributed systems\n\nWant to know more about his current work?`;
        }

        // Current role/doing
        if ((msg.includes('current') || msg.includes('doing') || msg.includes('now')) &&
            (msg.includes('role') || msg.includes('work') || msg.includes('job') || msg.includes('he'))) {
            this.lastTopic = 'wijungle';
            return `Bhavy is currently working as a **Software Development Engineer at Clickpost** (since Sep 2025).\n\n**What he's building:**\n- Store Master System for 1000+ stores\n- Serviceability Dashboard with RESTful APIs\n- Shipment Analytics Pipeline with Kafka\n- PLP Delivery Options API for e-commerce\n\n**Tech Stack:** Java, PostgreSQL, Kafka, Microservices\n\nWant to know about his previous role at WiJungle?`;
        }

        // Default response
        const defaultResponses = [
            `I can help you learn about Bhavy! Try asking:\n\n- "What projects has he built?"\n- "Tell me about Clickpost" or "Tell me about WiJungle"\n- "What are his skills?"\n- "How can I contact him?"\n\nWhat interests you?`,
            `Here's what I can tell you about:\n\n- **Projects** - Systems he's built at Clickpost & WiJungle\n- **Skills** - Go, Java, Python, Security\n- **Experience** - His professional journey\n- **Contact** - How to reach him\n\nJust ask!`,
            `I'd be happy to help! You can ask about:\n\n- His work at **Clickpost** (current) or **WiJungle** (previous)\n- **Technical skills** and expertise\n- **Projects** with real impact metrics\n- How to **contact** him\n\nWhat would you like to know?`
        ];

        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    matchesIntent(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }

    isAffirmative(message) {
        const affirmatives = [
            'yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay', 'please',
            'go ahead', 'tell me', 'yes please', 'absolutely', 'definitely',
            'of course', 'why not', 'sounds good', 'i would', "i'd like",
            'interested', 'curious'
        ];
        const msg = message.toLowerCase().trim();
        return affirmatives.some(a => msg.includes(a)) || msg.length < 10;
    }

    getTopicResponse(topic) {
        const info = this.bhavyInfo;

        switch(topic) {
            case 'wijungle':
                this.lastTopic = 'skills';
                return `At **WiJungle** (Jul 2023 - Apr 2025), Bhavy was an SDE building enterprise security solutions:\n\n**Key Projects:**\n\n**1. DDoS Protection System** (Go)\n- 35% faster attack detection\n- 60% reduction in downtime\n\n**2. Web Application Firewall** (Go + ModSecurity)\n- Protected 50+ client websites\n- 25% fewer security breaches\n\n**3. Anti-APT System**\n- 65% reduction in advanced threats\n\n**4. ICAP Server**\n- Handles 100,000+ daily requests\n\n**5. GraphQL Parser** (C++)\n- 40% latency reduction\n\n**Leadership:** Team Lead (3 engineers), Product Owner for WAF (team of 7)\n\nWant to know about his technical skills?`;

            case 'clickpost':
                this.lastTopic = 'wijungle';
                return `At **Clickpost** (Sep 2025 - Present), Bhavy works as an SDE:\n\n**Key Projects:**\n\n**1. Store Master System**\n- Backend for 1000+ stores\n- Geolocation validation\n\n**2. Serviceability Dashboard**\n- RESTful APIs for delivery configs\n\n**3. Shipment Analytics Pipeline**\n- Kafka-based bulk processing\n\n**4. PLP Delivery Options API**\n- Real-time delivery estimates\n\nWant to know about his previous role at WiJungle?`;

            case 'skills':
                this.lastTopic = 'projects';
                return `Bhavy's technical skills:\n\n**Languages:** ${info.skills.languages.join(', ')}\n\n**Backend:** ${info.skills.backend.join(', ')}\n\n**Databases:** ${info.skills.databases.join(', ')}\n\n**Security:** ${info.skills.security.join(', ')}\n\n**Protocols:** ${info.skills.protocols.join(', ')}\n\nWant to see his key projects?`;

            case 'projects':
                this.lastTopic = 'contact';
                return `Notable projects Bhavy has built:\n\n**Security (WiJungle):**\n- DDoS Protection - 35% faster detection\n- WAF - Protected 50+ websites\n- ICAP Server - 100K+ daily requests\n\n**Logistics (Clickpost):**\n- Store Master - 1000+ stores\n- Analytics Pipeline - Kafka-based\n\nWant to get in touch with him?`;

            case 'contact':
                this.lastTopic = null;
                return `Here's how to reach Bhavy:\n\n**Email:** ${info.email}\n**Phone:** ${info.phone}\n**LinkedIn:** ${info.linkedin}\n**GitHub:** ${info.github}\n**Twitter:** ${info.twitter}\n\nOr use the **Contact form** below!`;

            case 'education':
                this.lastTopic = 'achievements';
                return `Bhavy graduated from **IIT Delhi** (2019-2023)\nB.Tech in Fiber Science & Nanotechnology\n\n**Highlights:**\n- Badminton Team Captain - State Gold Medal\n- Rendezvous Coordinator - Led team of 35\n- Academic Mentor\n\nWant to know about his achievements?`;

            case 'achievements':
                this.lastTopic = 'contact';
                return `Bhavy's achievements:\n\n**Professional:**\n- Team Lead at WiJungle (3 engineers)\n- Product Owner for WAF (team of 7)\n\n**Academic:**\n- National Science Olympiad - Rank 599 internationally\n- International Math Olympiad - Top 2.5%\n- IIT Delhi Badminton Captain - State Gold\n\nWant to get in touch?`;

            default:
                this.lastTopic = null;
                return `I can tell you about Bhavy's:\n\n- **Clickpost** (current role)\n- **WiJungle** (previous role)\n- **Skills** & expertise\n- **Projects** he's built\n- **Contact** info\n\nWhat interests you?`;
        }
    }
}

// Initialize chatbot
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new Chatbot();
});
