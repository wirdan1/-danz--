import { api } from './api.js';

// DOM Elements
const sections = {
    home: document.getElementById('home-section'),
    games: document.getElementById('games-section'),
    transactions: document.getElementById('transactions-section'),
    deposit: document.getElementById('deposit-section')
};

const navLinks = document.querySelectorAll('nav ul li a');
const gameGrid = document.getElementById('game-grid');
const providersList = document.getElementById('providers-list');
const gameFilter = document.getElementById('game-filter');
const gameSearch = document.getElementById('game-search');
const orderModal = document.getElementById('order-modal');
const orderForm = document.getElementById('order-form');
const statusModal = document.getElementById('status-modal');
const depositForm = document.getElementById('deposit-form');
const transactionBody = document.getElementById('transaction-body');
const depositBody = document.getElementById('deposit-body');
const refreshTransactionsBtn = document.getElementById('refresh-transactions');
const exploreBtn = document.getElementById('explore-btn');
const closeModalButtons = document.querySelectorAll('.close-modal');
const loader = document.querySelector('.loader');

// Global Variables
let currentGame = null;
let priceList = [];
let providers = [];
let transactionHistory = [];
let depositHistory = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    // Hide loader after 1 second (simulate loading)
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 1000);
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    await loadInitialData();
});

// Set up event listeners
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Explore button
    exploreBtn.addEventListener('click', () => {
        showSection('games');
        navLinks.forEach(navLink => {
            navLink.classList.remove('active');
            if (navLink.getAttribute('data-section') === 'games') {
                navLink.classList.add('active');
            }
        });
    });
    
    // Game filter
    gameFilter.addEventListener('change', filterGames);
    gameSearch.addEventListener('input', filterGames);
    
    // Order modal
    orderForm.addEventListener('submit', handleOrderSubmit);
    
    // Status modal
    document.getElementById('close-status').addEventListener('click', () => {
        statusModal.classList.remove('active');
    });
    
    // Deposit form
    depositForm.addEventListener('submit', handleDepositSubmit);
    
    // Refresh transactions
    refreshTransactionsBtn.addEventListener('click', async () => {
        await loadTransactionHistory();
    });
    
    // Close modals
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            orderModal.classList.remove('active');
            statusModal.classList.remove('active');
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            orderModal.classList.remove('active');
        }
        if (e.target === statusModal) {
            statusModal.classList.remove('active');
        }
    });
}

// Show specific section
function showSection(section) {
    Object.values(sections).forEach(sec => {
        sec.classList.remove('active-section');
    });
    sections[section].classList.add('active-section');
    
    // Load data if needed
    if (section === 'transactions') {
        loadTransactionHistory();
    } else if (section === 'deposit') {
        loadDepositHistory();
    }
}

// Load initial data
async function loadInitialData() {
    try {
        // Get providers
        const providersResponse = await api.getProviders();
        providers = providersResponse.data;
        renderProviders();
        
        // Get price list
        const priceListResponse = await api.getPriceList();
        priceList = priceListResponse.data;
        renderGames(priceList);
    } catch (error) {
        showError('Failed to load initial data. Please try again later.');
    }
}

// Render providers
function renderProviders() {
    providersList.innerHTML = '';
    
    // Add "All" option
    const allProvider = document.createElement('div');
    allProvider.classList.add('provider-item', 'active');
    allProvider.textContent = 'All';
    allProvider.addEventListener('click', () => {
        document.querySelectorAll('.provider-item').forEach(item => {
            item.classList.remove('active');
        });
        allProvider.classList.add('active');
        filterGames();
    });
    providersList.appendChild(allProvider);
    
    // Add other providers
    providers.forEach(provider => {
        const providerItem = document.createElement('div');
        providerItem.classList.add('provider-item');
        providerItem.textContent = provider;
        providerItem.addEventListener('click', () => {
            document.querySelectorAll('.provider-item').forEach(item => {
                item.classList.remove('active');
            });
            providerItem.classList.add('active');
            filterGames();
        });
        providersList.appendChild(providerItem);
    });
}

// Render games
function renderGames(games) {
    gameGrid.innerHTML = '';
    
    if (games.length === 0) {
        gameGrid.innerHTML = '<p class="no-games">No games found matching your criteria.</p>';
        return;
    }
    
    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.classList.add('game-card');
        
        gameCard.innerHTML = `
            <div class="game-image">
                <img src="${game.img_url || 'https://via.placeholder.com/300x150?text=Game+Image'}" alt="${game.name}">
            </div>
            <div class="game-info">
                <h3>${game.name}</h3>
                <p>${game.category} • ${game.provider}</p>
                <div class="game-price">
                    <span class="price">${game.price_formatted}</span>
                    <button class="buy-btn" data-code="${game.code}">Buy Now</button>
                </div>
            </div>
        `;
        
        gameGrid.appendChild(gameCard);
    });
    
    // Add event listeners to buy buttons
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const gameCode = e.target.getAttribute('data-code');
            currentGame = priceList.find(game => game.code === gameCode);
            openOrderModal(currentGame);
        });
    });
}

// Filter games based on selected filters
function filterGames() {
    const selectedProvider = document.querySelector('.provider-item.active').textContent;
    const searchTerm = gameSearch.value.toLowerCase();
    const gameCategory = gameFilter.value;
    
    let filteredGames = [...priceList];
    
    // Filter by provider
    if (selectedProvider !== 'All') {
        filteredGames = filteredGames.filter(game => game.provider === selectedProvider);
    }
    
    // Filter by category
    if (gameCategory !== 'all') {
        filteredGames = filteredGames.filter(game => game.category === gameCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredGames = filteredGames.filter(game => 
            game.name.toLowerCase().includes(searchTerm) || 
            game.provider.toLowerCase().includes(searchTerm)
        );
    }
    
    renderGames(filteredGames);
}

// Open order modal
function openOrderModal(game) {
    document.getElementById('game-name').textContent = game.name;
    orderModal.classList.add('active');
}

// Handle order submission
async function handleOrderSubmit(e) {
    e.preventDefault();
    
    const playerId = document.getElementById('player-id').value;
    const paymentMethod = document.getElementById('payment-method').value;
    
    if (!playerId || !paymentMethod) {
        showError('Please fill in all fields');
        return;
    }
    
    try {
        loader.classList.remove('hidden');
        const response = await api.createOrder(currentGame.code, playerId);
        
        // Show success message
        showStatusModal({
            title: 'Order Successful',
            items: [
                { label: 'Transaction ID', value: response.data.reff_id },
                { label: 'Game', value: currentGame.name },
                { label: 'Player ID', value: playerId },
                { label: 'Amount', value: `Rp ${response.data.price.toLocaleString()}` },
                { label: 'Status', value: 'Pending' }
            ]
        });
        
        // Reset form
        orderForm.reset();
        orderModal.classList.remove('active');
        
        // Refresh transaction history
        await loadTransactionHistory();
    } catch (error) {
        showError(error.message || 'Failed to create order');
    } finally {
        loader.classList.add('hidden');
    }
}

// Load transaction history
async function loadTransactionHistory() {
    try {
        loader.classList.remove('hidden');
        const response = await api.getTransactionHistory();
        transactionHistory = response.history;
        renderTransactionHistory();
    } catch (error) {
        showError('Failed to load transaction history');
    } finally {
        loader.classList.add('hidden');
    }
}

// Render transaction history
function renderTransactionHistory() {
    transactionBody.innerHTML = '';
    
    if (transactionHistory.length === 0) {
        transactionBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-transactions">No transactions found</td>
            </tr>
        `;
        return;
    }
    
    transactionHistory.forEach(transaction => {
        const tr = document.createElement('tr');
        
        // Determine status class
        let statusClass = '';
        if (transaction.status.toLowerCase().includes('sukses')) {
            statusClass = 'status-success';
        } else if (transaction.status.toLowerCase().includes('pending')) {
            statusClass = 'status-pending';
        } else if (transaction.status.toLowerCase().includes('gagal') || transaction.status.toLowerCase().includes('failed')) {
            statusClass = 'status-failed';
        }
        
        tr.innerHTML = `
            <td>${transaction.code}</td>
            <td>${transaction.aktivitas}</td>
            <td>-</td>
            <td>Rp ${transaction.nominal.toLocaleString()}</td>
            <td><span class="status-badge ${statusClass}">${transaction.status}</span></td>
            <td>${new Date(transaction.tanggal).toLocaleString()}</td>
        `;
        
        transactionBody.appendChild(tr);
    });
}

// Handle deposit submission
async function handleDepositSubmit(e) {
    e.preventDefault();
    
    const amount = document.getElementById('deposit-amount').value;
    const paymentMethod = document.getElementById('deposit-method').value;
    
    if (!amount || !paymentMethod) {
        showError('Please fill in all fields');
        return;
    }
    
    if (parseInt(amount) < 500) {
        showError('Minimum deposit amount is Rp 500');
        return;
    }
    
    try {
        loader.classList.remove('hidden');
        const response = await api.createDeposit(amount);
        
        // Show success message
        showStatusModal({
            title: 'Deposit Request Created',
            items: [
                { label: 'Transaction ID', value: response.data.reff_id },
                { label: 'Amount', value: `Rp ${response.data.nominal.toLocaleString()}` },
                { label: 'Fee', value: `Rp ${response.data.fee.toLocaleString()}` },
                { label: 'You Will Get', value: `Rp ${response.data.get_balance.toLocaleString()}` },
                { label: 'Status', value: 'Pending' },
                { label: 'Expires At', value: new Date(response.data.expired_at).toLocaleString() }
            ]
        });
        
        // Reset form
        depositForm.reset();
        
        // Refresh deposit history
        await loadDepositHistory();
    } catch (error) {
        showError(error.message || 'Failed to create deposit');
    } finally {
        loader.classList.add('hidden');
    }
}

// Load deposit history
async function loadDepositHistory() {
    try {
        // In a real app, you would fetch deposit history from the API
        // For now, we'll simulate it with the transaction history
        const response = await api.getTransactionHistory();
        depositHistory = response.history.filter(t => t.aktivitas === 'Deposit');
        renderDepositHistory();
    } catch (error) {
        showError('Failed to load deposit history');
    }
}

// Render deposit history
function renderDepositHistory() {
    depositBody.innerHTML = '';
    
    if (depositHistory.length === 0) {
        depositBody.innerHTML = `
            <tr>
                <td colspan="5" class="no-deposits">No deposit history found</td>
            </tr>
        `;
        return;
    }
    
    depositHistory.forEach(deposit => {
        const tr = document.createElement('tr');
        
        // Determine status class
        let statusClass = '';
        if (deposit.status.toLowerCase().includes('sukses')) {
            statusClass = 'status-success';
        } else if (deposit.status.toLowerCase().includes('pending')) {
            statusClass = 'status-pending';
        } else if (deposit.status.toLowerCase().includes('gagal') || deposit.status.toLowerCase().includes('failed')) {
            statusClass = 'status-failed';
        }
        
        tr.innerHTML = `
            <td>${deposit.code}</td>
            <td>Rp ${deposit.nominal.toLocaleString()}</td>
            <td><span class="status-badge ${statusClass}">${deposit.status}</span></td>
            <td>${new Date(deposit.tanggal).toLocaleString()}</td>
            <td>
                <button class="action-btn check">Check</button>
                <button class="action-btn cancel">Cancel</button>
            </td>
        `;
        
        depositBody.appendChild(tr);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.action-btn.check').forEach(button => {
        button.addEventListener('click', async (e) => {
            const trxId = e.target.closest('tr').querySelector('td').textContent;
            await checkDepositStatus(trxId);
        });
    });
    
    document.querySelectorAll('.action-btn.cancel').forEach(button => {
        button.addEventListener('click', async (e) => {
            const trxId = e.target.closest('tr').querySelector('td').textContent;
            await cancelDeposit(trxId);
        });
    });
}

// Check deposit status
async function checkDepositStatus(trxId) {
    try {
        loader.classList.remove('hidden');
        const response = await api.checkDepositStatus(trxId);
        
        showStatusModal({
            title: 'Deposit Status',
            items: [
                { label: 'Transaction ID', value: trxId },
                { label: 'Status', value: response.data.status },
                { label: 'Amount Credited', value: response.data.saldo_masuk ? `Rp ${response.data.saldo_masuk.toLocaleString()}` : '-' }
            ]
        });
    } catch (error) {
        showError(error.message || 'Failed to check deposit status');
    } finally {
        loader.classList.add('hidden');
    }
}

// Cancel deposit
async function cancelDeposit(trxId) {
    if (!confirm('Are you sure you want to cancel this deposit?')) return;
    
    try {
        loader.classList.remove('hidden');
        const response = await api.cancelDeposit(trxId);
        
        showStatusModal({
            title: 'Deposit Cancelled',
            items: [
                { label: 'Transaction ID', value: trxId },
                { label: 'Status', value: response.data.status },
                { label: 'Cancelled At', value: new Date(response.data.created_at).toLocaleString() }
            ]
        });
        
        // Refresh deposit history
        await loadDepositHistory();
    } catch (error) {
        showError(error.message || 'Failed to cancel deposit');
    } finally {
        loader.classList.add('hidden');
    }
}

// Show status modal
function showStatusModal(data) {
    const statusContent = document.getElementById('status-content');
    document.getElementById('status-title').textContent = data.title;
    
    statusContent.innerHTML = '';
    data.items.forEach(item => {
        const statusItem = document.createElement('div');
        statusItem.classList.add('status-item');
        statusItem.innerHTML = `
            <span class="status-label">${item.label}</span>
            <span class="status-value">${item.value}</span>
        `;
        statusContent.appendChild(statusItem);
    });
    
    statusModal.classList.add('active');
}

// Show error message
function showError(message) {
    alert(message); // In a real app, you might want to show a nicer error message
}
