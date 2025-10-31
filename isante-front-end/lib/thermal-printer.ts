// Thermal Printer Utilities for Payment Receipts

export interface ReceiptData {
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  clinicEmail?: string
  clinicWebsite?: string
  clinicLogoText?: string
  receiptFooterMessage?: string
  receiptContactMessage?: string
  receiptNumber: string
  date: string
  time: string
  patientName: string
  patientId: string
  patientNumber?: string
  items: ReceiptItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  paymentMethod: string
  paymentReference?: string
  cashierName: string
  footerMessage?: string
}

export interface ReceiptItem {
  name: string
  quantity: number
  unitPrice: number
  total: number
}

export interface ThermalPrinterConfig {
  printerName?: string
  paperWidth: number // in characters
  fontSize?: 'small' | 'medium' | 'large'
  showLogo?: boolean
  logoText?: string
}

export class ThermalPrinter {
  private config: ThermalPrinterConfig

  constructor(config: ThermalPrinterConfig = { paperWidth: 40 }) {
    this.config = {
      paperWidth: 40,
      fontSize: 'medium',
      showLogo: true,
      logoText: 'Seeing is Life',
      ...config
    }
  }

  /**
   * Format receipt for thermal printer
   */
  formatReceipt(data: ReceiptData): string {
    const { paperWidth } = this.config
    const center = (text: string) => this.centerText(text, paperWidth)
    const right = (text: string) => this.rightAlignText(text, paperWidth)
    const line = () => '-'.repeat(paperWidth)
    const doubleLine = () => '='.repeat(paperWidth)

    let receipt = ''

    // Header
    receipt += center(data.clinicName) + '\n'
    if (this.config.showLogo) {
      receipt += center(this.config.logoText || 'Seeing is Life') + '\n'
    }
    receipt += center(data.clinicAddress) + '\n'
    receipt += center(data.clinicPhone) + '\n'
    receipt += doubleLine() + '\n'

    // Receipt details
    receipt += `Receipt #: ${data.receiptNumber}\n`
    receipt += `Date: ${data.date}\n`
    receipt += `Time: ${data.time}\n`
    receipt += `Cashier: ${data.cashierName}\n`
    receipt += line() + '\n'

    // Patient information
    receipt += 'PATIENT INFORMATION\n'
    receipt += line() + '\n'
    receipt += `Name: ${data.patientName}\n`
    if (data.patientNumber) {
      receipt += `Patient #: ${data.patientNumber}\n`
    } else {
      receipt += `ID: ${data.patientId}\n`
    }
    receipt += line() + '\n'

    // Items
    receipt += 'ITEMS\n'
    receipt += line() + '\n'
    receipt += this.formatItemsHeader() + '\n'
    receipt += line() + '\n'

    data.items.forEach(item => {
      receipt += this.formatItem(item) + '\n'
    })

    receipt += line() + '\n'

    // Totals
    receipt += right(`Subtotal: ${this.formatCurrency(data.subtotal)}`) + '\n'
    if (data.taxAmount > 0) {
      receipt += right(`Tax: ${this.formatCurrency(data.taxAmount)}`) + '\n'
    }
    receipt += doubleLine() + '\n'
    receipt += right(`TOTAL: ${this.formatCurrency(data.totalAmount)}`) + '\n'
    receipt += right(`PAID: ${this.formatCurrency(data.amountPaid)}`) + '\n'
    if (data.balanceDue > 0) {
      receipt += right(`BALANCE: ${this.formatCurrency(data.balanceDue)}`) + '\n'
    } else {
      receipt += right('BALANCE: PAID IN FULL') + '\n'
    }
    receipt += doubleLine() + '\n'

    // Payment information
    receipt += 'PAYMENT INFORMATION\n'
    receipt += line() + '\n'
    receipt += `Method: ${data.paymentMethod}\n`
    if (data.paymentReference) {
      receipt += `Reference: ${data.paymentReference}\n`
    }
    receipt += line() + '\n'

    // Footer
    if (data.footerMessage) {
      receipt += center(data.footerMessage) + '\n'
    }
    receipt += center('Thank you for choosing Eye Sante Clinic') + '\n'
    receipt += center('For inquiries: ' + data.clinicPhone) + '\n'
    receipt += doubleLine() + '\n'
    receipt += center('System Developed and Maintained by:') + '\n'
    receipt += center('Rossum Tech Systems Company Ltd') + '\n'
    receipt += center('Contact: +256 770 963649 / +256 759 486 375') + '\n'
    receipt += doubleLine() + '\n'
    receipt += center('This is a computer generated receipt') + '\n'
    receipt += center('No signature required') + '\n'

    return receipt
  }

  /**
   * Format items header
   */
  private formatItemsHeader(): string {
    const { paperWidth } = this.config
    const nameWidth = Math.floor(paperWidth * 0.4)
    const qtyWidth = Math.floor(paperWidth * 0.15)
    const priceWidth = Math.floor(paperWidth * 0.2)
    const totalWidth = Math.floor(paperWidth * 0.25)

    return (
      this.padRight('Item', nameWidth) +
      this.padLeft('Qty', qtyWidth) +
      this.padLeft('Price', priceWidth) +
      this.padLeft('Total', totalWidth)
    )
  }

  /**
   * Format individual item
   */
  private formatItem(item: ReceiptItem): string {
    const { paperWidth } = this.config
    const nameWidth = Math.floor(paperWidth * 0.4)
    const qtyWidth = Math.floor(paperWidth * 0.15)
    const priceWidth = Math.floor(paperWidth * 0.2)
    const totalWidth = Math.floor(paperWidth * 0.25)

    const itemName = item.name.length > nameWidth - 1 
      ? item.name.substring(0, nameWidth - 4) + '...'
      : item.name

    return (
      this.padRight(itemName, nameWidth) +
      this.padLeft(item.quantity.toString(), qtyWidth) +
      this.padLeft(this.formatCurrency(item.unitPrice), priceWidth) +
      this.padLeft(this.formatCurrency(item.total), totalWidth)
    )
  }

  /**
   * Center align text
   */
  private centerText(text: string, width: number): string {
    const padding = Math.max(0, width - text.length)
    const leftPadding = Math.floor(padding / 2)
    const rightPadding = padding - leftPadding
    return ' '.repeat(leftPadding) + text + ' '.repeat(rightPadding)
  }

  /**
   * Right align text
   */
  private rightAlignText(text: string, width: number): string {
    const padding = Math.max(0, width - text.length)
    return ' '.repeat(padding) + text
  }

  /**
   * Pad text to the right
   */
  private padRight(text: string, width: number): string {
    return text + ' '.repeat(Math.max(0, width - text.length))
  }

  /**
   * Pad text to the left
   */
  private padLeft(text: string, width: number): string {
    return ' '.repeat(Math.max(0, width - text.length)) + text
  }

  /**
   * Format currency
   */
  private formatCurrency(amount: number): string {
    return `UGX ${amount.toLocaleString()}`
  }

  /**
   * Print receipt using browser print API
   */
  async printReceipt(data: ReceiptData): Promise<void> {
    const receipt = this.formatReceipt(data)
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('Unable to open print window')
    }

    // Create HTML content for printing
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .receipt { 
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                white-space: pre-wrap;
                width: 80mm;
                margin: 0 auto;
              }
              @page { margin: 0; size: 80mm auto; }
            }
            .receipt {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.2;
              white-space: pre-wrap;
              width: 80mm;
              margin: 0 auto;
              background: white;
              padding: 10px;
            }
          </style>
        </head>
        <body>
          <div class="receipt">${receipt}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  /**
   * Generate receipt data from invoice
   */
  static generateReceiptFromInvoice(invoice: any, patient: any, currentUserName?: string): ReceiptData {
    const now = new Date()
    
    return {
      clinicName: 'EYE SANTE CLINIC',
      clinicAddress: 'Plot 47, Lumumba Avenue, Nakasero, Kampala - Uganda',
      clinicPhone: '+256 758 341 772 / +256 200 979 911',
      receiptNumber: invoice.invoiceNumber || `RCP-${Date.now()}`,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      patientName: patient.firstName + ' ' + patient.lastName,
      patientId: patient.id.toString(),
      patientNumber: patient.patientNumber,
      items: invoice.invoiceItems?.map((item: any) => ({
        name: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      })) || [],
      subtotal: invoice.subtotal || 0,
      taxAmount: invoice.taxAmount || 0,
      totalAmount: invoice.totalAmount || 0,
      amountPaid: invoice.amountPaid || 0,
      balanceDue: invoice.balanceDue || 0,
      paymentMethod: invoice.paymentMethod || 'CASH',
      paymentReference: invoice.paymentReference,
      cashierName: currentUserName || invoice.createdBy || 'System',
      footerMessage: 'Keep this receipt for your records'
    }
  }
}

// Export default instance
export const thermalPrinter = new ThermalPrinter() 