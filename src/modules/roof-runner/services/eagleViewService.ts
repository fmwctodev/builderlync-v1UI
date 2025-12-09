interface EagleViewOrderRequest {
  orderReports: {
    reportAddresses: {
      address: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      latitude: number;
      longitude: number;
      addressType: number;
    };
    buildingId: string;
    primaryProductId: number;
    deliveryProductId: number;
    addOnProductIds: number[];
    measurementInstructionType: number;
    reportAttributes: Record<string, any>;
    claimNumber?: string;
    claimInfo?: string;
    batchId?: string;
    catId?: string;
    changesInLast4Years: boolean;
    pONumber?: string;
    comments?: string;
    referenceId?: string;
    insuredName?: string;
    upgradeFromReportId?: number;
    policyNumber?: string;
    dateOfLoss?: string;
  };
  promoCode?: string;
  placeOrderUser: string;
  creditCardData: {
    cardFirstName: string;
    cardLastName: string;
    expirationMonth: number;
    expirationYear: number;
    creditCardNumber: string;
    creditCardType: number;
  };
}

interface EagleViewOrderResponse {
  success: boolean;
  orderId?: string;
  message?: string;
  error?: string;
}

interface EagleViewReport {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  address: string;
  reportType: string;
  measurements?: {
    totalRoofArea: number;
    perimeterLength: number;
    pitch: string;
    facets: Array<{
      area: number;
      pitch: string;
      direction: string;
    }>;
  };
  downloadLinks?: {
    pdf: string;
    xml: string;
    dxf?: string;
  };
}

class EagleViewService {
  private baseUrl = 'https://api.eagleview.com';
  private sandboxUrl = 'https://sandbox-api.eagleview.com';
  private apiKey = import.meta.env.VITE_EAGLEVIEW_API_KEY;
  private useSandbox = true; // Set to false for production

  private getApiUrl(): string {
    return this.useSandbox ? this.sandboxUrl : this.baseUrl;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-API-Version': '1.0'
    };
  }

  async getImagery(address: string): Promise<any> {
    try {
      const response = await fetch(`${this.getApiUrl()}/imagery/v1/search`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          address: address,
          radius: 100,
          limit: 10
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('EagleView imagery search failed:', error);
      throw error;
    }
  }

  async getImageryById(imageId: string): Promise<any> {
    try {
      const response = await fetch(`${this.getApiUrl()}/imagery/v1/images/${imageId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('EagleView imagery fetch failed:', error);
      throw error;
    }
  }

  async downloadImage(imageId: string, format: 'jpeg' | 'tiff' = 'jpeg'): Promise<Blob> {
    try {
      const response = await fetch(`${this.getApiUrl()}/imagery/v1/images/${imageId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': format === 'tiff' ? 'image/tiff' : 'image/jpeg'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('EagleView image download failed:', error);
      throw error;
    }
  }

  async submitOrder(orderData: EagleViewOrderRequest): Promise<EagleViewOrderResponse> {
    try {
      const token = localStorage.getItem('token');
      console.log('Submitting order with data:', JSON.stringify(orderData, null, 2));
      const response = await fetch('https://builderlyncapi.testenvapp.com/api/eagleview/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Success:', result);
      return {
        success: true,
        orderId: result.orderId || result.id,
        message: result.message || 'Order submitted successfully'
      };
    } catch (error) {
      console.error('EagleView order submission failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getOrderStatus(orderId: string): Promise<EagleViewReport | null> {
    console.log('Order status endpoint not available');
    return null;
  }

  async getReports(referenceId?: string, reportId?: number): Promise<EagleViewReport[]> {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (referenceId) params.append('referenceId', referenceId);
      if (reportId) params.append('reportId', reportId.toString());
      
      const url = `https://builderlyncapi.testenvapp.com/api/eagleview/orders${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return Array.isArray(result) ? result : result.data || [];
    } catch (error) {
      console.error('Failed to fetch Eagle View orders:', error);
      return [];
    }
  }

  async downloadReport(reportId: string, format: 'pdf' | 'xml' | 'dxf'): Promise<Blob | null> {
    console.log('Download endpoint not available');
    return null;
  }

  createOrderData(formData: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    buildingId: string;
    productId: number;
    claimInfo?: {
      claimNumber?: string;
      claimInformation?: string;
      poNumber?: string;
      dateOfLoss?: string;
      insuredName?: string;
      policyNumber?: string;
      catId?: string;
    };
    paymentInfo: {
      firstName: string;
      lastName: string;
      cardNumber: string;
      expiryMonth: string;
      expiryYear: string;
      cvv: string;
    };
    specialInstructions?: string;
    userName: string;
  }): EagleViewOrderRequest {
    return {
      orderReports: {
        reportAddresses: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country || 'USA',
          latitude: formData.latitude || 0,
          longitude: formData.longitude || 0,
          addressType: 0
        },
        buildingId: formData.buildingId,
        primaryProductId: formData.productId,
        deliveryProductId: 1,
        addOnProductIds: [],
        measurementInstructionType: 1,
        reportAttributes: {},
        claimNumber: formData.claimInfo?.claimNumber || '',
        claimInfo: formData.claimInfo?.claimInformation || '',
        batchId: `Batch-${Date.now()}`,
        catId: formData.claimInfo?.catId || '',
        changesInLast4Years: false,
        pONumber: formData.claimInfo?.poNumber || '',
        comments: formData.specialInstructions || '',
        referenceId: `Ref-${Date.now()}`,
        insuredName: formData.claimInfo?.insuredName || '',
        upgradeFromReportId: 0,
        policyNumber: formData.claimInfo?.policyNumber || '',
        dateOfLoss: formData.claimInfo?.dateOfLoss || new Date().toISOString().split('T')[0],
      },
      promoCode: '',
      placeOrderUser: formData.userName,
      creditCardData: {
        cardFirstName: formData.paymentInfo.firstName,
        cardLastName: formData.paymentInfo.lastName,
        expirationMonth: Number(formData.paymentInfo.expiryMonth),
        expirationYear: Number(formData.paymentInfo.expiryYear),
        creditCardNumber: formData.paymentInfo.cardNumber,
        creditCardType: 2
      }
    };
  }
}

export const eagleViewService = new EagleViewService();
export type { EagleViewOrderRequest, EagleViewOrderResponse, EagleViewReport };