/* Kingdom in the Sky - interactions */
document.addEventListener('DOMContentLoaded', () => {
  initBackToTop();
  initDestinations();
  initGallery();
  initForms();
});

/* ---------- Back to top ---------- */
function initBackToTop() {
  const btn = document.getElementById('toTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.style.display = window.scrollY > 500 ? 'block' : 'none';
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------- Destinations: region filter + pagination ---------- */
function initDestinations() {
  const grid = document.getElementById('destGrid');
  if (!grid) return;
  const cols = [...grid.querySelectorAll('.dest-col')];
  const pager = document.getElementById('destPager');
  const count = document.getElementById('destCount');
  const filters = document.querySelectorAll('[data-region]');
  const perPage = 4;
  let region = 'all', page = 1;

  function render() {
    const matches = cols.filter(c => region === 'all' || c.dataset.region === region);
    const pages = Math.max(1, Math.ceil(matches.length / perPage));
    page = Math.min(page, pages);
    cols.forEach(c => c.classList.add('d-none'));
    matches.slice((page - 1) * perPage, page * perPage).forEach(c => c.classList.remove('d-none'));
    count.textContent = `Showing ${matches.length} destination${matches.length === 1 ? '' : 's'}`;

    pager.innerHTML = '';
    const add = (label, target, disabled, active) => {
      const li = document.createElement('li');
      li.className = 'page-item' + (disabled ? ' disabled' : '') + (active ? ' active' : '');
      const a = document.createElement('a');
      a.className = 'page-link'; a.href = '#'; a.textContent = label;
      if (active) a.setAttribute('aria-current', 'page');
      a.addEventListener('click', e => { e.preventDefault(); if (!disabled) { page = target; render(); } });
      li.appendChild(a); pager.appendChild(li);
    };
    add('Previous', page - 1, page === 1, false);
    for (let i = 1; i <= pages; i++) add(String(i), i, false, i === page);
    add('Next', page + 1, page === pages, false);
  }

  filters.forEach(f => f.addEventListener('click', e => {
    e.preventDefault();
    region = f.dataset.region; page = 1;
    document.getElementById('regionLabel').textContent = f.textContent;
    render();
  }));
  render();
}

/* ---------- Gallery: filter, lightbox, prev/next, thumbnails ---------- */
function initGallery() {
  const items = [...document.querySelectorAll('.g-item')];
  const modalEl = document.getElementById('lightbox');
  if (!items.length || !modalEl) return;
  const modal = new bootstrap.Modal(modalEl);
  const img = document.getElementById('lbImg');
  const cap = document.getElementById('lbCaption');
  const thumbs = document.getElementById('lbThumbs');
  let visible = items, index = 0;

  function show(i) {
    index = (i + visible.length) % visible.length;
    const it = visible[index];
    img.src = it.dataset.src;
    img.alt = it.querySelector('img').alt;
    cap.textContent = `${it.dataset.caption} (${index + 1} of ${visible.length})`;
    thumbs.querySelectorAll('img').forEach((t, n) => t.classList.toggle('on', n === index));
  }
  function open(i) {
    thumbs.innerHTML = '';
    visible.forEach((it, n) => {
      const t = document.createElement('img');
      t.src = it.dataset.src; t.alt = 'Preview ' + (n + 1);
      t.addEventListener('click', () => show(n));
      thumbs.appendChild(t);
    });
    show(i); modal.show();
  }
  items.forEach(it => it.addEventListener('click', () => {
    visible = items.filter(x => !x.closest('.g-col').classList.contains('is-hidden'));
    open(visible.indexOf(it));
  }));
  document.getElementById('lbPrev').addEventListener('click', () => show(index - 1));
  document.getElementById('lbNext').addEventListener('click', () => show(index + 1));
  modalEl.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  document.querySelectorAll('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    items.forEach(it => it.closest('.g-col').classList.toggle('is-hidden', f !== 'all' && !it.dataset.cat.split(' ').includes(f)));
  }));
}

/* ---------- Forms: validation + messages ---------- */
const rules = {
  name: v => /^[A-Za-z][A-Za-z '\-.]{1,}$/.test(v.trim()) && v.trim().split(/\s+/).length >= 2
    ? '' : 'Enter your full name (first and last name, letters only).',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email, e.g. name@example.com.',
  phone: v => /^(\+266[\s-]?|00266[\s-]?)?[2-6]\d{3}[\s-]?\d{4}$/.test(v.trim())
    ? '' : 'Enter a valid Lesotho number, e.g. +266 5888 1234 or 62345678.',
  password: v => v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v)
    ? '' : 'Use at least 8 characters with a letter and a number.',
  date: v => {
    if (!v) return 'Choose your arrival date.';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return new Date(v) >= today ? '' : 'Arrival date cannot be in the past.';
  },
  guests: v => Number(v) >= 1 && Number(v) <= 20 ? '' : 'Guests must be between 1 and 20.',
  required: v => v.trim() ? '' : 'This field is required.',
  select: v => v ? '' : 'Please choose an option.'
};

function setState(input, message) {
  const fb = input.closest('.mb-3, .col-12, .col-md-6, div')?.querySelector('.invalid-feedback');
  input.classList.toggle('is-invalid', !!message);
  input.classList.toggle('is-valid', !message);
  if (fb && message) fb.textContent = message;
  return !message;
}

function validateField(input, form) {
  const type = input.dataset.rule;
  if (!type) return true;
  let msg = rules[type] ? rules[type](input.value) : '';
  if (!msg && type === 'password' && input.id === 'regPass2') {
    msg = input.value === form.querySelector('#regPass').value ? '' : 'Passwords do not match.';
  }
  return setState(input, msg);
}

function initForms() {
  const min = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('arrival');
  if (dateInput) dateInput.min = min;

  document.querySelectorAll('form[data-validate]').forEach(form => {
    form.setAttribute('novalidate', '');
    const fields = [...form.querySelectorAll('[data-rule]')];
    fields.forEach(f => {
      f.addEventListener('blur', () => validateField(f, form));
      f.addEventListener('input', () => { if (f.classList.contains('is-invalid')) validateField(f, form); });
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = fields.map(f => validateField(f, form)).every(Boolean);
      const radios = form.querySelectorAll('input[type=radio]');
      if (radios.length) {
        const chosen = [...radios].some(r => r.checked);
        form.querySelector('.gender-error')?.classList.toggle('d-block', !chosen);
        ok = ok && chosen;
      }
      const terms = form.querySelector('input[type=checkbox][required]');
      if (terms && !terms.checked) { terms.classList.add('is-invalid'); ok = false; } else terms?.classList.remove('is-invalid');

      const box = form.querySelector('.form-result');
      if (ok) {
        const first = form.querySelector('[data-rule="name"]').value.trim().split(' ')[0];
        box.innerHTML = `<div class="alert alert-success" role="alert"><strong>Thank you, ${escapeHtml(first)}!</strong> ${form.dataset.success}</div>`;
        form.reset();
        form.querySelectorAll('.is-valid,.is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
      } else {
        box.innerHTML = '<div class="alert alert-danger" role="alert">Please fix the highlighted fields and try again.</div>';
        form.querySelector('.is-invalid')?.focus();
      }
    });
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
