export interface DeliveryOption {
  id: string;
  label: string;
  price: number;
}

export interface ReportOption {
  img?: string;
  warningText?: string;
  points?: string[];
  link?: string;
  extraText?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  deliveryOptions?: DeliveryOption[];
  reportOptions?: ReportOption;
}

export interface ProductCategory {
  id: string;
  name: string;
  isNew: boolean;
  products: Product[];
}

export const residentialProductCategories: ProductCategory[] = [
  {
    id: 'full-house',
    name: 'Full House Products',
    isNew: true,
    products: [
      {
        id: '99',
        name: 'Full House™',
        description: 'Complete measurements for the entire house structure',
        price: 105,
        deliveryOptions: [{ id: '8', label: 'Regular', price: 0 }],
        reportOptions: {
          points: [
            "•3D Roof measurements (including penetrations)",
            "•Walls, Windows, and Doors measurements",
            "•Field verification required for select areas (marked in yellow on report)"
          ]
        }
      }
    ]
  },
  {
    id: 'roof',
    name: 'Roof Products',
    isNew: true,
    products: [
      {
        id: '31',
        name: 'Premium',
        description: 'Premium roof measurement report',
        price: 32.75,
        deliveryOptions: [
          { id: '8', label: 'Regular', price: 0 },
          { id: '4', label: 'Express', price: 31.75 },
          { id: '7', label: '3 Hours', price: 42.25 }
        ],
        reportOptions: {
          points: [
            "•3D diagram of the roof",
            "•5 aerial images of the structure",
            "•All critical measurements",
            "•Waste calculation table"
          ]
        }
      },
      {
        id: '44',
        name: 'QuickSquares™',
        description: 'Quick roof measurements',
        price: 18,
        deliveryOptions: [{ id: '45', label: 'Quick', price: 0 }],
        reportOptions: {
          points: [
            "•Square footage of the roof",
            "•Predominant pitch",
            "•Completed in about an hour"
          ],
          warningText: "Bid Perfect™ will replace QuickSquares™- get accurate and additional data with a reliable delivery time-frame, all for the same price."
        }
      },
      {
        id: '46',
        name: 'Gutter',
        description: 'Gutter measurements',
        price: 13.75,
        deliveryOptions: [
          { id: '8', label: 'Regular', price: 0 },
          { id: '2', label: '3 Hours', price: 42.25 }
        ],
        reportOptions: {
          points: [
            "•Roof diagram with gutters highlighted",
            "•5 aerial images of the structure",
            "•Total eave measurements",
            "•Estimated number of downspouts"
          ]
        }
      },
      {
        id: '84',
        name: 'Bid Perfect™',
        description: 'Detailed measurements for accurate bidding',
        price: 18,
        deliveryOptions: [{ id: '45', label: 'Quick', price: 0 }],
        reportOptions: {
          points: [
            "•Total roof area",
            "•Pitch table",
            "•# of facets",
            "•5 Aerial images of structure",
            "•Suggested Waste Factor"
          ]
        }
      }
    ]
  },
  {
    id: 'solar',
    name: 'Solar Products',
    isNew: true,
    products: [
      {
        id: '11',
        name: 'Inform Essentials+',
        description: 'Essential solar installation measurements',
        price: 63.25,
        deliveryOptions: [
          { id: '8', label: 'Regular', price: 0 },
          { id: '4', label: 'Express', price: 31.75 },
          { id: '7', label: '3 Hours', price: 42.25 }
        ],
        reportOptions: {
          points: [
            "•Roof geometry",
            "•Pitch",
            "•Azimuth",
            "•Area",
            "•2D Roof obstructions",
            "•Line classifications"
          ]
        }
      },
      {
        id: '62',
        name: 'Inform Advanced',
        description: 'Advanced solar measurements and analysis',
        price: 89,
        deliveryOptions: [{ id: '1', label: 'Regular', price: 0 }],
        reportOptions: {
          points: [
            "•Solar values (SAV, TSRF)",
            "•3D Roof obstructions In addition to",
            "•Roof geometry",
            "•Pitch",
            "•Azimuth",
            "•Area",
            "•Line classifications"
          ],
          extraText: "Try TrueDesign™ to create a module layout and calculate electrical production!"
        }
      }
    ]
  },
  {
    id: 'walls',
    name: 'Walls Products',
    isNew: true,
    products: [
      {
        id: '85',
        name: 'Walls, Windows & Doors',
        description: 'Complete exterior measurements',
        price: 78,
        deliveryOptions: [{ id: '1', label: 'Regular', price: 0 }],
        reportOptions: {
          points: [
            "•3D wall area diagram",
            "•Siding and masonry measurements",
            "•Window and door measurements",
            "•Elevation by cardinal direction",
            "•5 aerial images of the structure"
          ]
        }
      },
      {
        id: '86',
        name: 'Walls',
        description: 'Wall measurements only',
        price: 48,
        deliveryOptions: [{ id: '1', label: 'Regular', price: 0 }],
        reportOptions: {
          points: [
            "•3D wall area diagram",
            "•Siding and masonry measurements",
            "•Elevation by cardinal direction",
            "•5 aerial images of the structure",
            "•No window or door cutouts"
          ]
        }
      }
    ]
  }
];

export const commercialProductCategories: ProductCategory[] = [
  {
    id: 'roof',
    name: 'Roof Products',
    isNew: true,
    products: [
      {
        id: '32',
        name: 'Premium',
        description: 'Premium commercial roof measurement report',
        price: 89.5,
        deliveryOptions: [
          { id: '8', label: 'Regular', price: 0 },
          { id: '4', label: 'Express', price: 31.75 },
          { id: '7', label: '3 Hours', price: 42.25 }
        ],
        reportOptions: {
          points: [
            "•3D Roof measurements (including penetrations)",
            "•Walls, Windows, and Doors measurements",
            "•Field verification required for select areas (marked in yellow on report)"
          ]
        }
      },
      {
        id: '47',
        name: 'Gutter',
        description: 'Commercial gutter measurements',
        price: 23.25,
        deliveryOptions: [
          { id: '8', label: 'Regular', price: 0 },
          { id: '2', label: '3 Hours', price: 42.25 }
        ],
        reportOptions: {
          points: [
            "•Roof diagram with gutters highlighted",
            "•5 aerial images of the structure",
            "•Total eave measurements",
            "•Estimated number of downspouts"
          ]
        }
      },
      {
        id: '102',
        name: 'Bid Perfect™',
        description: 'Detailed commercial measurements for accurate bidding',
        price: 49,
        deliveryOptions: [{ id: '1', label: 'Regular', price: 0 }],
        reportOptions: {
          points: [
            "•Total roof area",
            "•Pitch table",
            "•# of facets",
            "•5 Aerial images of structure",
            "•Suggested Waste Factor"
          ]
        }
      }
    ]
  },
  {
    id: 'walls',
    name: 'Walls Products',
    isNew: true,
    products: [
      {
        id: '35',
        name: 'Walls',
        description: 'Commercial wall measurements',
        price: 221.25,
        deliveryOptions: [{ id: '1', label: 'Regular', price: 0 }],
        reportOptions: {
          points: [
            "•3D wall area diagram",
            "•Window and door diagram",
            "•Elevation by cardinal direction",
            "•5 aerial images of the structure"
          ]
        }
      }
    ]
  }
];

export const multiFamilyProductCategories: ProductCategory[] = [
  {
    id: 'roof',
    name: 'Roof Products',
    isNew: true,
    products: [
      {
        id: '55',
        name: 'QuickSquares™',
        description: 'Quick roof measurements for multi-family buildings',
        price: 49,
        deliveryOptions: [{ id: '45', label: 'Quick', price: 0 }],
        reportOptions: {
          points: [
            "•Square footage of the roof",
            "•Predominant pitch",
            "•Outline of the roof area",
            "•Completed in about an hour"
          ],
          warningText: "Consider ordering Bid Perfect™ - Commercial, which will replace QuickSquares™ - Multi-Family. Get accurate and additional data, along with a reliable delivery time-frame with the NEW Bid Perfect™ - Commercial product."
        }
      }
    ]
  }
];