const modal = document.getElementById('waitlist-modal');
const openBtn = document.getElementById('waitlist-open');
const closeBtn = document.getElementById('waitlist-close');
const form = modal.querySelector('.waitlist-form');
const success = modal.querySelector('.waitlist-success');
const error = modal.querySelector('.waitlist-error');

openBtn.addEventListener('click', () => modal.showModal());
closeBtn.addEventListener('click', () => modal.close());

// Close when the backdrop (the dialog element itself) is clicked.
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.close();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  error.hidden = true;
  try {
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    form.hidden = true;
    modal.querySelector('.waitlist-title').hidden = true;
    modal.querySelector('.waitlist-copy').hidden = true;
    success.hidden = false;
  } catch {
    error.hidden = false;
  }
});
