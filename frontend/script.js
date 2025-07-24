const BASE_URL = 'http://localhost:5000/api'; 

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    if (res.ok) {
      alert('Registered! Please login.');
      window.location.href = 'login.html';
    } else {
      alert(data.message || 'Registration failed');
    }
  });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user._id);
      window.location.href = 'index.html';
    } else {
      alert(data.message || 'Login failed');
    }
  });
}
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = 'login.html';
  });
}
const postContainer = document.getElementById('postContainer');
if (postContainer) {
  const token = localStorage.getItem('token');

  async function fetchPosts() {
    try {
      const res = await fetch(`${BASE_URL}/posts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        postContainer.innerHTML = '';
        data.forEach(post => {
          const postElement = document.createElement('div');
          postElement.className = 'post-card';
          postElement.innerHTML = `
            <h4>@${post.username}</h4>
            <p>${post.content}</p>
            <div class="actions">
             <button class="like-btn" data-id="${post._id}">❤️ ${post.likes?.length || 0}</button>

              <button>💬 ${post.comments?.length || 0}</button>
            </div>
          `;
          postContainer.appendChild(postElement);

          const likeBtn = postElement.querySelector('.like-btn');
likeBtn.addEventListener('click', async () => {
  const postId = likeBtn.getAttribute('data-id');
  const res = await fetch(`${BASE_URL}/posts/${postId}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  const data = await res.json();
  if (res.ok) {
    likeBtn.textContent = `❤️ ${data.likesCount}`;
  }
});
        });
      } else {
        postContainer.innerHTML = '<p>Failed to load posts</p>';
      }
    } catch (err) {
      console.error('Error:', err);
      postContainer.innerHTML = '<p>Error fetching posts</p>';
    }
  }

  fetchPosts();
}
const profileInfo = document.getElementById('profileInfo');
const userPosts = document.getElementById('userPosts');

if (profileInfo && userPosts) {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  async function loadProfile() {
    try {
      const res = await fetch(`${BASE_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        const { username, bio, followers, following, profilePic } = data;
        profileInfo.innerHTML = `
          <img src="${profilePic || 'https://via.placeholder.com/100'}" alt="Profile Pic" class="profile-pic" />
          <h3>@${username}</h3>
          <p>${bio || 'No bio yet.'}</p>
          <div class="stats">
            <span>Followers: ${followers.length}</span>
            <span>Following: ${following.length}</span>
          </div>
        `;

        // Load user posts
        const postsRes = await fetch(`${BASE_URL}/posts/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const posts = await postsRes.json();
        userPosts.innerHTML = '';
        posts.forEach(post => {
          const postEl = document.createElement('div');
          postEl.className = 'post-card';
          postEl.innerHTML = `
            <p>${post.content}</p>
            <div class="actions">
              <button>❤️ ${post.likes?.length || 0}</button>
              <button>💬 ${post.comments?.length || 0}</button>
            </div>
          `;
          userPosts.appendChild(postEl);
        });
      } else {
        profileInfo.innerHTML = '<p>Unable to load profile</p>';
      }
    } catch (err) {
      console.error('Profile error:', err);
      profileInfo.innerHTML = '<p>Error loading profile</p>';
    }
  }

  loadProfile();
}
const postForm = document.getElementById('postForm');
const postContentInput = document.getElementById('postContent');

if (postForm) {
  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = postContentInput.value.trim();
    if (!content) return;

    try {
      const res = await fetch(`${BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });

      const newPost = await res.json();
      if (res.ok) {
        // Prepend post to the top
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
       postElement.innerHTML = `
  <h4>@${post.username}</h4>
  <p>${post.content}</p>
  <div class="actions">
    <button class="like-btn" data-id="${post._id}">❤️ ${post.likes?.length || 0}</button>
    <button>💬 ${post.comments?.length || 0}</button>
  </div>
`;

        postContainer.prepend(postElement);

// Add event listener to like button
const likeBtn = postElement.querySelector('.like-btn');
likeBtn.addEventListener('click', async () => {
  const postId = likeBtn.getAttribute('data-id');
  const res = await fetch(`${BASE_URL}/posts/${postId}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  const data = await res.json();
  if (res.ok) {
    likeBtn.textContent = `❤️ ${data.likesCount}`;
  }
});

        postContentInput.value = ''; // Clear input
      } else {
        alert(newPost.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Post error:', err);
    }
  });
}

async function loadNotifications() {
  const res = await fetch(`${BASE_URL}/users/notifications`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  const notifications = await res.json();

  const notificationArea = document.getElementById('notifications');
  notificationArea.innerHTML = '';

  notifications.forEach(n => {
    const msg =
      n.type === 'like'
        ? `@${n.fromUser.username} liked your post`
        : `@${n.fromUser.username} commented on your post`;

    const el = document.createElement('p');
    el.textContent = msg;
    notificationArea.appendChild(el);
  });
}

setTimeout(() => {
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const postId = btn.getAttribute('data-id');
      const res = await fetch(`${BASE_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        btn.textContent = `❤️ ${data.likesCount}`;
      }
    });
  });
}, 0);
