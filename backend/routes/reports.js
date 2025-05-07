const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');

// Tarih aralığına göre rapor
router.get('/date-range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const transactions = await Transaction.find({
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).populate('customer');

        const report = {
            totalIncome: 0,
            totalExpense: 0,
            netProfit: 0,
            transactions: transactions
        };

        transactions.forEach(transaction => {
            if (transaction.type === 'gelen') {
                report.totalIncome += transaction.amount;
            } else {
                report.totalExpense += transaction.amount;
            }
        });

        report.netProfit = report.totalIncome - report.totalExpense;
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Rapor oluşturulurken hata oluştu' });
    }
});

// En çok işlem yapılan müşteriler
router.get('/top-customers', async (req, res) => {
    try {
        const customers = await Customer.aggregate([
            {
                $project: {
                    name: 1,
                    transactionCount: { $size: "$transactions" }
                }
            },
            { $sort: { transactionCount: -1 } },
            { $limit: 5 }
        ]);

        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Rapor oluşturulurken hata oluştu' });
    }
});

// Aylık bazda rapor
router.get('/monthly', async (req, res) => {
    try {
        const monthlyReport = await Transaction.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    totalIncome: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "gelen"] }, "$amount", 0]
                        }
                    },
                    totalExpense: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "giden"] }, "$amount", 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    totalIncome: 1,
                    totalExpense: 1,
                    netProfit: { $subtract: ["$totalIncome", "$totalExpense"] }
                }
            },
            { $sort: { year: 1, month: 1 } }
        ]);

        res.json(monthlyReport);
    } catch (error) {
        res.status(500).json({ message: 'Rapor oluşturulurken hata oluştu' });
    }
});

module.exports = router; 