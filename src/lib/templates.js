export const STARTER_HTML = `<header class="site-header">
  <a class="brand" href="#">YOUR BRAND</a>
  <nav aria-label="Main navigation">
    <a href="#about">About</a>
    <a href="#features">Features</a>
    <a href="#contact">Contact</a>
  </nav>
</header>
<main>
  <section class="hero">
    <p class="eyebrow">A NEW WEBSITE STARTS HERE</p>
    <h1>Build your next<br /><span>big idea.</span></h1>
    <p class="hero-copy">A clean, modern starting point for your personal website, portfolio, or small business.</p>
    <a class="button" href="#about">Discover more <span aria-hidden="true">↗</span></a>
  </section>
  <section class="content-section" id="about">
    <p class="eyebrow">ABOUT THIS WEBSITE</p>
    <h2>Make your online presence count.</h2>
    <p>Replace this text with your story, your work, or the services you offer. You can edit every element visually or directly in the code editor.</p>
  </section>
  <section class="feature-grid" id="features">
    <article class="feature-card"><span>01</span><h3>Design</h3><p>Create a look that reflects your ideas and identity.</p></article>
    <article class="feature-card"><span>02</span><h3>Build</h3><p>Arrange content and customize your pages with ease.</p></article>
    <article class="feature-card"><span>03</span><h3>Grow</h3><p>Make your website a home for your next opportunity.</p></article>
  </section>
</main>
<footer id="contact"><div><strong>YOUR BRAND</strong><p>Made with Apokolips Website Builder.</p></div><a href="mailto:hello@example.com">Get in touch ↗</a></footer>`;

export const STARTER_CSS = `:root { font-family: Inter, Arial, sans-serif; color: #edf4ff; background: #081321; }
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: #081321; }
a { color: inherit; text-decoration: none; }
.site-header { min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 0 8%; border-bottom: 1px solid rgba(180,205,240,.12); }
.brand { font-weight: 800; letter-spacing: .12em; }
nav { display: flex; gap: 28px; color: #a9bbd3; font-size: 13px; }
nav a:hover, footer a:hover { color: #81bdff; }
.hero { min-height: 590px; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 90px 13%; background: radial-gradient(ellipse at 78% 45%, rgba(33,119,217,.22), transparent 42%); }
.eyebrow { color: #79b9ff; font-size: 11px; font-weight: 800; letter-spacing: .2em; }
.hero h1 { margin: 16px 0; font-size: clamp(48px, 8vw, 92px); line-height: .98; letter-spacing: -.06em; }
.hero h1 span { color: #72b5ff; }
.hero-copy { max-width: 490px; color: #9bacbf; font-size: 17px; line-height: 1.8; }
.button { display: inline-flex; gap: 24px; align-items: center; margin-top: 22px; padding: 14px 19px; border: 1px solid #428fe0; border-radius: 8px; background: #1766b7; font-size: 13px; font-weight: 700; }
.content-section { max-width: 900px; margin: auto; padding: 100px 28px 70px; }
.content-section h2 { max-width: 650px; margin: 13px 0; font-size: clamp(30px, 5vw, 52px); letter-spacing: -.04em; }
.content-section p:last-child { max-width: 670px; color: #9bacbf; line-height: 1.9; }
.feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 20px 8% 100px; }
.feature-card { padding: 28px; border: 1px solid rgba(180,205,240,.14); border-radius: 13px; background: #0d1c2e; }
.feature-card span { color: #72b5ff; font-size: 12px; }
.feature-card h3 { margin: 20px 0 8px; }
.feature-card p { color: #9bacbf; line-height: 1.7; font-size: 13px; }
footer { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 34px 8%; border-top: 1px solid rgba(180,205,240,.12); color: #a9bbd3; }
footer p { margin-bottom: 0; color: #71849e; font-size: 12px; }
footer a { font-size: 13px; }
@media (max-width: 700px) { .site-header { padding: 20px 6%; align-items: flex-start; flex-direction: column; } nav { gap: 17px; flex-wrap: wrap; } .hero { min-height: 480px; padding: 65px 8%; } .feature-grid { grid-template-columns: 1fr; padding: 20px 6% 70px; } footer { align-items: flex-start; flex-direction: column; } }`;

export const STARTER_JS = `document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});`;
