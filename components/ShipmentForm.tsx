"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Buyer = { id: string; companyName: string };
type Product = { id: string; name: string; unitPrice: number; unitType: string };

interface LineItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  description: string;
}

export default function ShipmentForm({ buyers, products, userId }: { buyers: Buyer[]; products: Product[]; userId: string }) {
  const router = useRouter();
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { productId: "", quantity: 1, unitPrice: 0, description: "" },
  ]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [total, setTotal] = useState(0);

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    if (field === "productId") {
      const product = products.find(p => p.id === value);
      updated[index].productId = value;
      updated[index].unitPrice = product?.unitPrice || 0;
      updated[index].description = product?.name || "";
    } else if (field === "quantity") {
      const qty = typeof value === "number" && !isNaN(value) ? value : 1;
      updated[index].quantity = qty;
    } else {
      updated[index][field] = value;
    }
    setLineItems(updated);
    recalcTotals(updated, discount, shippingCharge);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { productId: "", quantity: 1, unitPrice: 0, description: "" }]);
  };

  const recalcTotals = (items: LineItem, disc: number, ship: number) => {
    const sub = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
    setSubtotal(sub);
    setTotal(sub - disc + ship);
  };

  const handleDiscountChange = (val: number) => {
    setDiscount(isNaN(val) ? 0 : val);
    recalcTotals(lineItems, isNaN(val) ? 0 : val, shippingCharge);
  };

  const handleShippingChange = (val: number) => {
    setShippingCharge(isNaN(val) ? 0 : val);
    recalcTotals(lineItems, discount, isNaN(val) ? 0 : val);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const shipmentData = {
      buyerId: formData.get("buyerId"),
      shipmentNumber: formData.get("shipmentNumber"),
      shipmentDate: formData.get("shipmentDate"),
      proformaNumber: formData.get("proformaNumber"),
      lcNumber: formData.get("lcNumber"),
      portOfLoading: formData.get("portOfLoading"),
      portOfDischarge: formData.get("portOfDischarge"),
      incoterm: formData.get("incoterm"),
      notes: formData.get("notes"),
      subtotal,
      discount,
      shippingCharge,
      totalAmount: total,
      items: lineItems.filter(item => item.productId).map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        description: item.description,
        totalPrice: item.quantity * item.unitPrice,
      })),
    };

    const res = await fetch("/api/shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shipmentData),
    });

    if (res.ok) {
      router.push("/dashboard/shipments");
    } else {
      alert("Failed to create shipment");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Buyer *</label>
          <select name="buyerId" required className="border rounded w-full p-2">
            <option value="">Select buyer</option>
            {buyers.map(b => <option key={b.id} value={b.id}>{b.companyName}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium">Shipment Number *</label>
          <input name="shipmentNumber" required className="border rounded w-full p-2" placeholder="INV-2024-001" />
        </div>
        <div>
          <label className="block font-medium">Shipment Date</label>
          <input name="shipmentDate" type="date" className="border rounded w-full p-2" />
        </div>
        <div>
          <label className="block font-medium">Proforma Invoice #</label>
          <input name="proformaNumber" className="border rounded w-full p-2" />
        </div>
        <div>
          <label className="block font-medium">LC Number</label>
          <input name="lcNumber" className="border rounded w-full p-2" />
        </div>
        <div>
          <label className="block font-medium">Port of Loading</label>
          <input name="portOfLoading" className="border rounded w-full p-2" placeholder="Karachi" />
        </div>
        <div>
          <label className="block font-medium">Port of Discharge</label>
          <input name="portOfDischarge" className="border rounded w-full p-2" placeholder="Hamburg" />
        </div>
        <div>
          <label className="block font-medium">Incoterm</label>
          <select name="incoterm" className="border rounded w-full p-2">
            <option value="FOB">FOB</option>
            <option value="CIF">CIF</option>
            <option value="EXW">EXW</option>
            <option value="CFR">CFR</option>
          </select>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Line Items</h2>
        <table className="min-w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-1 text-left">Product</th>
              <th className="px-2 py-1 text-left">Quantity</th>
              <th className="px-2 py-1 text-left">Unit Price</th>
              <th className="px-2 py-1 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => (
              <tr key={idx}>
                <td className="px-2 py-1">
                  <select
                    value={item.productId}
                    onChange={(e) => updateLineItem(idx, "productId", e.target.value)}
                    className="border rounded w-full p-1"
                  >
                    <option value="">Select product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      updateLineItem(idx, "quantity", isNaN(val) ? 1 : val);
                    }}
                    className="border rounded w-24 p-1"
                  />
                </td>
                <td className="px-2 py-1">{item.unitPrice}</td>
                <td className="px-2 py-1">{item.quantity * item.unitPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addLineItem} className="mt-2 text-blue-600">+ Add Item</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Discount (USD)</label>
          <input type="number" value={discount} onChange={(e) => handleDiscountChange(parseFloat(e.target.value))} className="border rounded w-full p-2" />
        </div>
        <div>
          <label className="block font-medium">Shipping Charge (USD)</label>
          <input type="number" value={shippingCharge} onChange={(e) => handleShippingChange(parseFloat(e.target.value))} className="border rounded w-full p-2" />
        </div>
      </div>

      <div className="border-t pt-4">
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
      </div>

      <div>
        <label className="block font-medium">Notes</label>
        <textarea name="notes" rows={3} className="border rounded w-full p-2" />
      </div>

      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Create Shipment</button>
    </form>
  );
}