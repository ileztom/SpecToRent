-- SpecToRent Sample Data
-- Run after init.sql to populate test data
-- Passwords: user2 = "user2", user1 = "user1" (BCrypt hashed)

-- Sample users
INSERT INTO public.users (email, full_name, password, role, avatar_url) VALUES
('user2@user2.ru', 'User2', '$2a$10$BqgBP8xSX8PcC1Xym1oKCu4PL6RYLTSg9HKX0R1DTsBvflLcUe2bq', 'OWNER', 'https://api.dicebear.com/7.x/initials/svg?seed=User2');

INSERT INTO public.users (email, full_name, password, role) VALUES
('user1@user1.ru', 'User1', '$2a$10$RQnoY1NoggpSWBBkUHmrfeqcUnNhw0OLdROo.XkhwGPifoMWyfkcO', 'RENTER');

-- Sample equipment listing (owner_id = 1, first inserted user)
INSERT INTO public.rental_items (title, description, category, type, region, location, daily_price, available_count, image_url, status, owner_id) VALUES
('KAMAZ-4310', 'KAMAZ-4310 heavy-duty truck with 6x6 wheel configuration, produced since 1981.', 'Trucks', 'heavy-duty truck', 'Saint-Petersburg', 'Saint-Petersburg', 10000.00, 4, '/uploads/ce2f12f2-a361-4f77-b383-2546acab3450.jpg', 'AVAILABLE', 1);

-- Sample rental request (renter_id = 2, second inserted user; item_id = 1)
INSERT INTO public.rental_requests (item_id, renter_id, start_date, end_date, status, quantity, address) VALUES
(1, 2, '2026-02-05', '2026-02-06', 'APPROVED', 1, 'Saint-Petersburg');

-- Update contract counter
UPDATE public.contract_counter SET last_number = 2 WHERE id = 1;
