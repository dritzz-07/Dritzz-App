import { jsPDF } from 'jspdf';
import { BookingDetails, Package } from '../types';

import logoImage from '../assets/images/regenerated_image_1779231339878.png';

export const generateInvoice = async (details: BookingDetails, pkg: Package, amount: number, paymentMethod: string, refId: string, status: string = 'completed') => {
  const doc = new jsPDF();
  
  // Header Background
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, 210, 45, 'F');
  
  // Try to load and add the logo from PNG
  try {
    const getLogoDataUrl = (): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } else {
            reject(new Error('Canvas context not available'));
          }
        };
        img.onerror = () => {
          reject(new Error('Failed to load logo PNG'));
        };
        img.src = logoImage;
      });
    };
    
    const logoDataUrl = await getLogoDataUrl();
    doc.addImage(logoDataUrl, 'PNG', 15, 8, 28, 28);
  } catch (err) {
    console.error('Failed to add logo to PDF', err);
  }

  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('DRIVE CLEAN WITHOUT LEAVING HOME', 190, 20, { align: 'right' });
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('dritzz.info@gmail.com | +91 7075504625', 190, 26, { align: 'right' });
  doc.text('GSTIN: 36XXXXXXXXXX   SAC: 998729', 190, 31, { align: 'right' });

  // Status Badge
  if (status === 'cancelled') {
    doc.setFillColor(255, 235, 235);
    doc.roundedRect(160, 50, 30, 8, 2, 2, 'F');
    doc.setTextColor(200, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CANCELLED', 175, 55.5, { align: 'center' });
  } else {
    doc.setFillColor(235, 255, 235);
    doc.roundedRect(170, 50, 20, 8, 2, 2, 'F');
    doc.setTextColor(0, 150, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PAID', 180, 55.5, { align: 'center' });
  }

  // Main Section
  doc.setTextColor(20, 20, 20);
  
  // Invoice text
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 20, 65);
  
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'bold');
  doc.text('REFERENCE ID', 20, 75);
  doc.text('ISSUE DATE', 190, 75, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.text(refId, 20, 81);
  doc.text(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), 190, 81, { align: 'right' });

  // Customer & Details Block
  doc.setFillColor(248, 248, 250);
  doc.roundedRect(20, 95, 170, 48, 3, 3, 'F');
  
  // Bill To
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 120, 120);
  doc.text('BILLED TO', 28, 106);
  doc.setTextColor(20, 20, 20);
  doc.text(details.name, 28, 114);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(details.phone, 28, 120);
  doc.text(details.email || 'N/A', 28, 126);
  
  // Service Address
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('ADDRESS', 28, 132);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const addrText = details.address || 'N/A';
  const splitAddr = doc.splitTextToSize(addrText, 70);
  doc.text(splitAddr, 28, 137);
  
  // Service Details
   doc.setFontSize(10);
   doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 120, 120);
  doc.text('SERVICE SCHEDULE', 110, 106);
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.text(details.date || '', 110, 114);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Time: ${details.timeSlot}`, 110, 120);
  
  if (details.vehicles && details.vehicles.length > 0) {
     doc.text(`Vehicles: ${details.vehicles.length} Selected`, 110, 126);
  } else {
     doc.text(`Vehicle: ${(details.vehicleType || 'N/A').toUpperCase()}`, 110, 126);
  }
  
  // Table Header
  doc.setFillColor(25, 25, 25);
  doc.roundedRect(20, 150, 170, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DESCRIPTION', 28, 156.5);
  doc.text('QTY', 125, 156.5);
  doc.text('AMOUNT', 182, 156.5, { align: 'right' });
  
  // Table Body
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  let currentY = 172;
  
  if (details.vehicles && details.vehicles.length > 0) {
     details.vehicles.forEach(v => {
         doc.text(`${pkg.name} Package (${v.type.toUpperCase()})`, 28, currentY);
         doc.setFontSize(8);
         doc.setTextColor(100, 100, 100);
         const subText = `${v.brand || 'Custom'} ${v.model || ''} ${v.vehicleNumber ? '- ' + v.vehicleNumber : ''}`;
         doc.text(subText, 28, currentY + 4);
         doc.setTextColor(40, 40, 40);
         doc.setFontSize(10);
         doc.text('1', 125, currentY);
         doc.text(`Rs. ${v.price.toFixed(2)}`, 182, currentY, { align: 'right' });
         currentY += 12;
     });
  } else {
     doc.text(`${pkg.name} Package`, 28, currentY);
     doc.text('1', 125, currentY);
     doc.text(`Rs. ${amount.toFixed(2)}`, 182, currentY, { align: 'right' });
     currentY += 12;
  }
  
  // Summary Lines
  const summaryTopIdx = Math.max(currentY + 10, 190);
  
  const baseAmount = Math.round(amount / 1.18);
  const cgst = Math.round(baseAmount * 0.09);
  const sgst = amount - baseAmount - cgst;
  
  doc.setLineWidth(0.3);
  doc.setDrawColor(220, 220, 220);
  doc.line(110, summaryTopIdx, 190, summaryTopIdx);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Subtotal:', 125, summaryTopIdx + 6);
  doc.text(`Rs. ${baseAmount.toFixed(2)}`, 182, summaryTopIdx + 6, { align: 'right' });
  
  doc.text('CGST (9%):', 125, summaryTopIdx + 11);
  doc.text(`Rs. ${cgst.toFixed(2)}`, 182, summaryTopIdx + 11, { align: 'right' });
  
  doc.text('SGST (9%):', 125, summaryTopIdx + 16);
  doc.text(`Rs. ${sgst.toFixed(2)}`, 182, summaryTopIdx + 16, { align: 'right' });
  
  doc.line(110, summaryTopIdx + 20, 190, summaryTopIdx + 20);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text('TOTAL', 125, summaryTopIdx + 30);
  doc.text(`Rs. ${amount.toFixed(2)}`, 182, summaryTopIdx + 30, { align: 'right' });
  
  // Payment Info
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT DETAILS', 20, summaryTopIdx);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`Method: ${paymentMethod.toUpperCase()}`, 20, summaryTopIdx + 6);
  doc.text(`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`, 20, summaryTopIdx + 11);
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(240, 240, 240);
  doc.line(20, pageHeight - 35, 190, pageHeight - 35);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'bold');
  doc.text('THANK YOU FOR YOUR TRUST', 105, pageHeight - 25, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer generated invoice and does not require a physical signature.', 105, pageHeight - 20, { align: 'center' });
  
  // Save PDF
  doc.save(`Dritzz_Invoice_${refId}.pdf`);
};
