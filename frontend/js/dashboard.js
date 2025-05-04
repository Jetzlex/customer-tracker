let currentCustomerId = null;

// Sayfa yüklendiğinde müşterileri getir
document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();
});

// Müşterileri yükle
async function loadCustomers() {
    try {
        const response = await fetch('http://localhost:3000/api/customers', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const customers = await response.json();
        const tableBody = document.getElementById('customersTable');
        tableBody.innerHTML = '';

        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${customer.email}</td>
                <td>
                    <button class="btn btn-primary" onclick="showAddTransactionModal('${customer._id}')">İşlem Ekle</button>
                    <button class="btn btn-danger" onclick="deleteCustomer('${customer._id}')">Sil</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        alert('Müşteriler yüklenirken bir hata oluştu');
    }
}

// Müşteri ekle
async function addCustomer() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const email = document.getElementById('customerEmail').value;
    const description = document.getElementById('customerDescription').value;

    try {
        const response = await fetch('http://localhost:3000/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, phone, email, description })
        });

        if (response.ok) {
            closeCustomerModal();
            loadCustomers();
        } else {
            const data = await response.json();
            alert(data.message);
        }
    } catch (error) {
        alert('Müşteri eklenirken bir hata oluştu');
    }
}

// Müşteri sil
async function deleteCustomer(customerId) {
    if (!confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/customers/${customerId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            loadCustomers();
        } else {
            const data = await response.json();
            alert(data.message);
        }
    } catch (error) {
        alert('Müşteri silinirken bir hata oluştu');
    }
}

// İşlem ekle
async function addTransaction() {
    const type = document.getElementById('transactionType').value;
    const amount = document.getElementById('transactionAmount').value;
    const date = document.getElementById('transactionDate').value;
    const description = document.getElementById('transactionDescription').value;

    try {
        const response = await fetch('http://localhost:3000/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                customer_id: currentCustomerId,
                type,
                amount,
                date,
                description
            })
        });

        if (response.ok) {
            closeTransactionModal();
            loadCustomers();
        } else {
            const data = await response.json();
            alert(data.message);
        }
    } catch (error) {
        alert('İşlem eklenirken bir hata oluştu');
    }
}

// Rapor oluştur
async function generateReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    try {
        const response = await fetch(`http://localhost:3000/api/reports/date-range?startDate=${startDate}&endDate=${endDate}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const report = await response.json();
        
        document.getElementById('totalIncome').textContent = report.totalIncome;
        document.getElementById('totalExpense').textContent = report.totalExpense;
        document.getElementById('netProfit').textContent = report.netProfit;
    } catch (error) {
        alert('Rapor oluşturulurken bir hata oluştu');
    }
}

// Modal işlemleri
function showAddCustomerModal() {
    document.getElementById('customerModal').style.display = 'block';
}

function closeCustomerModal() {
    document.getElementById('customerModal').style.display = 'none';
}

function showAddTransactionModal(customerId) {
    currentCustomerId = customerId;
    document.getElementById('transactionModal').style.display = 'block';
}

function closeTransactionModal() {
    document.getElementById('transactionModal').style.display = 'none';
}

// Bölüm gösterme işlemleri
function showCustomers() {
    document.getElementById('customersSection').style.display = 'block';
    document.getElementById('reportsSection').style.display = 'none';
}

function showReports() {
    document.getElementById('customersSection').style.display = 'none';
    document.getElementById('reportsSection').style.display = 'block';
}

// Çıkış yap
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
} 