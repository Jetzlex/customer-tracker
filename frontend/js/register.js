async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Şifre kontrolü
    if (password !== confirmPassword) {
        alert('Şifreler eşleşmiyor!');
        return;
    }

    // Şifre uzunluğu kontrolü
    if (password.length < 6) {
        alert('Şifre en az 6 karakter olmalıdır!');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // QR kodu göster
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('qrCodeSection').style.display = 'block';
            
            // QR kodu oluştur
            const qrCodeElement = document.getElementById('qrCode');
            qrCodeElement.innerHTML = ''; // Önceki QR kodu temizle
            
            // Canvas elementi oluştur
            const canvas = document.createElement('canvas');
            qrCodeElement.appendChild(canvas);
            
            // QR kodu oluştur ve hata kontrolü yap
            try {
                await QRCode.toCanvas(canvas, data.qrCodeUrl, {
                    width: 200,
                    height: 200,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                });
                console.log('QR kod başarıyla oluşturuldu:', data.qrCodeUrl);
            } catch (qrError) {
                console.error('QR kod oluşturma hatası:', qrError);
                qrCodeElement.innerHTML = `
                    <p style="color: red;">QR kod oluşturulamadı. Lütfen aşağıdaki URL'yi manuel olarak Google Authenticator'a ekleyin:</p>
                    <p style="word-break: break-all;">${data.qrCodeUrl}</p>
                `;
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Kayıt hatası:', error);
        alert('Kayıt sırasında bir hata oluştu');
    }
} 