// API Configuration
const API_BASE_URL = 'https://www.v-pedia.web.id';
const API_KEY = 'V-Pedia-jv7pcuzlscb7ymhx';

// Helper function for API requests
async function makeApiRequest(endpoint, params = {}) {
    try {
        // Add API key to params
        params.apikey = API_KEY;
        
        // Convert params to query string
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}${endpoint}?${queryString}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// API Functions
export const api = {
    // Get list of providers
    getProviders: async () => {
        return makeApiRequest('/h2h/providers');
    },
    
    // Get price list
    getPriceList: async (filter = {}) => {
        return makeApiRequest('/h2h/price-list', filter);
    },
    
    // Create order
    createOrder: async (code, target) => {
        return makeApiRequest('/h2h/order/create', { code, target });
    },
    
    // Check order status
    checkOrderStatus: async (trxid) => {
        return makeApiRequest('/h2h/order/check', { trxid });
    },
    
    // Create deposit
    createDeposit: async (nominal) => {
        return makeApiRequest('/h2h/deposit/create', { nominal });
    },
    
    // Check deposit status
    checkDepositStatus: async (trxid) => {
        return makeApiRequest('/h2h/deposit/status', { trxid });
    },
    
    // Cancel deposit
    cancelDeposit: async (trxid) => {
        return makeApiRequest('/h2h/deposit/cancel', { trxid });
    },
    
    // Get transaction history
    getTransactionHistory: async () => {
        return makeApiRequest('/api/mutasi');
    }
};
