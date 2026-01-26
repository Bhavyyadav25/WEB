# Bhavy Yadav - Portfolio Website

A stunning, modern portfolio website with 3D animations, AI chatbot, and Go backend.

## Features

- **3D Particle Background** - Interactive Three.js scene with particles, geometric shapes, and mouse tracking
- **Smooth Animations** - GSAP-powered scroll animations, reveals, and micro-interactions
- **AI Chatbot** - Smart assistant with knowledge about your skills and experience
- **Dark Minimalist Theme** - Professional, modern design with gradient accents
- **Mobile Responsive** - Fully responsive design for all devices
- **Go Backend** - Contact form handling with email notifications
- **GitHub Integration** - Automatically fetches and displays your repositories

## Quick Start

### Frontend Only (Static)
Simply open `index.html` in your browser or serve with any static file server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:3000
```

### With Go Backend
```bash
cd backend

# Set environment variables (optional)
export PORT=8080
export SMTP_USER=your-email@gmail.com
export SMTP_PASS=your-app-password
export TO_EMAIL=yadavbhavy25@gmail.com
export GROQ_API_KEY=your-groq-api-key  # Optional, for AI chat

# Run the server
go run main.go
```

Visit `http://localhost:8080`

## Configuration

### AI Chatbot
The chatbot works in two modes:

1. **Local Mode** (Default) - Uses intelligent pre-programmed responses based on your resume
2. **AI Mode** - Connect to Groq API (free tier) for dynamic AI responses

To enable AI mode:
1. Get a free API key from [Groq](https://console.groq.com/)
2. Set the environment variable: `export GROQ_API_KEY=your-key`

### Email Notifications
To receive contact form submissions via email:

1. Use Gmail App Password (recommended):
   - Enable 2FA on your Google account
   - Generate an App Password at https://myaccount.google.com/apppasswords

2. Set environment variables:
   ```bash
   export SMTP_USER=your-email@gmail.com
   export SMTP_PASS=your-app-password
   export TO_EMAIL=destination@email.com
   ```

### Customization

#### Colors
Edit `css/style.css` - Look for the `:root` section:
```css
:root {
    --accent-primary: #6366f1;    /* Main accent color */
    --accent-secondary: #818cf8;  /* Secondary accent */
    --bg-primary: #0a0a0b;        /* Background color */
}
```

#### Content
Edit `index.html` to update:
- Personal information
- Skills and expertise
- Work experience
- Projects
- Contact details

#### Chatbot Knowledge
Edit `js/chatbot.js` - Update the `bhavyInfo` object with your information.

## Project Structure

```
WEB/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # All styles
├── js/
│   ├── three-scene.js  # 3D background
│   ├── animations.js   # GSAP animations
│   ├── chatbot.js      # AI chatbot
│   └── main.js         # Core functionality
├── backend/
│   ├── main.go         # Go server
│   └── go.mod          # Go module
└── README.md           # This file
```

## Technologies Used

- **Frontend**
  - HTML5, CSS3, JavaScript (ES6+)
  - Three.js - 3D graphics
  - GSAP + ScrollTrigger - Animations
  - Custom cursor effects
  - CSS Grid & Flexbox

- **Backend**
  - Go (Golang)
  - Standard library HTTP server
  - SMTP for email
  - Groq API integration

## Keyboard Shortcuts

- `Ctrl/Cmd + I` - Open Resume Analyzer modal
- `Escape` - Close chatbot/modals

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Tips

1. The Three.js scene automatically adjusts particle count based on device
2. Animations respect `prefers-reduced-motion` setting
3. Images use lazy loading

## Deployment

### Static Hosting (Vercel, Netlify, GitHub Pages)
Simply deploy the root folder. The site works without the backend.

### Full Stack (With Backend)
1. Deploy the Go backend to:
   - Railway
   - Render
   - Fly.io
   - Any VPS

2. Update the API URLs in `main.js` if needed

## License

MIT License - Feel free to use and modify for your own portfolio!

---

Built with passion by Bhavy Yadav | yadavbhavy25@gmail.com
