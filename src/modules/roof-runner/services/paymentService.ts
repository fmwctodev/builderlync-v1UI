import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';

export const paymentService = {
    async createCheckoutSession(pack: any, orgSlug: string) {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/payments/create-checkout-session`, {
            pack,
            successUrl: `${window.location.origin}/org/${orgSlug}/measurements/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/org/${orgSlug}/measurements/payment-cancel`,
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }
};
