const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');

// İşlem ekleme
router.post('/', async (req, res) => {
    try {
        const { customer_id, type, amount, date, description } = req.body;
        
        // Müşteriyi kontrol et
        const customer = await Customer.findById(customer_id);
        if (!customer) {
            return res.status(404).json({ message: 'Müşteri bulunamadı' });
        }

        const transaction = new Transaction({
            customer: customer_id,
            type,
            amount,
            date,
            description
        });

        await transaction.save();

        // Müşterinin transactions dizisine ekle
        customer.transactions.push(transaction._id);
        await customer.save();

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'İşlem eklenirken hata oluştu' });
    }
});

// Müşteriye ait tüm işlemleri getir
router.get('/customer/:customerId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ customer: req.params.customerId })
            .sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'İşlemler getirilirken hata oluştu' });
    }
});

// İşlem sil
router.delete('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'İşlem bulunamadı' });
        }

        // Müşterinin transactions dizisinden kaldır
        await Customer.findByIdAndUpdate(
            transaction.customer,
            { $pull: { transactions: transaction._id } }
        );

        res.json({ message: 'İşlem başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ message: 'İşlem silinirken hata oluştu' });
    }
});

module.exports = router; 