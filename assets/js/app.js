
(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

  // year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // dark mode toggle
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-bs-theme', saved);
  if (themeToggle) themeToggle.addEventListener('click', ()=>{
    const cur = root.getAttribute('data-bs-theme') || 'light';
    const next = cur === 'light' ? 'dark' : 'light';
    root.setAttribute('data-bs-theme', next);
    localStorage.setItem('theme', next);
  });

  // Load and render posts if grid exists
  const postsGrid = document.getElementById('postsGrid');
  if (postsGrid) {
    fetch('/content/posts.json').then(r=>r.json()).then(posts=>{
      const filter = window.ISLAND_FILTER;
      let list = filter ? posts.filter(p=>p.type===filter) : posts;
      const tagsBar = document.getElementById('tagsBar');
      renderTagFilters(list, tagsBar, (tag)=>{
        const base = filter ? posts.filter(p=>p.type===filter) : posts;
        const q = (document.getElementById('searchInput')?.value||'').toLowerCase().trim();
        let filtered = base;
        if (tag && tag !== '*') filtered = filtered.filter(p => (p.tags||[]).includes(tag));
        if (q) filtered = filtered.filter(p => (p.title + ' ' + (p.tags||[]).join(' ') + ' ' + (p.summary||'')).toLowerCase().includes(q));
        renderCards(filtered, postsGrid);
      });
      // Search
      const input = document.getElementById('searchInput');
      if (input) {
        input.addEventListener('input', ()=>{
          const q = input.value.toLowerCase().trim();
          const filtered = list.filter(p => (p.title + ' ' + (p.tags||[]).join(' ') + ' ' + (p.summary||'')).toLowerCase().includes(q));
          renderCards(filtered, postsGrid);
        });
      }
      renderCards(list, postsGrid);
      const featuredGrid = document.getElementById('featuredGrid');
      if (featuredGrid){ renderCards((posts.slice(0,3)), featuredGrid); }
    });
  }
})();

window.renderCards = function(posts, container){
  const html = posts.map(p => `
    <div class="col-12 col-sm-6 col-lg-4">
      <a class="text-decoration-none text-reset" href="/article.html?slug=${p.slug}" aria-label="${p.title}">
        <div class="card h-100 card-hover">
          ${p.thumbnail ? `<img src="${p.thumbnail}" class="card-img-top" alt="">` : ''}
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge text-bg-primary">${p.type}</span>
              <small class="text-muted">${new Date(p.date).toLocaleDateString()}</small>
            </div>
            <h3 class="h6 card-title mb-2">${p.title}</h3>
            <p class="card-text text-muted small">${p.summary || ''}</p>
            <div class="d-flex flex-wrap gap-1 mt-2">
              ${(p.tags||[]).map(t=>`<span class="badge rounded-pill text-bg-light">${t}</span>`).join('')}
            </div>
          </div>
        </div>
      </a>
    </div>
  `).join('');
  container.innerHTML = html || '<p class="text-muted">No posts yet.</p>';
};

// --- Tag filter support ---
function getAllTags(posts){
  const set = new Set();
  posts.forEach(p => (p.tags||[]).forEach(t => set.add(t)));
  return Array.from(set).sort();
}
function renderTagFilters(posts, container, onChange){
  if (!container) return;
  const tags = getAllTags(posts);
  if (tags.length === 0){ container.innerHTML = ''; return; }
  container.innerHTML = ['<span class="small text-muted me-1">Tags:</span>',
    '<span class="badge rounded-pill text-bg-secondary badge-filter me-1 mb-1" data-tag="*">All</span>',
    ...tags.map(t => `<span class="badge rounded-pill text-bg-light badge-filter me-1 mb-1" data-tag="${t}">${t}</span>`)
  ].join(' ');
  const chips = [...container.querySelectorAll('.badge-filter')];
  let current = '*';
  chips[0].classList.add('active');
  chips.forEach(c => c.addEventListener('click', ()=>{
    chips.forEach(x=>x.classList.remove('active'));
    c.classList.add('active');
    current = c.dataset.tag;
    onChange(current);
  }));
}
