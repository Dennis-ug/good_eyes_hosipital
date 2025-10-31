package com.rossumtechsystems.eyesante_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateInvoiceFromInvestigationsRequest {
    private List<Long> investigationIds;
}


