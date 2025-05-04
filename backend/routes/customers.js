const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Müşteri ekleme
router.post('/', async (req, res) => {
    try {
        const { name, phone, email, description } = req.body;
        
        const customer = new Customer({
            name,
            phone,
            email,
            description
        });

        await customer.save();
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Müşteri eklenirken hata oluştu' });
    }
});

// Tüm müşterileri getir
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find().populate('transactions');
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Müşteriler getirilirken hata oluştu' });
    }
});

// Tek müşteri getir
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id).populate('transactions');
        if (!customer) {
            return res.status(404).json({ message: 'Müşteri bulunamadı' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Müşteri getirilirken hata oluştu' });
    }
});

// Müşteri güncelle
router.put('/:id', async (req, res) => {
    try {
        const { name, phone, email, description } = req.body;
        
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            { name, phone, email, description },
            { new: true }
        );

        if (!customer) {
            return res.status(404).json({ message: 'Müşteri bulunamadı' });
        }

        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Müşteri güncellenirken hata oluştu' });
    }
});

// Müşteri sil
router.delete('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Müşteri bulunamadı' });
        }
        res.json({ message: 'Müşteri başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ message: 'Müşteri silinirken hata oluştu' });
    }
});

module.exports = router; 