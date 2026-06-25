// Blog Slider Logic
let currentSlide = 0;
let totalBlogs = 0;
let blogsData = [];

async function loadBlogs() {
    const blogGrid = document.getElementById('blogGrid');
    
    try {
        // Fetch blogs from backend API
        const response = await fetch('https://backend-twze.vercel.app/api/blogs');
        
        if (!response.ok) {
            throw new Error('Failed to fetch blogs');
        }
        
        blogsData = await response.json();
        totalBlogs = blogsData.length;
        
        if (totalBlogs === 0) {
            blogGrid.innerHTML = '<div class="blog-error">No blogs published yet</div>';
            return;
        }
        
        // Clear loading message
        blogGrid.innerHTML = '';
        
        // Create and append blog cards
        blogsData.forEach((blog) => {
            const blogCard = createBlogCard(blog);
            blogGrid.appendChild(blogCard);
        });

        // Initialize Slider
        initSlider();
        
    } catch (error) {
        console.error('Error loading blogs:', error);
        blogGrid.innerHTML = `<div class="blog-error">Error loading blogs. Please try again later.</div>`;
    }
}

function createBlogCard(blog) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    
    const date = new Date(blog.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
    
    const preview = blog.content.length > 150 
        ? blog.content.substring(0, 150) + '...' 
        : blog.content;
    
    let imageUrl = './Assets/1.jpg';
    if (blog.image) {
        imageUrl = blog.image.startsWith('http') ? blog.image : `https://backend-twze.vercel.app/${blog.image}`;
    }
    
    card.innerHTML = `
        <div class="blog-card-image">
            <img src="${imageUrl}" alt="${blog.title}" onerror="this.src='./Assets/1.jpg'">
            <span class="blog-card-date">${formattedDate}</span>
        </div>
        <div class="blog-card-content">
            <h3>${blog.title}</h3>
            <p>${preview}</p>
            <a href="#" class="blog-read-more" data-blog-id="${blog._id}">Read More →</a>
        </div>
    `;
    
    const readMoreBtn = card.querySelector('.blog-read-more');
    readMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToBlogDetail(blog._id);
    });
    
    return card;
}

function navigateToBlogDetail(blogId) {
    window.location.href = 'blog-details.html?id=' + blogId;
}

function initSlider() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const blogDots = document.getElementById('blogDots');
    const blogGrid = document.getElementById('blogGrid');

    if (!prevBtn || !nextBtn || !blogDots || !blogGrid) return;

    // Calculate how many slides we have
    // If we show 4 cards, and have 8 blogs, we can slide 4 times if we slide 1 by 1.
    // Or 2 times if we slide 4 by 4.
    // Let's slide 1 by 1 for better UX.
    
    const updateSlider = () => {
        const cardWidth = blogGrid.querySelector('.blog-card').offsetWidth;
        const gap = 30; // matches CSS gap
        const moveDistance = cardWidth + gap;
        
        blogGrid.style.transform = `translateX(-${currentSlide * moveDistance}px)`;
        
        // Update dots
        const dots = blogDots.querySelectorAll('.blog-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });

        // Disable/Enable buttons
        const cardsVisible = getVisibleCards();
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide >= totalBlogs - cardsVisible;
        
        prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
        nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
    };

    const getVisibleCards = () => {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 4;
    };

    // Create dots
    blogDots.innerHTML = '';
    const cardsVisible = getVisibleCards();
    const dotsCount = Math.max(0, totalBlogs - cardsVisible + 1);
    
    for (let i = 0; i < dotsCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'blog-dot';
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            currentSlide = i;
            updateSlider();
        });
        blogDots.appendChild(dot);
    }

    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlider();
        }
    });

    nextBtn.addEventListener('click', () => {
        const cardsVisible = getVisibleCards();
        if (currentSlide < totalBlogs - cardsVisible) {
            currentSlide++;
            updateSlider();
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        // Recalculate dots on resize
        const newCardsVisible = getVisibleCards();
        const newDotsCount = Math.max(0, totalBlogs - newCardsVisible + 1);
        
        if (currentSlide >= newDotsCount) {
            currentSlide = Math.max(0, newDotsCount - 1);
        }
        
        // Re-render dots
        blogDots.innerHTML = '';
        for (let i = 0; i < newDotsCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'blog-dot';
            if (i === currentSlide) dot.classList.add('active');
            dot.addEventListener('click', () => {
                currentSlide = i;
                updateSlider();
            });
            blogDots.appendChild(dot);
        }
        
        updateSlider();
    });

    updateSlider();
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBlogs);
} else {
    loadBlogs();
}
