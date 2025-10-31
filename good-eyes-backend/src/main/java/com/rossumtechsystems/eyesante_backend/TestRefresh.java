package com.rossumtechsystems.eyesante_backend;

import com.rossumtechsystems.eyesante_backend.entity.InventoryItem;
import com.rossumtechsystems.eyesante_backend.service.InventoryDrugService;

/**
 * Test class to help IDE language server refresh
 */
public class TestRefresh {
    public static void main(String[] args) {
        System.out.println("Testing class resolution...");
        // This should help the IDE recognize the classes
        Class<?> inventoryItemClass = InventoryItem.class;
        Class<?> serviceClass = InventoryDrugService.class;
        System.out.println("Classes found: " + inventoryItemClass.getSimpleName() + ", " + serviceClass.getSimpleName());
    }
}
