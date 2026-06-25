const API_BASE_URL = "https://backend-twze.vercel.app/api";
const DEFAULT_BLOG_IMAGE = "https://via.placeholder.com/400x200?text=Blog+Image";
const DEFAULT_PROJECT_IMAGE = "https://via.placeholder.com/400x200?text=Project+Image";

const state = {
    currentPage: "home",
    currentReplyCommentId: null
};

const dom = {
    navItems: Array.from(document.querySelectorAll(".nav-item")),
    sections: Array.from(document.querySelectorAll(".content-section")),
    pageTitle: document.getElementById("page-title"),
    blogCount: document.getElementById("blog-count"),
    projectCount: document.getElementById("project-count"),
    blogForm: document.getElementById("blog-form"),
    projectForm: document.getElementById("project-form"),
    blogSubmit: document.getElementById("blog-submit"),
    projectSubmit: document.getElementById("project-submit"),
    blogList: document.getElementById("blog-list"),
    projectList: document.getElementById("project-list"),
    blogImageFile: document.getElementById("blog-image-file"),
    projectImageFile: document.getElementById("project-image-file"),
    blogImageUrl: document.getElementById("blog-image-url"),
    projectImageUrl: document.getElementById("project-image-url"),
    previewBlogImg: document.getElementById("preview-blog-img"),
    previewProjectImg: document.getElementById("preview-project-img"),
    previewBlogTitle: document.getElementById("preview-blog-title"),
    previewBlogBody: document.getElementById("preview-blog-body"),
    previewBlogTags: document.getElementById("preview-blog-tags"),
    previewProjectName: document.getElementById("preview-project-name"),
    previewProjectDesc: document.getElementById("preview-project-desc"),
    previewProjectTech: document.getElementById("preview-project-tech"),
    commentCount: document.getElementById("comment-count"),
    commentsList: document.getElementById("comments-list"),
    refreshCommentsBtn: document.getElementById("refresh-comments-btn"),
    replyModal: document.getElementById("reply-modal"),
    modalOriginalMsg: document.getElementById("modal-original-msg"),
    replyText: document.getElementById("reply-text"),
    cancelReplyBtn: document.getElementById("cancel-reply-btn"),
    submitReplyBtn: document.getElementById("submit-reply-btn"),
    logoutBtn: document.getElementById("logout-btn"),
    adminName: document.getElementById("admin-display-name")
};

function toTags(value) {
    if (!value || !value.trim()) return [];
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function setBusy(button, busyText, normalText, busy) {
    button.disabled = busy;
    button.innerText = busy ? busyText : normalText;
}

function formatDate(dateValue) {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleDateString();
}

function resolveImageUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return "";
    const trimmed = rawUrl.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    if (trimmed.startsWith("/uploads/")) return `https://backend-twze.vercel.app${trimmed}`;
    if (trimmed.startsWith("uploads/")) return `https://backend-twze.vercel.app/${trimmed}`;
    return trimmed;
}

async function parseJsonSafe(response) {
    try {
        return await response.json();
    } catch (error) {
        return null;
    }
}

async function uploadImage(file) {
    if (!file) return "";
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData
    });

    const data = await parseJsonSafe(response);
    if (!response.ok || !data?.imageUrl) {
        const message = data?.message || `Image upload failed (${response.status})`;
        throw new Error(message);
    }

    return data.imageUrl;
}

function renderBlogTable(blogs) {
    if (!Array.isArray(blogs) || blogs.length === 0) {
        dom.blogList.innerHTML = `<tr><td colspan="4">No blogs found.</td></tr>`;
        return;
    }

    dom.blogList.innerHTML = blogs
        .map((blog) => {
            const safeTitle = blog?.title || "Untitled";
            const safeId = blog?._id || "";
            const imageUrl = resolveImageUrl(blog?.image);
            const imageCell = imageUrl
                ? `<img src="${imageUrl}" alt="${safeTitle}" style="width:56px;height:40px;object-fit:cover;border-radius:8px;border:1px solid #222;" onerror="this.closest('td').innerText='No image';">`
                : "No image";
            const blogUrl = `../blog-details.html?id=${safeId}`;
            return `
            <tr>
                <td>${imageCell}</td>
                <td>${safeTitle}</td>
                <td>${formatDate(blog?.createdAt)}</td>
                <td class="actions-cell">
                    <a href="${blogUrl}" target="_blank" class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
                        <i class="fas fa-eye"></i>
                    </a>
                    <button class="btn btn-danger" data-delete-blog="${safeId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        })
        .join("");
}

function renderProjectTable(projects) {
    if (!Array.isArray(projects) || projects.length === 0) {
        dom.projectList.innerHTML = `<tr><td colspan="4">No projects found.</td></tr>`;
        return;
    }

    dom.projectList.innerHTML = projects
        .map((project) => {
            const safeName = project?.name || "Untitled";
            const safeId = project?._id || "";
            const imageUrl = resolveImageUrl(project?.image);
            const imageCell = imageUrl
                ? `<img src="${imageUrl}" alt="${safeName}" style="width:56px;height:40px;object-fit:cover;border-radius:8px;border:1px solid #222;" onerror="this.closest('td').innerText='No image';">`
                : "No image";
            const liveLink = project?.liveLink
                ? `<a href="${project.liveLink}" target="_blank">Live</a>`
                : "";
            const gitLink = project?.githubLink
                ? `<a href="${project.githubLink}" target="_blank">Git</a>`
                : "";
            const links = [liveLink, gitLink].filter(Boolean).join(" | ") || "-";
            return `
            <tr>
                <td>${imageCell}</td>
                <td>${safeName}</td>
                <td>${links}</td>
                <td class="actions-cell">
                    <button class="btn btn-danger" data-delete-project="${safeId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        })
        .join("");
}

async function fetchBlogs() {
    try {
        const response = await fetch(`${API_BASE_URL}/blogs`);
        const data = await parseJsonSafe(response);
        if (!response.ok) throw new Error(data?.message || "Failed to load blogs");
        renderBlogTable(data || []);
        dom.blogCount.innerText = Array.isArray(data) ? data.length : 0;
    } catch (error) {
        dom.blogList.innerHTML = `<tr><td colspan="4">Failed to load blogs.</td></tr>`;
    }
}

async function fetchProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        const data = await parseJsonSafe(response);
        if (!response.ok) throw new Error(data?.message || "Failed to load projects");
        renderProjectTable(data || []);
        dom.projectCount.innerText = Array.isArray(data) ? data.length : 0;
    } catch (error) {
        dom.projectList.innerHTML = `<tr><td colspan="4">Failed to load projects.</td></tr>`;
    }
}

async function fetchStats() {
    await Promise.all([fetchBlogs(), fetchProjects(), fetchComments()]);
}

function renderCommentTable(comments) {
    if (!Array.isArray(comments) || comments.length === 0) {
        dom.commentsList.innerHTML = `<tr><td colspan="6">No comments found.</td></tr>`;
        return;
    }

    dom.commentsList.innerHTML = comments
        .map((comment) => {
            const safeName = comment?.name || "Unknown";
            const safeEmail = comment?.email || "";
            const safeMessage = comment?.message || "";
            const safeReply = comment?.reply || "";
            const safeBlogTitle = comment?.blogId?.title || "Unknown Blog";
            const safeId = comment?._id || "";
            const dateStr = formatDate(comment?.createdAt);
            
            return `
            <tr>
                <td>
                    <div style="font-weight:bold;">${safeName}</div>
                    <div style="font-size:0.8rem; color:#888;">${safeEmail}</div>
                </td>
                <td>${safeBlogTitle}</td>
                <td><div style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${safeMessage}">${safeMessage}</div></td>
                <td><div style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:${safeReply ? '#c44dff' : '#888'}" title="${safeReply}">${safeReply ? safeReply : 'No reply yet'}</div></td>
                <td>${dateStr}</td>
                <td class="actions-cell">
                    <button class="btn btn-primary" data-reply-comment="${safeId}" data-msg="${encodeURIComponent(safeMessage)}" data-reply="${encodeURIComponent(safeReply)}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
                        <i class="fas fa-reply"></i>
                    </button>
                    <button class="btn btn-danger" data-delete-comment="${safeId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        })
        .join("");
}

async function fetchComments() {
    try {
        const response = await fetch(`${API_BASE_URL}/comments`);
        const data = await parseJsonSafe(response);
        if (!response.ok) throw new Error(data?.message || "Failed to load comments");
        renderCommentTable(data || []);
        if (dom.commentCount) {
            dom.commentCount.innerText = Array.isArray(data) ? data.length : 0;
        }
    } catch (error) {
        if (dom.commentsList) {
            dom.commentsList.innerHTML = `<tr><td colspan="6">Failed to load comments.</td></tr>`;
        }
    }
}

function updateBlogPreview() {
    const title = document.getElementById("blog-title").value.trim() || "Your Blog Title Here";
    const content = document.getElementById("blog-content").value.trim() || "The content of your blog will appear here as you type...";
    const tags = toTags(document.getElementById("blog-tags").value);

    dom.previewBlogTitle.innerText = title;
    dom.previewBlogBody.innerText = content;
    dom.previewBlogTags.innerText = tags.length ? tags.map((tag) => `#${tag}`).join(" ") : "#cybersecurity";
}

function updateProjectPreview() {
    const name = document.getElementById("project-name").value.trim() || "Project Name";
    const description = document.getElementById("project-description").value.trim() || "Project description will show here...";
    const tech = toTags(document.getElementById("project-tech").value);

    dom.previewProjectName.innerText = name;
    dom.previewProjectDesc.innerText = description;
    dom.previewProjectTech.innerHTML = (tech.length ? tech : ["React", "Tailwind"])
        .map((item) => `<span>${item}</span>`)
        .join("");
}

function updateLocalImagePreview(fileInput, previewImg, defaultSrc) {
    const file = fileInput.files?.[0];
    if (!file) {
        previewImg.src = defaultSrc;
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        previewImg.src = event.target?.result || defaultSrc;
    };
    reader.readAsDataURL(file);
}

function switchPage(page) {
    state.currentPage = page;
    dom.navItems.forEach((item) => item.classList.toggle("active", item.dataset.page === page));
    dom.sections.forEach((section) => section.classList.toggle("active", section.id === `${page}-section`));

    const active = dom.navItems.find((item) => item.dataset.page === page);
    dom.pageTitle.innerText = active ? active.innerText.trim() : "Dashboard Overview";

    if (page === "blogs") fetchBlogs();
    if (page === "projects") fetchProjects();
    if (page === "comments") fetchComments();
    if (page === "home") fetchStats();
}

async function handleBlogSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    const title = document.getElementById("blog-title").value.trim();
    const content = document.getElementById("blog-content").value.trim();
    const tags = toTags(document.getElementById("blog-tags").value);

    if (!title || !content) {
        alert("Please fill blog title and content.");
        return;
    }

    setBusy(dom.blogSubmit, "Creating...", "Create Blog", true);

    try {
        let image = dom.blogImageUrl.value;
        const imageFile = dom.blogImageFile.files?.[0];
        if (imageFile) {
            image = await uploadImage(imageFile);
            dom.blogImageUrl.value = image;
        }

        const response = await fetch(`${API_BASE_URL}/blogs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, tags, image })
        });

        const data = await parseJsonSafe(response);
        if (!response.ok) throw new Error(data?.message || "Failed to create blog");

        dom.blogForm.reset();
        dom.blogImageUrl.value = "";
        dom.previewBlogImg.src = DEFAULT_BLOG_IMAGE;
        updateBlogPreview();
        await fetchBlogs();
        await fetchStats();
        alert("Blog created successfully.");
    } catch (error) {
        alert(error.message || "Failed to create blog.");
    } finally {
        setBusy(dom.blogSubmit, "Creating...", "Create Blog", false);
    }
}

async function handleProjectSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    const name = document.getElementById("project-name").value.trim();
    const description = document.getElementById("project-description").value.trim();
    const techStack = toTags(document.getElementById("project-tech").value);
    const liveLink = document.getElementById("project-live").value.trim();
    const githubLink = document.getElementById("project-github").value.trim();

    if (!name || !description) {
        alert("Please fill project name and description.");
        return;
    }

    setBusy(dom.projectSubmit, "Uploading...", "Upload Project", true);

    try {
        let image = dom.projectImageUrl.value;
        const imageFile = dom.projectImageFile.files?.[0];
        if (imageFile) {
            image = await uploadImage(imageFile);
            dom.projectImageUrl.value = image;
        }

        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description, techStack, liveLink, githubLink, image })
        });

        const data = await parseJsonSafe(response);
        if (!response.ok) throw new Error(data?.message || "Failed to create project");

        dom.projectForm.reset();
        dom.projectImageUrl.value = "";
        dom.previewProjectImg.src = DEFAULT_PROJECT_IMAGE;
        updateProjectPreview();
        await fetchProjects();
        await fetchStats();
        alert("Project uploaded successfully.");
    } catch (error) {
        alert(error.message || "Failed to upload project.");
    } finally {
        setBusy(dom.projectSubmit, "Uploading...", "Upload Project", false);
    }
}

async function deleteBlog(id) {
    if (!id) return;
    if (!window.confirm("Delete this blog?")) return;
    try {
        const response = await fetch(`${API_BASE_URL}/blogs/${id}`, { method: "DELETE" });
        const data = await parseJsonSafe(response);
        if (!response.ok) throw new Error(data?.message || "Failed to delete blog");
        await fetchBlogs();
        await fetchStats();
    } catch (error) {
        alert(error.message || "Failed to delete blog.");
    }
}

async function deleteProject(id) {
    if (!id) return;
    if (!window.confirm("Delete this project?")) return;
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`, { method: "DELETE" });
        const data = await parseJsonSafe(response);
        if (!response.ok) throw new Error(data?.message || "Failed to delete project");
        await fetchProjects();
        await fetchStats();
    } catch (error) {
        alert(error.message || "Failed to delete project.");
    }
}

async function deleteComment(id) {
    if (!id) return;
    if (!window.confirm("Delete this comment?")) return;
    try {
        const response = await fetch(`${API_BASE_URL}/comments/${id}`, { method: "DELETE" });
        const data = await parseJsonSafe(response);
        if (!response.ok) throw new Error(data?.message || "Failed to delete comment");
        await fetchComments();
        await fetchStats();
    } catch (error) {
        alert(error.message || "Failed to delete comment.");
    }
}

function openReplyModal(id, originalMsg, existingReply) {
    state.currentReplyCommentId = id;
    dom.modalOriginalMsg.innerText = decodeURIComponent(originalMsg);
    dom.replyText.value = decodeURIComponent(existingReply || "");
    dom.replyModal.style.display = "flex";
}

function closeReplyModal() {
    state.currentReplyCommentId = null;
    dom.replyModal.style.display = "none";
    dom.replyText.value = "";
}

async function submitReply() {
    const id = state.currentReplyCommentId;
    if (!id) return;
    
    const reply = dom.replyText.value.trim();
    setBusy(dom.submitReplyBtn, "Sending...", "Send Reply", true);

    try {
        const response = await fetch(`${API_BASE_URL}/comments/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply })
        });
        
        const data = await parseJsonSafe(response);
        if (!response.ok) throw new Error(data?.message || "Failed to post reply");
        
        closeReplyModal();
        await fetchComments();
    } catch (error) {
        alert(error.message || "Failed to post reply.");
    } finally {
        setBusy(dom.submitReplyBtn, "Sending...", "Send Reply", false);
    }
}

function bindEvents() {
    dom.navItems.forEach((item) => {
        item.addEventListener("click", (event) => {
            event.preventDefault();
            switchPage(item.dataset.page);
        });
    });

    ["blog-title", "blog-content", "blog-tags"].forEach((id) => {
        document.getElementById(id).addEventListener("input", updateBlogPreview);
    });
    ["project-name", "project-description", "project-tech"].forEach((id) => {
        document.getElementById(id).addEventListener("input", updateProjectPreview);
    });

    dom.blogImageFile.addEventListener("change", () => {
        dom.blogImageUrl.value = "";
        updateLocalImagePreview(dom.blogImageFile, dom.previewBlogImg, DEFAULT_BLOG_IMAGE);
    });

    dom.projectImageFile.addEventListener("change", () => {
        dom.projectImageUrl.value = "";
        updateLocalImagePreview(dom.projectImageFile, dom.previewProjectImg, DEFAULT_PROJECT_IMAGE);
    });

    dom.blogForm.addEventListener("submit", handleBlogSubmit);
    dom.projectForm.addEventListener("submit", handleProjectSubmit);
    dom.projectSubmit.addEventListener("click", handleProjectSubmit);

    dom.blogList.addEventListener("click", (event) => {
        const button = event.target.closest("[data-delete-blog]");
        if (button) deleteBlog(button.dataset.deleteBlog);
    });

    dom.projectList.addEventListener("click", (event) => {
        const button = event.target.closest("[data-delete-project]");
        if (button) deleteProject(button.dataset.deleteProject);
    });

    if (dom.commentsList) {
        dom.commentsList.addEventListener("click", (event) => {
            const deleteBtn = event.target.closest("[data-delete-comment]");
            if (deleteBtn) {
                deleteComment(deleteBtn.dataset.deleteComment);
                return;
            }
            
            const replyBtn = event.target.closest("[data-reply-comment]");
            if (replyBtn) {
                const { replyComment, msg, reply } = replyBtn.dataset;
                openReplyModal(replyComment, msg, reply);
            }
        });
    }

    if (dom.refreshCommentsBtn) {
        dom.refreshCommentsBtn.addEventListener("click", fetchComments);
    }
    
    if (dom.cancelReplyBtn) {
        dom.cancelReplyBtn.addEventListener("click", closeReplyModal);
    }
    
    if (dom.submitReplyBtn) {
        dom.submitReplyBtn.addEventListener("click", submitReply);
    }

    if (dom.logoutBtn) {
        dom.logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = 'login.html';
        });
    }
}

function init() {
    bindEvents();
    
    // Set Admin Name
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    if (user.username && dom.adminName) {
        dom.adminName.innerText = user.username.charAt(0).toUpperCase() + user.username.slice(1);
    }

    updateBlogPreview();
    updateProjectPreview();
    dom.previewBlogImg.src = DEFAULT_BLOG_IMAGE;
    dom.previewProjectImg.src = DEFAULT_PROJECT_IMAGE;
    switchPage("home");
}

window.addEventListener("DOMContentLoaded", init);
