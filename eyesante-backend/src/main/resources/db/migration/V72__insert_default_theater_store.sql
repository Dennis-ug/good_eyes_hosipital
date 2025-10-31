-- Insert default theater store if none exists
INSERT INTO theater_stores (name, description, location, store_type, capacity, is_active, created_at, updated_at)
SELECT 'Main Theater Store', 
       'Default theater store for stock transfers', 
       'Main Theater Building', 
       'SURGICAL', 
       1000, 
       true, 
       NOW(), 
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM theater_stores WHERE is_active = true);
