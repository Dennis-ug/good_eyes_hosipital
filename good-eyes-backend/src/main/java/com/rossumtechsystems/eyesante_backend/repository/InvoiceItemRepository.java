package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {
    
    // Find items by invoice
    List<InvoiceItem> findByInvoiceIdOrderById(Long invoiceId);
    
    // Find items by type
    List<InvoiceItem> findByItemType(String itemType);
    
    // Find items by invoice and type
    List<InvoiceItem> findByInvoiceIdAndItemType(Long invoiceId, String itemType);
} 