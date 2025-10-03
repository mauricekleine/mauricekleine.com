<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maurice Kleine</title>
    <meta name="description" content="Indie dev on a 6‑month runway. Building products like Mockly, Hackadam, Daystack and more.">
    <meta name="theme-color" content="#f5f5f5">
    <meta name="robots" content="index,follow">
    <meta name="color-scheme" content="light">
    <link rel="canonical" href="https://mauricekleine.com/">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Maurice Kleine">
    <meta property="og:description" content="Indie dev on a 6‑month runway. Projects, links and socials.">
    <meta property="og:image" content="/maurice.png">
    <meta property="og:image:alt" content="Portrait of Maurice Kleine">
    <meta property="og:url" content="https://mauricekleine.com/">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Maurice Kleine">
    <meta name="twitter:description" content="Indie dev on a 6‑month runway. Projects, links and socials.">
    <meta name="twitter:image" content="/maurice.png">

    <!-- Icons & preloads -->
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="apple-touch-icon" href="/maurice.png">
    <link rel="preload" as="image" href="/maurice.png" fetchpriority="high">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Grandstander:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
      /* 1. Use a more-intuitive box-sizing model */
      *, *::before, *::after {
        box-sizing: border-box;
      }
      /* 2. Remove default margin */
      * {
        margin: 0;
      }
      /* 3. Enable keyword animations */
      @media (prefers-reduced-motion: no-preference) {
        html {
          interpolate-size: allow-keywords;
        }
      }
      body {
        /* 4. Add accessible line-height */
        line-height: 1.5;
        /* 5. Improve text rendering */
        -webkit-font-smoothing: antialiased;
      }
      /* 6. Improve media defaults */
      img, picture, video, canvas, svg {
        display: block;
        max-width: 100%;
      }
      /* 7. Inherit fonts for form controls */
      input, button, textarea, select {
        font: inherit;
      }
      /* 8. Avoid text overflows */
      p, h1, h2, h3, h4, h5, h6 {
        overflow-wrap: break-word;
      }
      /* 9. Improve line wrapping */
      p {
        text-wrap: pretty;
      }
      h1, h2, h3, h4, h5, h6 {
        text-wrap: balance;
      }
      /*
        10. Create a root stacking context
      */
      #root, #__next {
        isolation: isolate;
      }

        :root {
            --bg: #f5f5f5;
            --ink: #000;
            --card: #fff;
            --shadow: #000;
            --border: 6px;
            --radius: 20px;
            --elev: 6px;
            --ease: cubic-bezier(.2,.8,.2,1);
            --candy: linear-gradient(90deg, #ff3c3c, #ff7a1a, #ffd166, #06d6a0, #4cc9f0, #a96dff, #ff3c3c);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Grandstander', cursive;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            font-synthesis: none;
            background: radial-gradient(1200px 800px at 50% -10%, #ffffff 0%, #f3f3f3 45%, #eeeeee 100%);
            background-image: radial-gradient(1200px 800px at 50% -10%, #ffffff 0%, #f3f3f3 45%, #eeeeee 100%), url('noise.svg');
            background-blend-mode: normal, multiply;
            background-attachment: fixed, scroll;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            color: var(--ink);
        }

        .container {
            max-width: 900px;
            width: 100%;
            text-align: center;
            animation: intro 520ms var(--ease) both;
        }

        .profile-photo {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            border: var(--border) solid var(--ink);
            margin: 0 auto 40px;
            display: block;
            object-fit: cover;
            box-shadow: var(--elev) var(--elev) 0 0 var(--shadow);
            transition: transform 180ms var(--ease), box-shadow 180ms var(--ease);
        }

        h1 {
            font-size: 4.5rem;
            font-weight: 900;
            margin-bottom: 20px;
            letter-spacing: -0.03em;
            text-transform: uppercase;
            line-height: 0.9;
        }

        .hero {
            position: relative;
            display: inline-block;
            padding: 8px 12px 0;
            margin-bottom: 20px;
        }

        /* WordArt title (permanent selected look) */
        .wordart {
            display: inline;
            color: #fff;
            padding-top: 6px;
            padding-right: 8px;
            padding-left: 8px;
            background: #000;
            border-radius: 10px;
            -webkit-text-stroke: 0;
            text-shadow: none;
            box-decoration-break: clone;
            -webkit-box-decoration-break: clone;
        }

        .tagline {
            font-size: 1.5rem;
            margin-bottom: 60px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.02em;
            opacity: 0.85;
        }

        /* Doodles / sparkles */
        .hero::before,
        .hero::after {
            content: '✦';
            position: absolute;
            font-size: 28px;
            line-height: 1;
            color: #ff7a1a;
            filter: drop-shadow(2px 2px 0 #000);
            animation: floaty 4.8s var(--ease) infinite;
        }
        .hero::before {
            top: -16px;
            left: -22px;
            color: #4cc9f0;
            transform: rotate(-12deg);
            animation-delay: 200ms;
        }
        .hero::after {
            right: -22px;
            top: -10px;
            color: #ffd166;
            transform: rotate(14deg);
            animation-delay: 600ms;
        }

        .projects-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 60px;
        }

        .project-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--card);
            border: var(--border) solid var(--ink);
            border-radius: var(--radius);
            padding: 32px 16px;
            text-decoration: none;
            color: var(--ink);
            transition: transform 140ms var(--ease), color 140ms var(--ease), background 140ms var(--ease), box-shadow 140ms var(--ease);
            min-height: 200px;
            box-shadow: var(--elev) var(--elev) 0 0 var(--shadow);
            position: relative;
            overflow: visible;
        }

        .project-link::before {
            content: '';
            position: absolute;
            inset: -10px;
            border-radius: calc(var(--radius) + 12px);
            background: conic-gradient(from 0deg, #ff3c3c, #ff7a1a, #ffd166, #41ead4, #7b61ff, #ff3c3c);
            transform: rotate(-2deg);
            transition: transform 400ms var(--ease), filter 400ms var(--ease), opacity 400ms var(--ease);
            filter: saturate(1.1) blur(0px);
            opacity: 0.9;
            z-index: -1;
        }
        .project-link:hover::before {
            transform: rotate(2deg) scale(1.02);
            filter: saturate(1.4) blur(8px);
            opacity: 1;
        }

        .project-emoji {
            font-size: 3rem;
            margin-bottom: 15px;
            display: block;
            transition: transform 160ms var(--ease);
        }

        .project-name {
            font-size: 2rem;
            font-weight: 900;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .project-description {
            font-size: 1.2rem;
            font-weight: 400;
            line-height: 1.4;
        }

        .project-link:hover .project-emoji {
            transform: translateY(-4px) scale(1.06);
        }

        .project-link:active {
            transform: translate(4px, 4px);
        }

        .social-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }

        .social-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 15px 30px;
            background: var(--card);
            border: var(--border) solid var(--ink);
            border-radius: 15px;
            text-decoration: none;
            color: var(--ink);
            font-weight: 900;
            text-transform: uppercase;
            font-size: 1.5rem;
            letter-spacing: 0.05em;
            transition: transform 140ms var(--ease), color 140ms var(--ease), background 140ms var(--ease), box-shadow 140ms var(--ease);
            box-shadow: 4px 4px 0 0 var(--shadow);
            position: relative;
            overflow: visible;
        }

        .social-link::before {
            content: '';
            position: absolute;
            inset: -10px;
            border-radius: 22px;
            background: conic-gradient(from 0deg, #ff3c3c, #ff7a1a, #ffd166, #41ead4, #7b61ff, #ff3c3c);
            z-index: -1;
            transform: rotate(-2deg);
            transition: transform 400ms var(--ease), filter 400ms var(--ease), opacity 400ms var(--ease);
            filter: saturate(1.1) blur(0px);
            opacity: 0.9;
        }
        .social-link:hover::before {
            transform: rotate(2deg) scale(1.03);
            filter: saturate(1.4) blur(8px);
            opacity: 1;

        }

        .social-link svg {
            width: 20px;
            height: 20px;
            fill: currentColor;
            margin-right: 10px;
        }

        /* Focus styles for accessibility */
        a:focus-visible {
            outline: 3px dashed #1a1a1a;
            outline-offset: 4px;
        }

        /* Selection */
        ::selection {
            background: #111;
            color: #fff;
        }

        /* Prefer reduced motion */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation: none !important;
                transition: none !important;
            }
        }

        @keyframes intro {
            from { opacity: 0; transform: translateY(10px) scale(0.995); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes hue-shift {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
        }

        @keyframes floaty {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-6px) rotate(8deg); }
        }

        @media (max-width: 768px) {
            h1 {
                font-size: 2.5rem;
            }

            .tagline {
                font-size: 1rem;
            }

            .projects-grid {
                grid-template-columns: 1fr;
            }

            .profile-photo {
                width: 120px;
                height: 120px;
            }

            .social-link {
                padding: 12px 20px;
                font-size: 0.9rem;
            }
        }
    </style>
</head>
<body>
    <a href="#projects" style="position:absolute;left:-1000px;top:auto;width:1px;height:1px;overflow:hidden;">Skip to projects</a>
    <main class="container" role="main">
        <img src="./maurice.png" alt="Maurice Kleine" class="profile-photo">
        
        <div class="hero">
            <h1 class="wordart">MAURICE KLEINE</h1>
        </div>
        <p class="tagline">Indie dev on a 6-month runway</p>

        <section id="projects" aria-label="Projects" class="projects-grid">
            <a href="https://onesixtyeight.life" target="_blank" rel="noopener noreferrer" class="project-link">
                <span class="project-emoji">🍄</span>
                <div class="project-name">ONESIXTYEIGHT</div>
                <div class="project-description">Coffee alternative</div>
            </a>

            <a href="https://getmockly.com" target="_blank" rel="noopener noreferrer" class="project-link">
                <span class="project-emoji">💬</span>
                <div class="project-name">Mockly</div>
                <div class="project-description">Mock chat apps</div>
            </a>

            <a href="https://hackadam.nl" target="_blank" rel="noopener noreferrer" class="project-link">
                <span class="project-emoji">🌍</span>
                <div class="project-name">Hackadam</div>
                <div class="project-description">Hacker meetup in AMS</div>
            </a>

            <a href="https://www.daystack.co/" target="_blank" rel="noopener noreferrer" class="project-link">
                <span class="project-emoji">📅</span>
                <div class="project-name">Daystack</div>
                <div class="project-description">Track habits & supplements</div>
            </a>
        </section>

        <nav class="social-links" aria-label="Social links">
            <a href="https://www.linkedin.com/in/mauricekleine/" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn</span>
            </a>

            <a href="https://github.com/mauricekleine/" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="GitHub">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                <span>GitHub</span>
            </a>

            <a href="https://x.com/maurice_kleine" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Twitter/X">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>Twitter</span>
            </a>
        </nav>
    </main>
</body>
</html>
