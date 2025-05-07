let currentUsername = '';

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUsername = username;
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('twoFactorForm').style.display = 'block';
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Giriş yapılırken bir hata oluştu');
    }
}

async function verifyTwoFactor() {
    const code = document.getElementById('twoFactorCode').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/verify-2fa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: currentUsername, token: code })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Doğrulama yapılırken bir hata oluştu');
    }
}

// Token kontrolü
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

// Sayfa yüklendiğinde token kontrolü yap
if (!window.location.href.includes('login.html')) {
    checkAuth();
} 