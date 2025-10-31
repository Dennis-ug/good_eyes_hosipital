package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;

@Data
public class CreateInvoiceFromItemsRequest {

    private Long itemId;
    private Integer quantity;
    private String notes;
}


