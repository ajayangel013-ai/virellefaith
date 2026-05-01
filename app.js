// ===========================
// VIRELLEFAITH — app.js
// ===========================

const DATA_URL = 'posts.json';
let allPosts = [];

// ===========================
// NAV SCROLL + HAMBURGER
// ===========================
const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// Close mobile nav on link click
if (navLinks) {
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ===========================
// FETCH DATA
// ===========================
async function fetchPosts() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    return data.posts;
  } catch (e) {
    console.error('Could not load posts:', e);
    return [];
  }
}

// ===========================
// HOMEPAGE
// ===========================
async function initHome() {
  allPosts = await fetchPosts();
  const featured = allPosts.find(p => p.featured);
  const rest = allPosts.filter(p => !p.featured);

  renderFeatured(featured);
  renderGrid(rest);
  initFilters();
  initScrollReveal();
}

function renderFeatured(post) {
  const el = document.getElementById('featuredPost');
  if (!el || !post) return;

  el.innerHTML = `
    <div class="featured-img">
      <img src="${post.image}" alt="${post.title}" loading="lazy" />
      <span class="featured-cat">${post.category}</span>
    </div>
    <div class="featured-body">
      <div class="featured-meta">
        <span>${post.date}</span>
        <span>${post.readTime}</span>
      </div>
      <h2 class="featured-title">${post.title}</h2>
      <p class="featured-subtitle">${post.subtitle}</p>
      <a href="post.html?slug=${post.slug}" class="read-more">Read post</a>
    </div>
  `;

  el.style.cursor = 'pointer';
  el.addEventListener('click', (e) => {
    if (!e.target.closest('.read-more')) {
      window.location.href = `post.html?slug=${post.slug}`;
    }
  });
}

function renderGrid(posts, filter = 'all') {
  const grid = document.getElementById('postsGrid');
  if (!grid) return;

  const filtered = filter === 'all' ? posts : posts.filter(p => p.category === filter);

  grid.innerHTML = filtered.length ? filtered.map((p, i) => postCardHTML(p, i)).join('') : `
    <div class="no-posts">
      <p style="color:var(--text-muted);font-style:italic;">No posts in this category yet.</p>
    </div>
  `;

  // Attach click
  grid.querySelectorAll('.post-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = card.dataset.href;
    });
  });

  initScrollReveal();
}

function postCardHTML(post, index) {
  return `
    <article class="post-card fade-in" data-href="post.html?slug=${post.slug}" data-category="${post.category}" style="animation-delay:${index * 0.08}s">
      <div class="post-card-img">
        <img src="${post.image}" alt="${post.title}" loading="lazy" />
        <span class="post-card-cat">${post.category}</span>
      </div>
      <div class="post-card-body">
        <div class="post-card-meta">
          <span>${post.date}</span>
          <span>${post.readTime}</span>
        </div>
        <h3 class="post-card-title">${post.title}</h3>
        <p class="post-card-excerpt">${post.excerpt}</p>
        <div class="post-card-footer">
          <div class="post-card-tags">
            ${post.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    </article>
  `;
}

// ===========================
// FILTER
// ===========================
function initFilters() {
  const btns = document.querySelectorAll('.filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const rest = allPosts.filter(p => !p.featured);
      renderGrid(rest, filter);
    });
  });
}

// ===========================
// SCROLL REVEAL
// ===========================
function initScrollReveal() {
  const items = document.querySelectorAll('.fade-in:not(.visible)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  items.forEach(el => observer.observe(el));
}

// ===========================
// SINGLE POST PAGE
// ===========================
async function initPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  allPosts = await fetchPosts();
  const post = allPosts.find(p => p.slug === slug);

  if (!post) {
    document.getElementById('postMain').innerHTML = `
      <div class="post-article" style="text-align:center;padding-top:100px;">
        <p style="font-family:var(--ff-display);font-size:1.5rem;color:var(--text-muted);">Post not found.</p>
        <a href="index.html" style="display:inline-block;margin-top:24px;color:var(--gold);">← Back to home</a>
      </div>
    `;
    return;
  }

  document.title = `${post.title} — Virellefaith`;
  renderPost(post);
  renderMorePosts(post.slug);
  initScrollReveal();
}

function renderPost(post) {
  const main = document.getElementById('postMain');
  if (!main) return;

  const contentHTML = post.content.map(block => {
    if (block.type === 'paragraph') return `<p>${block.text}</p>`;
    if (block.type === 'heading') return `<h2>${block.text}</h2>`;
    if (block.type === 'quote') return `
      <div class="post-blockquote">
        <p class="bq-text">"${block.text}"</p>
        <span class="bq-ref">${block.reference}</span>
      </div>
    `;
    return '';
  }).join('');

  main.innerHTML = `
    <a href="index.html" class="back-link">← All posts</a>
    <div class="post-hero">
      <img class="post-hero-img" src="${post.image}" alt="${post.title}" />
      <div class="post-hero-overlay"></div>
      <div class="post-hero-content">
        <span class="post-hero-cat">${post.category}</span>
        <h1 class="post-hero-title">${post.title}</h1>
        <p class="post-hero-subtitle">${post.subtitle}</p>
        <div class="post-hero-meta">
          <span>${post.date}</span>
          <span>${post.readTime}</span>
        </div>
      </div>
    </div>
    <article class="post-article">
      ${contentHTML}
      <div class="post-tags">
        ${post.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </article>
  `;
}

function renderMorePosts(currentSlug) {
  const grid = document.getElementById('morePosts');
  if (!grid) return;

  const others = allPosts.filter(p => p.slug !== currentSlug).slice(0, 3);
  grid.innerHTML = others.map((p, i) => postCardHTML(p, i)).join('');

  grid.querySelectorAll('.post-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = card.dataset.href;
    });
  });
}

// ===========================
// INIT
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('post-page')) {
    initPost();
  } else {
    initHome();
  }
});
