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
  private baseUrl = 'https://eagleview-backend-7pe3.onrender.com/api';

  async submitOrder(orderData: EagleViewOrderRequest): Promise<EagleViewOrderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        orderId: result.orderId,
        message: result.message,
      };
    } catch (error) {
      console.error('EagleView order submission failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getOrderStatus(orderId: string): Promise<EagleViewReport | null> {
    // API endpoint doesn't exist, return null
    console.log('Order status endpoint not available');
    return null;
  }

  async getReports(): Promise<EagleViewReport[]> {
    // API endpoint doesn't exist, return empty array to use sample data
    console.log('Reports endpoint not available, using sample data');
    return [];
  }

  async downloadReport(reportId: string, format: 'pdf' | 'xml' | 'dxf'): Promise<Blob | null> {
    // API endpoint doesn't exist, return null
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