import type { QuickBooksInvoicesResponse } from '../types/quickbooks';

// Mock data based on the provided API response
const mockInvoicesData: QuickBooksInvoicesResponse = {
  "success": true,
  "message": "Invoices retrieved successfully",
  "data": [
    {
      "id": 1,
      "quickbooks_id": "123",
      "doc_number": "INV-001",
      "customer_id": 5,
      "customer_name": "John Smith Construction",
      "total_amount": 2500.00,
      "balance": 1200.00,
      "due_date": "2024-02-15",
      "invoice_date": "2024-01-15",
      "status": "open",
      "currency_code": "USD",
      "email_status": "NotSent",
      "private_note": "Rush job - priority customer",
      "customer_memo": "Payment terms: Net 30",
      "created_by": 1,
      "synced_at": "2024-01-20T10:30:00.000Z",
      "created_at": "2024-01-20T10:30:00.000Z",
      "updated_at": "2024-01-20T10:30:00.000Z",
      "contacts": {
        "id": 5,
        "full_name": "John Smith",
        "email": "john@smithconstruction.com"
      },
      "invoice_line_items": [
        {
          "id": 1,
          "invoice_id": 1,
          "line_num": 1,
          "description": "Roofing materials",
          "quantity": 10.00,
          "unit_price": 150.00,
          "amount": 1500.00,
          "item_name": "Shingles Premium",
          "created_at": "2024-01-20T10:30:00.000Z"
        },
        {
          "id": 2,
          "invoice_id": 1,
          "line_num": 2,
          "description": "Labor charges",
          "quantity": 20.00,
          "unit_price": 50.00,
          "amount": 1000.00,
          "item_name": "Labor Hours",
          "created_at": "2024-01-20T10:30:00.000Z"
        }
      ]
    },
    {
      "id": 2,
      "quickbooks_id": "124",
      "doc_number": "INV-002",
      "customer_id": null,
      "customer_name": "ABC Company",
      "total_amount": 850.00,
      "balance": 0.00,
      "due_date": "2024-01-30",
      "invoice_date": "2024-01-10",
      "status": "paid",
      "currency_code": "USD",
      "email_status": "EmailSent",
      "private_note": null,
      "customer_memo": null,
      "created_by": 1,
      "synced_at": "2024-01-20T10:30:00.000Z",
      "created_at": "2024-01-20T10:30:00.000Z",
      "updated_at": "2024-01-20T10:30:00.000Z",
      "contacts": null,
      "invoice_line_items": [
        {
          "id": 3,
          "invoice_id": 2,
          "line_num": 1,
          "description": "Consultation services",
          "quantity": 1.00,
          "unit_price": 850.00,
          "amount": 850.00,
          "item_name": "Consulting",
          "created_at": "2024-01-20T10:30:00.000Z"
        }
      ]
    }
  ]
};

export const quickbooksRoutes = {
  '/api/quickbooks/invoices': {
    GET: () => {
      return new Response(JSON.stringify(mockInvoicesData), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};