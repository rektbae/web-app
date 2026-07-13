function wireModalClose(modal, closeBtn) {
  closeBtn.addEventListener('click', () => modal.close());
  // Close when the backdrop (the dialog element itself) is clicked.
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
}

// Netlify AJAX form submit; returns true on success.
async function submitNetlifyForm(form) {
  const error = form.querySelector('.waitlist-error');
  error.hidden = true;
  try {
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch {
    error.hidden = false;
    return false;
  }
}

// Waitlist modal
const waitlistModal = document.getElementById('waitlist-modal');
const waitlistForm = waitlistModal.querySelector('.waitlist-form');

document.getElementById('waitlist-open').addEventListener('click', () => waitlistModal.showModal());
wireModalClose(waitlistModal, document.getElementById('waitlist-close'));

waitlistForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (await submitNetlifyForm(waitlistForm)) {
    waitlistForm.hidden = true;
    waitlistModal.querySelector('.waitlist-title').hidden = true;
    waitlistModal.querySelector('.waitlist-copy').hidden = true;
    waitlistModal.querySelector('.waitlist-success').hidden = false;
  }
});

// Work-with-us form: stay on the page, confirm in a popup
const workForm = document.querySelector('.work-form');
const workSuccessModal = document.getElementById('work-success-modal');

wireModalClose(workSuccessModal, document.getElementById('work-success-close'));

workForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (await submitNetlifyForm(workForm)) {
    workForm.reset();
    workSuccessModal.showModal();
  }
});
