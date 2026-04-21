import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function generateInvoicePDF(order: any): Promise<Buffer> {
  const doc = new jsPDF() as any;

  // Header - Industrial Aesthetic
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("VELOCITY", 15, 25);
  doc.setFontSize(10);
  doc.text("PREMIUM SPORTS GEAR", 15, 32);

  doc.text("INVOICE", 160, 25);
  doc.setFontSize(8);
  doc.text(`#${order.orderNumber}`, 160, 32);

  // Customer & Order Info
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO:", 15, 55);
  doc.setFont("helvetica", "normal");
  doc.text(order.shippingAddress.fullName, 15, 62);
  doc.text(order.shippingAddress.address, 15, 67);
  doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`, 15, 72);
  doc.text(`Phone: ${order.shippingAddress.phone}`, 15, 77);

  doc.setFont("helvetica", "bold");
  doc.text("ORDER INFO:", 120, 55);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 120, 62);
  doc.text(`Payment: ${order.paymentMethod.toUpperCase()}`, 120, 67);
  doc.text(`Status: ${order.paymentStatus.toUpperCase()}`, 120, 72);

  // Items Table
  const tableData = order.items.map((item: any) => [
    item.productName,
    item.variant.sku,
    `৳${item.variant.price.toLocaleString()}`,
    item.quantity,
    `৳${item.subtotal.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: 90,
    head: [["Product", "SKU", "Price", "Qty", "Subtotal"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    styles: { fontSize: 9 },
  });

  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", 140, finalY);
  doc.text(`৳${order.subtotal.toLocaleString()}`, 180, finalY, { align: "right" });
  
  doc.text("Shipping:", 140, finalY + 7);
  doc.text(`৳${order.shippingCost.toLocaleString()}`, 180, finalY + 7, { align: "right" });

  if (order.discount > 0) {
    doc.setTextColor(16, 185, 129); // green-500
    doc.text("Discount:", 140, finalY + 14);
    doc.text(`-৳${order.discount.toLocaleString()}`, 180, finalY + 14, { align: "right" });
    doc.setTextColor(15, 23, 42);
  }

  const dividerY = order.discount > 0 ? finalY + 18 : finalY + 11;
  doc.setLineWidth(0.5);
  doc.line(140, dividerY, 195, dividerY);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total:", 140, dividerY + 10);
  doc.text(`৳${order.total.toLocaleString()}`, 180, dividerY + 10, { align: "right" });

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Thank you for choosing Velocity Sports for your elite gear.", 105, 280, { align: "center" });
  doc.text("Visit us again at: velocity-sports.com", 105, 285, { align: "center" });

  return Buffer.from(doc.output("arraybuffer"));
}
