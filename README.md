# Ishant Sharma — Personal Portfolio

A modern, responsive portfolio website built with a custom design system, interactive project gallery, client testimonials, and a fully functional Node.js contact form handler with an administrative messages dashboard.

## Features

- **Personal Hero & Bio**: Clean profile area introducing skills, interests, and background.
- **Project Showcase**: Interactive grid showcasing 4 key software engineering projects with details, categories, and technology tags.
- **Contact Form**: Validation-ready AJAX contact form linked to the backend server.
- **Admin Inquiries Dashboard**: Secure admin area located at `/admin.html` to search, view, and delete received messages.
- **Responsive Web Design**: Mobile-first design principles matching desktop and handheld screen dimensions.

## Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom design variables, smooth transitions), JavaScript (AJAX, DOM controller)
- **Backend**: Node.js, Express.js
- **Database**: File-based local JSON data storage

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Express server:
   ```bash
   node server.js
   ```
3. Open `http://localhost:3000` in your web browser or visit https://portfolio-six-phi-l9b7u1ng8d.vercel.app/.
4. Access the message panel at `http://localhost:3000/admin.html` .
