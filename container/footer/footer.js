(function () {
    const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000/api'
        : 'https://backend-twze.vercel.app/api';

    const initNewsletter = () => {
        const subscribeForm = document.querySelector('.footer-subscribe');
        if (!subscribeForm) {
            setTimeout(initNewsletter, 150);
            return;
        }

        const emailInput = subscribeForm.querySelector('input[type="email"]');
        const submitBtn = subscribeForm.querySelector('button[type="submit"]');

        if (!emailInput || !submitBtn) {
            setTimeout(initNewsletter, 150);
            return;
        }

        subscribeForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            if (!email) {
                alert('Please enter a valid email address.');
                return;
            }

            submitBtn.disabled = true;
            emailInput.disabled = true;
            const originalIcon = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            try {
                const response = await fetch(`${API_BASE_URL}/contact/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Something went wrong.');
                }

                alert('✅ Successfully subscribed to newsletter!');
                emailInput.value = '';
            } catch (err) {
                console.error('Newsletter error:', err);
                alert('❌ ' + (err.message || 'Failed to subscribe. Make sure the backend server is running.'));
            } finally {
                submitBtn.disabled = false;
                emailInput.disabled = false;
                submitBtn.innerHTML = originalIcon;
            }
        });
    };

    initNewsletter();
})();
