interface EagleViewOrderRequest {
  orderReports: {
    reportAddresses: Record<string, any>;
    BuildingId: string;
    PrimaryProductId: number;
    DeliveryProductId: number;
    AddOnProductIds: number[];
    MeasurementInstructionType: number;
    ReportAttributes: Record<string, any>;
    ClaimNumber?: string;
    ClaimInfo?: string;
    BatchId?: string;
    CatId?: string;
    ChangesInLast4Years: boolean;
    PONumber?: string;
    Comments?: string;
    ReferenceId?: string;
    InsuredName?: string;
    UpgradeFromReportId?: number;
    PolicyNumber?: string;
    DateOfLoss?: string;
  };
  promoCode?: string;
  creditCardData: {
    CardFirstName: string;
    CardLastName: string;
    ExpirationMonth: number;
    ExpirationYear: number;
    CreditCardNumber: string;
    CreditCardType: number;
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
      const response = await fetch(`${this.getApiUrl()}/orders/v1/submit`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
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

  async getReports(): Promise<EagleViewReport[]> {
    console.log('Reports endpoint not available, using sample data');
    return [];
  }

  async downloadReport(reportId: string, format: 'pdf' | 'xml' | 'dxf'): Promise<Blob | null> {
    console.log('Download endpoint not available');
    return null;
  }

  createOrderData(formData: {
    address: string;
    buildingId: string;
    productId: number;
    claimInfo?: {
      claimNumber?: string;
      claimInformation?: string;
      poNumber?: string;
      dateOfLoss?: string;
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
  }): EagleViewOrderRequest {
    return {
      orderReports: {
        reportAddresses: { [formData.address]: formData.address },
        BuildingId: formData.buildingId,
        PrimaryProductId: formData.productId,
        DeliveryProductId: 1,
        AddOnProductIds: [],
        MeasurementInstructionType: 1,
        ReportAttributes: {},
        ClaimNumber: formData.claimInfo?.claimNumber || '',
        ClaimInfo: formData.claimInfo?.claimInformation || '',
        BatchId: `Batch-${Date.now()}`,
        CatId: formData.claimInfo?.catId || '',
        ChangesInLast4Years: false,
        PONumber: formData.claimInfo?.poNumber || '',
        Comments: formData.specialInstructions || '',
        ReferenceId: `Ref-${Date.now()}`,
        InsuredName: '',
        UpgradeFromReportId: 0,
        PolicyNumber: '',
        DateOfLoss: formData.claimInfo?.dateOfLoss || '',
      },
      promoCode: '',
      creditCardData: {
        CardFirstName: formData.paymentInfo.firstName,
        CardLastName: formData.paymentInfo.lastName,
        ExpirationMonth: Number(formData.paymentInfo.expiryMonth),
        ExpirationYear: Number(formData.paymentInfo.expiryYear),
        CreditCardNumber: formData.paymentInfo.cardNumber,
        CreditCardType: 2,
      },
    };
  }
}

export const eagleViewService = new EagleViewService();
export type { EagleViewOrderRequest, EagleViewOrderResponse, EagleViewReport };