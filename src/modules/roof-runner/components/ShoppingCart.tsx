import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  ChevronDown,
  Search,
  Building,
  CheckCircle,
  TrendingUp,
  Box,
  AlertCircle,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { Product, ShipTo, OrderHistoryItem } from "../../abc-supply/types";
import { abcSupplyApi } from "../../abc-supply/services/api";
import { srsApi } from "../services/srsApi";
import { srsService } from "../services/srsService";
import { qxoApi } from "../services/qxoApi";
import CheckoutForm, {
  CheckoutFormData,
} from "../../abc-supply/components/CheckoutForm";

interface CartItem extends Product {
  quantity: number;
  price?: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onVariantChange?: (oldItemNumber: string, newVariant: any) => void;
  supplier?: string;
}

const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onVariantChange,
  supplier = "ABC Supply",
}) => {
  const [selectedShipTo, setSelectedShipTo] = useState<ShipTo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null); // { id, number, name }

  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastSrsResponse, setLastSrsResponse] = useState<any>(null);
  const [itemPrices, setItemPrices] = useState<Record<string, number>>({});
  const [srsPriceStatus, setSrsPriceStatus] = useState<
    Record<
      string,
      {
        price?: number;
        message?: string;
        messageCode?: number;
        availableStatus?: string | null;
        requestedUOM?: string | null;
        priceUOM?: string | null;
      }
    >
  >({});
  const [srsCustomerProfile, setSrsCustomerProfile] = useState<any | null>(
    null,
  );
  const [srsCustomerLoading, setSrsCustomerLoading] = useState(false);
  const [qxoProfile, setQxoProfile] = useState<any | null>(null);
  const [qxoLoading, setQxoLoading] = useState(false);

  const [shipToAddress, setShipToAddress] = useState({
    name: "",
    addressLine1: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const getSrsCustomerCode = (override?: string) => {
    return (
      override ||
      srsCustomerProfile?.customer_code ||
      srsCustomerProfile?.customerCode
    );
  };

  const getSrsHomeBranchCode = () => {
    return (
      srsCustomerProfile?.customer_details?.homeBranch ||
      srsCustomerProfile?.customer_details?.homeBranchId
    );
  };

  useEffect(() => {
    if (isOpen && supplier === "ABC Supply") {
      const savedShipTo = localStorage.getItem("abc_selected_shipto");
      const savedBranch = localStorage.getItem("abc_selected_branch");

      if (savedShipTo) {
        try {
          const parsedShipTo = JSON.parse(savedShipTo);
          setSelectedShipTo(parsedShipTo);

          // Pre-fill shipping address from account/branch if possible?
          // Usually we want the job site address.
        } catch (e) {
          console.error(e);
        }
      }

      if (savedBranch) {
        try {
          const parsedBranch = JSON.parse(savedBranch);
          setSelectedBranch(parsedBranch);
          // Fetch prices immediately
          if (savedShipTo && items.length > 0) {
            const parsedShipTo = JSON.parse(savedShipTo);
            fetchPrices(parsedShipTo.number, parsedBranch.number);
          }
        } catch (e) {
          console.error(e);
        }
      }
    } else if (isOpen && supplier === "SRS") {
      const savedBranch = localStorage.getItem("srs_selected_branch");
      if (savedBranch) {
        try {
          const parsedBranch = JSON.parse(savedBranch);
          setSelectedBranch(parsedBranch);
          // Fetch SRS prices immediately
          if (items.length > 0) {
            fetchSrsPrices(parsedBranch.id || parsedBranch.number);
          }
        } catch (e) {
          console.error(e);
        }
      }
    } else if (isOpen && supplier === "QXO") {
      const savedBranch = localStorage.getItem("qxo_selected_branch");
      if (savedBranch) {
        try {
          setSelectedBranch(JSON.parse(savedBranch));
        } catch (e) {
          console.error(e);
        }
      }
      fetchQxoStatus();
    }
  }, [isOpen, supplier, items.length]);

  const fetchQxoStatus = async () => {
    setQxoLoading(true);
    try {
      const res = await qxoApi.getStatus();
      const data = res.data || res; // Handle both wrapped and unwrapped for safety
      if (data.connected) {
        setQxoProfile(data.profileData || data);
      }
    } catch (e) {
      console.error("Failed to fetch QXO status:", e);
    } finally {
      setQxoLoading(false);
    }
  };

  const formatQxoImage = (img: string) => {
    if (!img) return "/images/default_not_found.jpg";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return `https://beaconproplus.com${img}`;
    return `https://beaconproplus.com/images/large/${img}`;
  };

  const fetchQxoPrices = async () => {
    if (!items || items.length === 0) return;
    const skus = items
      .map((item) => (item as any).skuId || item.itemNumber || item.productId)
      .filter(Boolean);
    if (skus.length === 0) return;

    try {
      const res = await qxoApi.getItemPrices({ skus: skus as string[] });

      // The backend returns { success: true, data: { status: true, data: { ...pricing... } } }
      const pricingData = res.data?.data || res.data || {};
      console.log("[CART DEBUG] QXO Live Prices Fetch Result:", pricingData);

      const newPrices: Record<string, number> = {};
      Object.keys(pricingData).forEach((sku) => {
        const uoms = pricingData[sku];
        if (uoms) {
          // Find the correct UOM from the item in cart if possible
          const cartItem = items.find(
            (i) => ((i as any).skuId || i.itemNumber || i.productId) === sku,
          );
          const targetUom =
            (cartItem as any)?.selectedUOM ||
            (cartItem as any)?.uom ||
            Object.keys(uoms)[0];
          const price = uoms[targetUom] || uoms[Object.keys(uoms)[0]];
          if (price) newPrices[sku] = price;
        }
      });

      if (Object.keys(newPrices).length > 0) {
        console.log(
          "[CART DEBUG] Updating itemPrices with QXO data:",
          newPrices,
        );
        setItemPrices((prev) => ({ ...prev, ...newPrices }));
      }
    } catch (e) {
      console.error("Failed to fetch QXO prices:", e);
    }
  };

  useEffect(() => {
    if (isOpen && supplier === "QXO") {
      fetchQxoPrices();
    }
  }, [isOpen, items.length]);

  useEffect(() => {
    if (!isOpen || supplier !== "SRS") return;
    let isActive = true;

    const loadSrsProfile = async () => {
      setSrsCustomerLoading(true);
      try {
        const result = await srsService.getCustomerProfile();
        if (!isActive) return;

        if (result?.success && result.data?.connected && result.data?.profile) {
          const profile = result.data.profile;
          setSrsCustomerProfile(profile);

          const savedBranch = localStorage.getItem("srs_selected_branch");
          const homeBranchCode = profile.customer_details?.homeBranch;
          const homeBranchId = profile.customer_details?.homeBranchId;

          if (!savedBranch && homeBranchCode) {
            const fallbackBranch = {
              id: homeBranchCode,
              number: homeBranchId || homeBranchCode,
              name: `Home Branch (${homeBranchCode})`,
            };
            setSelectedBranch(fallbackBranch);
            localStorage.setItem(
              "srs_selected_branch",
              JSON.stringify(fallbackBranch),
            );
          }
        } else {
          setSrsCustomerProfile(null);
        }
      } catch (error) {
        if (isActive) {
          setSrsCustomerProfile(null);
        }
      } finally {
        if (isActive) {
          setSrsCustomerLoading(false);
        }
      }
    };

    loadSrsProfile();
    return () => {
      isActive = false;
    };
  }, [isOpen, supplier]);

  // Effect to refresh prices when items change if we have branch/shipto
  useEffect(() => {
    if (isOpen && items.length > 0) {
      if (supplier === "ABC Supply" && selectedShipTo && selectedBranch) {
        fetchPrices(selectedShipTo.number, selectedBranch.number);
      } else if (supplier === "SRS" && selectedBranch) {
        fetchSrsPrices(selectedBranch.id || selectedBranch.number);
      }
    }
  }, [
    items,
    selectedShipTo,
    selectedBranch,
    isOpen,
    supplier,
    srsCustomerProfile,
  ]);

  const resolveSrsUom = (item: any) => {
    return (
      item.selectedUOM ||
      item.productVariants?.[0]?.unit ||
      item.productVariants?.[0]?.uom ||
      item.productVariants?.[0]?.priceUOM ||
      item.productUOM?.[0]?.code ||
      item.uoms?.[0]?.code ||
      item.uom ||
      "EA"
    );
  };

  const resolveSrsProductId = (item: any) => {
    // Prioritize explicit srsProductId or productId fields
    const idFromCart = item.srsProductId || item.productId || (item as any).id;
    if (idFromCart && !Number.isNaN(parseInt(idFromCart))) {
      return parseInt(idFromCart);
    }

    // Fallback to parsing itemNumber if it's numeric
    const parsed = parseInt(item.itemNumber);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const fetchSrsPrices = async (branchCode: string) => {
    if (!items.length || !branchCode) return;

    try {
      const requestBody = {
        branchCode: branchCode,
        productList: items
          .map((item: any) => ({
            productId: resolveSrsProductId(item),
            productName:
              item.itemDescription || item.familyName || item.itemNumber,
            productOptions: Array.isArray(item.productOptions)
              ? item.productOptions
              : ["N/A"],
            quantity: item.quantity || 1,
            uom: resolveSrsUom(item),
          }))
          .filter((item: any) => item.productId),
      };

      if (!requestBody.productList.length) return;

      const response = await srsApi.getPrice(requestBody);

      const prices: Record<string, number> = {};
      const statusByItemNumber: Record<
        string,
        {
          price?: number;
          message?: string;
          messageCode?: number;
          availableStatus?: string | null;
          requestedUOM?: string | null;
          priceUOM?: string | null;
        }
      > = {};

      // The SRS API returns an array directly, or sometimes nested in 'data'
      const priceList = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : response.data?.productList ||
            response.productList ||
            response.data?.data ||
            [];

      if (priceList && Array.isArray(priceList)) {
        // Build a lookup from numeric productId -> price
        const idToPrice: Record<string, number> = {};
        const idToStatus: Record<string, any> = {};
        priceList.forEach((priceItem: any) => {
          const numIdStr = priceItem.productId?.toString();
          const currentPrice =
            priceItem.price !== undefined
              ? priceItem.price
              : priceItem.unitPrice;
          if (numIdStr && currentPrice !== undefined) {
            idToPrice[numIdStr] = currentPrice;
          }
          if (numIdStr) {
            idToStatus[numIdStr] = priceItem;
          }
        });

        // Map prices back to cart items by their numeric ID AND their itemNumber (SKU)
        items.forEach((item: any) => {
          const numId = resolveSrsProductId(item)?.toString();
          const itemKey = item.itemNumber;

          if (numId && idToPrice[numId] !== undefined) {
            prices[itemKey] = idToPrice[numId]; // key by itemNumber for display lookup
          }

          if (numId && idToStatus[numId]) {
            statusByItemNumber[itemKey] = {
              price: idToPrice[numId],
              message: idToStatus[numId]?.message,
              messageCode: idToStatus[numId]?.messageCode,
              availableStatus: idToStatus[numId]?.availableStatus ?? null,
              requestedUOM: idToStatus[numId]?.requestedUOM ?? null,
              priceUOM: idToStatus[numId]?.priceUOM ?? null,
            };
          }
        });

        setItemPrices(prices);
        setSrsPriceStatus(statusByItemNumber);
      }
    } catch (error) {
      console.error("Failed to fetch SRS prices:", error);
    }
  };

  const fetchPrices = async (shipToNumber: string, branchNumber: string) => {
    if (!items.length || !shipToNumber || !branchNumber) return;

    try {
      const requestBody = {
        requestId: `Quote: ${Date.now()}`,
        shipToNumber,
        branchNumber,
        purpose: "ordering",
        lines: items.map((item, index) => ({
          id: (index + 1).toString(),
          itemNumber: item.itemNumber,
          quantity: item.quantity,
          uom: item.uoms?.[0]?.code || "EA",
        })),
      };

      const data = await abcSupplyApi.getPrices(requestBody);

      if (data.success && data.data?.lines) {
        const prices: Record<string, number> = {};
        data.data.lines.forEach((line: any) => {
          prices[line.itemNumber] = line.unitPrice || 0;
        });
        setItemPrices(prices);
      }
    } catch (error) {
      console.error("Failed to fetch prices:", error);
    }
  };

  const handleVariantChange = (currentItem: CartItem, selectedVariant: any) => {
    if (onVariantChange) {
      onVariantChange(currentItem.itemNumber, selectedVariant);
    }
  };

  const handleProceedToCheckout = () => {
    setShowCheckoutForm(true);
  };

  const handleCheckoutSubmit = async (checkoutData: CheckoutFormData) => {
    if (items.length === 0) return;
    if (supplier === "SRS") {
      const fallbackBranch = getSrsHomeBranchCode();
      if (!selectedBranch && !fallbackBranch) {
        alert("Please select a branch first.");
        return;
      }
    } else if (!selectedBranch) {
      alert("Please select a branch first.");
      return;
    }

    if (
      supplier === "ABC Supply" &&
      (!selectedShipTo || !selectedShipTo.address)
    ) {
      alert(
        "No valid Ship-To account selected. Please select an account with a valid address.",
      );
      return;
    }

    try {
      setLoading(true);

      if (supplier === "SRS") {
        const resolvedCustomerCode = getSrsCustomerCode(
          checkoutData.customerCode,
        );
        if (!resolvedCustomerCode) {
          alert(
            "Please connect SRS in Integrations to use your customer code.",
          );
          setLoading(false);
          return;
        }

        const resolvedBranchCode =
          selectedBranch?.id ||
          selectedBranch?.number ||
          getSrsHomeBranchCode();
        if (!resolvedBranchCode) {
          alert("Please select a branch first.");
          setLoading(false);
          return;
        }

        // Call SRS API for SRS
        const orderData = {
          sourceSystem: "BUILDERLYNC",
          customerCode: resolvedCustomerCode,
          jobAccountNumber: 1,
          branchCode: resolvedBranchCode,
          accountNumber: resolvedCustomerCode || "DEMO001",
          transactionID: `SRS-ORD-${Date.now()}`,
          transactionDate: new Date().toISOString(),
          notes: checkoutData.instructions || "",
          shipTo: {
            name:
              checkoutData.contact?.name || selectedShipTo?.name || "Customer",
            addressLine1:
              checkoutData.shippingAddress?.line1 ||
              selectedShipTo?.address?.line1 ||
              "123 Main St",
            addressLine2: selectedShipTo?.address?.line2 || "",
            addressLine3: "",
            city:
              checkoutData.shippingAddress?.city ||
              selectedShipTo?.address?.city ||
              "City",
            state:
              checkoutData.shippingAddress?.state ||
              selectedShipTo?.address?.state ||
              "ST",
            zipCode:
              checkoutData.shippingAddress?.zipCode ||
              selectedShipTo?.address?.postal ||
              "00000",
          },
          poDetails: {
            poNumber: `PO-${Date.now()}`,
            reference: "Builderlync Order",
            jobNumber: "",
            orderDate: new Date().toISOString().split("T")[0],
            expectedDeliveryDate: (() => {
              if (checkoutData.deliveryDate) return checkoutData.deliveryDate;
              const nextWeek = new Date();
              nextWeek.setDate(nextWeek.getDate() + 7);
              return nextWeek.toISOString().split("T")[0];
            })(),
            expectedDeliveryTime: "Anytime",
            orderType:
              checkoutData.deliveryService === "pickup" ? "PICKUP" : "WHSE",
            shippingMethod:
              checkoutData.deliveryService === "pickup"
                ? "Will Call"
                : "Ground Drop",
          },
          orderLineItemDetails: items.map((item: any) => ({
            productId: resolveSrsProductId(item),
            productName:
              item.itemDescription ||
              item.familyName ||
              `Product ${item.itemNumber}`,
            productDescription:
              item.itemDescription ||
              item.productDescription ||
              item.familyName,
            productImageUrl:
              item.productImageUrl ||
              item.productVariants?.[0]?.variantImageURL ||
              "",
            option: item.selectedOption || "N/A",
            quantity: item.quantity,
            price: resolveItemPrice(item),
            customerItem: item.itemNumber || "XXXX",
            uom: item.selectedUOM || resolveSrsUom(item),
          })),
          customerContactInfo: {
            customerContactName: checkoutData.contact?.name || "Builder",
            customerContactPhone: checkoutData.contact?.phone || "0000000000",
            customerContactEmail:
              checkoutData.contact?.email || "builder@example.com",
            customerContactAddress: {
              addressLine1:
                checkoutData.shippingAddress?.line1 ||
                selectedShipTo?.address?.line1 ||
                "123 Main St",
              city:
                checkoutData.shippingAddress?.city ||
                selectedShipTo?.address?.city ||
                "City",
              state:
                checkoutData.shippingAddress?.state ||
                selectedShipTo?.address?.state ||
                "ST",
              zipCode:
                checkoutData.shippingAddress?.zipCode ||
                selectedShipTo?.address?.postal ||
                "00000",
            },
            additionalContactEmails: [],
          },
        };

        console.log(
          "[DEBUG] SRS Order Payload:",
          JSON.stringify(orderData, null, 2),
        );
        const srsResponse = await srsApi.createOrder(orderData);

        if (
          srsResponse.success ||
          srsResponse.transactionID ||
          srsResponse.message === "Order Queued" ||
          srsResponse.data?.success
        ) {
          console.log("SRS Order Queued:", srsResponse);
          // Extract the core srs_response either from the data.order or directly from the response
          const srsData =
            srsResponse.data?.order?.srs_response ||
            srsResponse.data?.srsResponse ||
            srsResponse.srsResponse ||
            srsResponse;
          setLastSrsResponse(srsData);
        } else {
          console.error("SRS Order failed:", srsResponse);
          throw new Error(
            srsResponse.message || "Failed to queue order with SRS",
          );
        }
      } else if (supplier === "ABC Supply") {
        if (!selectedShipTo) return; // Add null check for TypeScript
        // Call ABC Supply API
        const orderData = {
          items: items.map((item) => ({
            productId: item.itemNumber,
            sku: item.itemNumber,
            name: item.familyName || `Product ${item.itemNumber}`,
            quantity: item.quantity,
            unitPrice: item.price || getItemPrice(item.itemNumber) || 0,
            uom: item.uoms?.[0]?.code || "EA",
          })),
          branchNumber: selectedBranch.number,
          shipToAccountNumber: selectedShipTo.number, // Pass shipTo if API supports/needs it
          deliveryAddress: {
            name: selectedShipTo.name,
            line1: selectedShipTo.address.line1 || "",
            line2: selectedShipTo.address.line2 || "",
            city: selectedShipTo.address.city || "",
            state: selectedShipTo.address.state || "",
            postal: selectedShipTo.address.postal || "",
          },
          contact: checkoutData.contact,
          deliveryDate: checkoutData.deliveryDate,
          deliveryService: checkoutData.deliveryService,
        };

        // @ts-ignore
        await abcSupplyApi.createOrder(orderData);
      } else if (supplier === "QXO") {
        // QXO Specific Address Sanitization (Strict Swagger limits)
        const formatQxoAddress = (addr: any) => {
          const line1 = addr.line1 || "";
          let address1 = String(line1).substring(0, 30);
          let address2 =
            line1.length > 30 ? String(line1).substring(30, 60) : "";

          // Brian Hahn (QXO) confirmed: Only North American (US/Canada) addresses are valid.
          // We remove the Indian state mappings to avoid sending invalid state codes like "HR".
          const stateCode = String(addr.state || "").toUpperCase().trim().substring(0, 2);

          return {
            address1,
            address2: address2 || undefined,
            city: String(addr.city || "").substring(0, 25),
            postalCode: String(addr.zipCode || addr.postal || "").substring(
              0,
              10,
            ),
            state: stateCode,
          };
        };

        const sanitizedAddress = formatQxoAddress(
          checkoutData.shippingAddress || {},
        );

        const orderData = {
          apiSiteId: "RRE",
          accountId: String(
            qxoProfile?.accountId || qxoProfile?.accountLegacyId || "678204",
          ).substring(0, 6),
          job: {
            jobName: String(checkoutData.jobName || "Default Job").substring(
              0,
              25,
            ),
            jobNumber: String(checkoutData.jobNumber || "00001").substring(
              0,
              10,
            ),
          },
          purchaseOrderNo: checkoutData.extendedPO
            ? undefined
            : (checkoutData.jobNumber || `PO-${Date.now()}`).substring(0, 22),
          extendedPO: checkoutData.extendedPO
            ? String(checkoutData.extendedPO).substring(0, 50)
            : undefined,
          shipping: {
            shippingMethod: checkoutData.deliveryService,
            shippingBranch: String(
              selectedBranch?.id || selectedBranch?.number || "",
            ).substring(0, 4),
            address: sanitizedAddress,
          },
          contact: {
            name: String(checkoutData.contact?.name || "Customer"),
            phone: String(checkoutData.contact?.phone || ""),
          },
          lineItems: items.map((item) => ({
            itemNumber: String(item.itemNumber || item.productId).substring(
              0,
              6,
            ),
            quantity: item.quantity,
            unitOfMeasure: String(
              (item as any).selectedUOM || (item as any).uom || "EA",
            ).substring(0, 3),
            description: String(
              item.familyName || item.itemDescription || "",
            ).substring(0, 128),
          })),
          specialInstruction: String(checkoutData.instructions || "").substring(
            0,
            234,
          ),
        };

        console.log(
          "[DEBUG] QXO Order Payload (Swagger Compliant):",
          JSON.stringify(orderData, null, 2),
        );
        const res = await qxoApi.createOrder(orderData);
        if (!res.success) {
          throw new Error(res.message || "Failed to submit QXO order");
        }
      }

      setShowCheckoutForm(false);
      setOrderSuccess(true);
      onCheckout();
    } catch (error) {
      console.error("Checkout failed:", error);
      alert(`Order failed: ${error instanceof Error ? error.message : "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const resolveItemPrice = (item: any) => {
    const pVal =
      item.unitPrice ||
      item.itemPrice ||
      item.price ||
      itemPrices[item.itemNumber] ||
      0;
    console.log(`[CART DEBUG] Resolving price for ${item.itemNumber}:`, {
      unitPrice: item.unitPrice,
      itemPrice: item.itemPrice,
      price: item.price,
      statePrice: itemPrices[item.itemNumber],
      finalPVal: pVal,
    });
    if (typeof pVal === "number") return pVal;
    return parseFloat(String(pVal).replace(/[^0-9.]/g, "")) || 0;
  };

  const getItemPrice = (itemNumber: string) => {
    return itemPrices[itemNumber] || 0;
  };

  console.log("[CART DEBUG] Current Items:", items);
  const subtotal = items.reduce((sum, item) => {
    const price = resolveItemPrice(item);
    console.log(
      `[CART DEBUG] Item ${item.itemNumber} price: ${price}, quantity: ${item.quantity}`,
    );
    return sum + price * item.quantity;
  }, 0);
  console.log("[CART DEBUG] Calculated Subtotal:", subtotal);
  const tax = supplier === "SRS" ? 0 : subtotal * 0.08;
  const total = subtotal + tax;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 z-10">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Shopping Cart ({items.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Account/Branch Info */}
              {supplier === "ABC Supply" && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ordering From:
                  </div>
                  {selectedShipTo ? (
                    <div className="flex items-start gap-2 mb-2">
                      <Building className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedShipTo.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Account #{selectedShipTo.number}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-500">
                      No Account Selected
                    </div>
                  )}

                  {selectedBranch ? (
                    <div className="flex items-start gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedBranch.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Branch #{selectedBranch.number}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-500">
                      No Branch Selected
                    </div>
                  )}
                </div>
              )}

              {supplier === "SRS" && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ordering From:
                  </div>
                  {srsCustomerProfile ? (
                    <div className="flex items-start gap-2 mb-2">
                      <Building className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {srsCustomerProfile.customer_details?.customerName ||
                            srsCustomerProfile.customer_details?.addressLine1 ||
                            "SRS Customer"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Customer #{getSrsCustomerCode()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-orange-600 dark:text-orange-400 mb-2">
                      {srsCustomerLoading
                        ? "Loading customer profile..."
                        : "Connect SRS in Integrations to use your saved customer code."}
                    </div>
                  )}
                  {selectedBranch ? (
                    <div className="flex items-start gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedBranch.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Branch #{selectedBranch.number || selectedBranch.id}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-500">
                      No Branch Selected
                    </div>
                  )}
                </div>
              )}

              {supplier === "QXO" && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ordering From:
                  </div>
                  {qxoProfile ? (
                    <div className="flex items-start gap-2 mb-2">
                      <Building className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {qxoProfile.messageInfo?.firstName}{" "}
                          {qxoProfile.messageInfo?.lastName} (Account #
                          {qxoProfile.accountId || qxoProfile.accountLegacyId})
                        </div>
                        <div className="text-xs text-gray-500">
                          {qxoProfile.messageInfo?.emailAddress}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-orange-600 dark:text-orange-400 mb-2">
                      {qxoLoading
                        ? "Loading Beacon profile..."
                        : "Connect Beacon Pro+ in Integrations to sync your account."}
                    </div>
                  )}
                  {selectedBranch ? (
                    <div className="flex items-start gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedBranch.name || selectedBranch.branchName}
                        </div>
                        <div className="text-xs text-gray-500">
                          Branch #
                          {selectedBranch.number ||
                            selectedBranch.branchNumber ||
                            selectedBranch.id}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-500">
                      No Branch Selected
                    </div>
                  )}
                </div>
              )}

              {/* Shipping Address Inputs - Simplified for Cart view, full form in Checkout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {supplier === "QXO"
                    ? "Destination Zip Code"
                    : "Shipping Preview"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={
                      supplier === "QXO"
                        ? "Enter zip code for tax estimation"
                        : "Zip Code for Tax Est."
                    }
                    value={shipToAddress.zipCode}
                    onChange={(e) =>
                      setShipToAddress({
                        ...shipToAddress,
                        zipCode: e.target.value
                          .replace(/[^0-9]/g, "")
                          .slice(0, 10),
                      })
                    }
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* QXO Disclaimer */}
              {supplier === "QXO" && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg p-3">
                  <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed italic">
                    <strong>Tax & Availability Notice:</strong> Sales tax is
                    calculated based on the delivery destination. Final
                    availability and delivery charges will be confirmed by
                    Beacon Pro+ upon order submission.
                  </p>
                </div>
              )}

              {items.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
              )}

              {/* Cart Items */}
              <div>
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Your cart is empty
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div
                        key={`${item.itemNumber}-${index}`}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                            {item.productImageUrl ||
                            item.productVariants?.[0]?.variantImageURL ||
                            (supplier === "QXO" &&
                              (item.productImage || item.image)) ? (
                              <img
                                src={
                                  supplier === "QXO"
                                    ? formatQxoImage(
                                        item.productImage || item.image,
                                      )
                                    : item.productImageUrl ||
                                      item.productVariants?.[0]?.variantImageURL
                                }
                                alt={
                                  item.itemDescription ||
                                  item.familyName ||
                                  (item as any).productName ||
                                  (item as any).name
                                }
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  e.currentTarget.nextElementSibling?.classList.remove(
                                    "hidden",
                                  );
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ShoppingCart className="w-6 h-6 mb-1 opacity-50" />
                                <span className="text-[10px] font-medium uppercase">
                                  No Img
                                </span>
                              </div>
                            )}
                            <div
                              className={`${item.productImageUrl || item.productVariants?.[0]?.variantImageURL || (supplier === "QXO" && (item.productImage || item.image)) ? "hidden" : ""} w-full h-full flex flex-col items-center justify-center text-gray-400`}
                            >
                              <ShoppingCart className="w-6 h-6 mb-1 opacity-50" />
                              <span className="text-[10px] font-medium uppercase">
                                No Img
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            {/* Header */}
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-3">
                                  {item.itemDescription ||
                                    item.familyName ||
                                    `Item ${item.itemNumber}`}
                                </h3>
                                <button
                                  onClick={() =>
                                    onRemoveItem(
                                      (item as any).cartKey || item.itemNumber,
                                    )
                                  }
                                  className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1 -mt-1"
                                  title="Remove item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="flex flex-col gap-0.5 mt-1 text-xs">
                                <span className="text-gray-500 dark:text-gray-400 uppercase font-medium tracking-wider">
                                  {item.familyName}
                                </span>
                                <span className="text-primary-600 dark:text-primary-400 font-mono font-medium">
                                  #{item.itemNumber}
                                </span>
                                {/* Show selected option & UOM for SRS */}
                                {(item as any).selectedOption && (
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-300 border-l-2 border-primary-500 pl-1.5">
                                      {(item as any).selectedOption}
                                    </span>
                                    {(item as any).selectedUOM && (
                                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        · {(item as any).selectedUOM}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                                <button
                                  onClick={() =>
                                    onUpdateQuantity(
                                      (item as any).cartKey || item.itemNumber,
                                      Math.max(1, item.quantity - 1),
                                    )
                                  }
                                  className="w-7 h-7 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded-md shadow-sm transition-all"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    onUpdateQuantity(
                                      (item as any).cartKey || item.itemNumber,
                                      item.quantity + 1,
                                    )
                                  }
                                  className="w-7 h-7 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 rounded-md shadow-sm transition-all"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                {(() => {
                                  const pNum = resolveItemPrice(item);
                                  const status =
                                    srsPriceStatus[item.itemNumber];
                                  const hasStatusMessage = Boolean(
                                    status?.message,
                                  );

                                  if (pNum > 0) {
                                    return (
                                      <div className="flex flex-col items-end">
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                          ${(pNum * item.quantity).toFixed(2)}
                                        </div>
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                          ${pNum.toFixed(2)} /{" "}
                                          {(item as any).selectedUOM ||
                                            resolveSrsUom(item)}
                                        </span>
                                        {hasStatusMessage && (
                                          <span className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                                            {status?.message}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  }

                                  return (
                                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
                                      {hasStatusMessage
                                        ? status?.message
                                        : "Call for Price"}
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 flex-shrink-0 z-10">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                {supplier !== "SRS" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax (8%):
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                )}
                {supplier === "SRS" && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-lg p-3 mt-2">
                    <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed italic">
                      <strong>Tax & Delivery Notice:</strong> SRS Distribution does not provide tax or delivery fee calculations prior to order placement. The subtotal shown here reflects product costs only. Final taxes and delivery charges will be calculated and applied by SRS exclusively upon order submission.
                    </p>
                  </div>
                )}
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-base font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-primary-600 dark:text-primary-400">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={!selectedBranch || items.length === 0}
                className="w-full px-4 py-3 text-sm font-bold uppercase tracking-widest text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {orderSuccess && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm shadow-2xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-700 shadow-2xl transform animate-in zoom-in-95 duration-300">
            {/* Status Header */}
            <div className="bg-green-50 dark:bg-green-900/10 p-8 flex flex-col items-center border-b border-green-100/50 dark:border-green-900/20">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                {lastSrsResponse?.message || "Order Placed!"}
              </h3>
              <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mt-1">
                Successfully Submitted
              </p>
            </div>

            {/* Order Details Receipt */}
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                {lastSrsResponse?.transactionID && (
                  <div className="flex flex-col gap-1 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Transaction ID
                    </span>
                    <code className="text-[13px] font-mono font-bold text-primary-600 dark:text-primary-400 truncate">
                      {lastSrsResponse.transactionID}
                    </code>
                  </div>
                )}

                {lastSrsResponse?.orderID && (
                  <div className="flex flex-col gap-1 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      SRS Order ID
                    </span>
                    <code className="text-[13px] font-mono font-bold text-gray-900 dark:text-white truncate">
                      {lastSrsResponse.orderID}
                    </code>
                  </div>
                )}
              </div>

              <p className="text-center text-[11px] text-gray-500 dark:text-gray-400 font-medium px-4 leading-relaxed">
                Your order has been queued for processing. You can track its
                status in the Order History tab.
              </p>

              <button
                onClick={() => {
                  setOrderSuccess(false);
                  setLastSrsResponse(null);
                  onClose();
                }}
                className="w-full bg-[#050914] hover:bg-black text-white text-[11px] font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Form */}
      <CheckoutForm
        isOpen={showCheckoutForm}
        onClose={() => setShowCheckoutForm(false)}
        onSubmit={handleCheckoutSubmit}
        loading={loading}
        supplier={supplier}
        srsCustomerProfile={srsCustomerProfile}
        initialData={{
          shippingAddress: {
            name: shipToAddress.name || "",
            line1: shipToAddress.addressLine1 || "",
            city: shipToAddress.city || "",
            state: shipToAddress.state || "",
            zipCode: shipToAddress.zipCode || "",
          },
          contact: {
            name: "",
            email: "",
            phone: "",
          },
          deliveryDate: (() => {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            return nextWeek.toISOString().split("T")[0];
          })(),
          instructions: "",
          jobNumber:
            qxoProfile?.accountId || qxoProfile?.accountLegacyId || "678204",
        }}
      />
    </div>
  );
};

export default ShoppingCartComponent;
