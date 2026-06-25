const API_BASE_URL = "https://backend-twze.vercel.app/api";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000";

function resolveImageUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return DEFAULT_IMAGE;
    const trimmed = rawUrl.trim();
    if (!trimmed) return DEFAULT_IMAGE;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    if (trimmed.startsWith("/uploads/")) return `https://backend-twze.vercel.app${trimmed}`;
    if (trimmed.startsWith("uploads/")) return `https://backend-twze.vercel.app/${trimmed}`;
    return trimmed;
}

function escapeHtml(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatLongDate(value) {
    return new Date(value).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    }).toUpperCase();
}

function renderContent(content) {
    const paragraphs = String(content || "")
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);

    if (paragraphs.length === 0) {
        return "<p>No content available.</p>";
    }

    return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
}

function renderTags(tags) {
    const cloud = document.getElementById("blog-tags-cloud");
    const safeTags = Array.isArray(tags) ? tags.filter(Boolean) : [];
    if (safeTags.length === 0) {
        cloud.innerHTML = `<a href="#">security</a>`;
        return;
    }
    cloud.innerHTML = safeTags.map((tag) => `<a href="#">${escapeHtml(tag)}</a>`).join("");
}

function renderBlog(blog) {
    const title = blog?.title || "Blog Details";
    const image = resolveImageUrl(blog?.image);
    const tags = Array.isArray(blog?.tags) ? blog.tags : [];
    const primaryTag = tags[0] || "CYBER SECURITY";

    document.title = `${title} | Rumon`;
    document.getElementById("blog-main-title").innerText = title;
    document.getElementById("breadcrumb-current").innerText = title;
    document.getElementById("blog-date").innerText = formatLongDate(blog?.createdAt || Date.now());
    document.getElementById("blog-featured-img").src = image;
    document.getElementById("blog-featured-img").alt = title;
    document.getElementById("blog-category").innerHTML = `<i class="fas fa-folder"></i> ${escapeHtml(primaryTag.toUpperCase())}`;
    document.getElementById("blog-content-body").innerHTML = renderContent(blog?.content);
    renderTags(tags);
}

async function fetchJson(url) {
    const response = await fetch(url);
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.message || `Request failed (${response.status})`);
    }
    return data;
}

async function fetchBlogDetails(id) {
    const blog = await fetchJson(`${API_BASE_URL}/blogs/${id}`);
    renderBlog(blog);
}

async function fetchLatestBlog() {
    const blogs = await fetchJson(`${API_BASE_URL}/blogs`);
    if (!Array.isArray(blogs) || blogs.length === 0) {
        document.getElementById("blog-content-body").innerHTML = "<p>No blog posts found.</p>";
        return;
    }
    renderBlog(blogs[0]);
}

async function fetchRecentPosts() {
    try {
        const blogs = await fetchJson(`${API_BASE_URL}/blogs`);
        const recentList = document.getElementById("recent-posts-list");
        recentList.innerHTML = (blogs || []).slice(0, 4).map((blog) => `
            <div class="post-item">
                <img src="${resolveImageUrl(blog.image)}" alt="${escapeHtml(blog.title || "Blog post")}">
                <div class="post-info">
                    <h4><a href="?id=${blog._id}" style="color: white; text-decoration: none;">${escapeHtml(blog.title || "Untitled")}</a></h4>
                    <span><i class="far fa-calendar"></i> ${new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join("");
    } catch (err) {
        console.error("Error fetching recent posts:", err);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const blogId = params.get("id");

    try {
        if (blogId) {
            await fetchBlogDetails(blogId);
        } else {
            await fetchLatestBlog();
        }
    } catch (err) {
        document.getElementById("blog-content-body").innerHTML = `<p>${escapeHtml(err.message || "Failed to load blog.")}</p>`;
    }

    fetchRecentPosts();
});

document.querySelector(".comment-form").addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thank you for your comment! It will be reviewed by our team.");
    e.target.reset();
});
