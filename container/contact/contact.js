(function () {
    const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000/api'
        : 'https://backend-twze.vercel.app/api';

    // DOMContentLoaded already fired — script is injected dynamically after HTML is ready
    // Use polling to wait for the contact section to be available
    const initContact = () => {
        const contactSection = document.getElementById('contact');
        if (!contactSection) {
            setTimeout(initContact, 150);
            return;
        }

        const messageInput = contactSection.querySelector('.message-input');
        const sendBtn = contactSection.querySelector('.send-btn');

        if (!messageInput || !sendBtn) {
            setTimeout(initContact, 150);
            return;
        }

        const handleSend = async () => {
            const message = messageInput.value.trim();
            if (!message) {
                alert('Please enter a message.');
                return;
            }

            sendBtn.disabled = true;
            messageInput.disabled = true;
            const originalIcon = sendBtn.innerHTML;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            try {
                const response = await fetch(`${API_BASE_URL}/contact/message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Something went wrong.');
                }

                alert('✅ Message sent successfully!');
                messageInput.value = '';
            } catch (err) {
                console.error('Contact error:', err);
                alert('❌ ' + (err.message || 'Failed to send message. Make sure the backend server is running.'));
            } finally {
                sendBtn.disabled = false;
                messageInput.disabled = false;
                sendBtn.innerHTML = originalIcon;
            }
        };

        sendBtn.addEventListener('click', handleSend);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    };

    initContact();
})();
