const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const User = require('../models/User');

// Kayıt route'u
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Kullanıcı adı kontrolü
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
        }

        // 2FA secret oluştur
        const secret = speakeasy.generateSecret({
            name: `Müşteri Takip Sistemi:${username}`
        });

        const user = new User({
            username,
            password,
            twoFactorSecret: secret.base32
        });

        await user.save();

        res.json({
            message: 'Kayıt başarılı',
            qrCodeUrl: secret.otpauth_url
        });
    } catch (error) {
        res.status(500).json({ message: 'Kayıt sırasında bir hata oluştu' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Kullanıcıyı bul
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
        }

        // Şifreyi kontrol et
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
        }

        // 2FA secret'ı döndür
        res.json({
            message: '2FA doğrulaması gerekiyor',
            twoFactorSecret: user.twoFactorSecret
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// 2FA doğrulama route'u
router.post('/verify-2fa', async (req, res) => {
    try {
        const { username, token } = req.body;
        
        // Kullanıcıyı bul
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
        }

        // 2FA token'ını doğrula
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token
        });

        if (!verified) {
            return res.status(401).json({ message: 'Geçersiz 2FA kodu' });
        }

        // JWT token oluştur
        const jwtToken = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET || 'gizli-anahtar',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Giriş başarılı',
            token: jwtToken
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router; 