import { thermalPrinter, ReceiptData, ThermalPrinterConfig } from '@/lib/thermal-printer'

export function useReceiptPrinter() {
  const printReceipt = async (receiptData: ReceiptData, config?: ThermalPrinterConfig) => {
    try {
      const printer = config ? new (thermalPrinter.constructor as any)(config) : thermalPrinter
      await printer.printReceipt(receiptData)
      return true
    } catch (error) {
      console.error('Failed to print receipt:', error)
      throw error
    }
  }

  const generateReceiptFromInvoice = (invoice: any, patient: any): ReceiptData => {
    return (thermalPrinter.constructor as any).generateReceiptFromInvoice(invoice, patient)
  }

  const formatReceipt = (receiptData: ReceiptData, config?: ThermalPrinterConfig): string => {
    const printer = config ? new (thermalPrinter.constructor as any)(config) : thermalPrinter
    return printer.formatReceipt(receiptData)
  }

  return {
    printReceipt,
    generateReceiptFromInvoice,
    formatReceipt,
    thermalPrinter
  }
} 