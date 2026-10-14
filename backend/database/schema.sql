-- ====================================================================
-- DATABASE SCHEMA: Customer Support Management System (VerdantCare)
-- Database Engine: MySQL 8.0+
-- ====================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS customer_support_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE customer_support_db;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  avatar VARCHAR(10) DEFAULT 'CU',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(50) PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Technical',
  priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
  status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
  assigned_to VARCHAR(100) DEFAULT 'Tier-1 Triage Queue',
  resolution_purpose VARCHAR(150) DEFAULT 'General Triage & Investigation',
  resolution_plan JSON DEFAULT NULL,
  resolution_notes TEXT DEFAULT NULL,
  target_resolution_date VARCHAR(100) DEFAULT NULL,
  sentiment VARCHAR(100) DEFAULT 'Standard Inquiry',
  needs_customer_reply BOOLEAN DEFAULT FALSE,
  rating INT DEFAULT NULL,
  rating_feedback TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Ticket Messages Thread Table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id VARCHAR(50) NOT NULL,
  sender_name VARCHAR(100) NOT NULL,
  sender_role ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  avatar VARCHAR(10) DEFAULT 'CU',
  message_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Ticket Attachments Table
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size VARCHAR(50) DEFAULT 'N/A',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Knowledge Base Articles Table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id VARCHAR(50) PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  helpful_count INT DEFAULT 0,
  tags VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ====================================================================
-- SEED DATA
-- ====================================================================

-- Seed Users
INSERT INTO users (id, name, email, password, role, avatar) VALUES
(101, 'Sarah Jenkins', 'sarah.jenkins@example.com', 'password123', 'CUSTOMER', 'SJ'),
(201, 'Alex Mercer', 'alex.mercer@verdantcare.com', 'admin123', 'ADMIN', 'AM')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed Tickets
INSERT INTO tickets (id, user_id, subject, description, category, priority, status, assigned_to, sentiment, needs_customer_reply, rating, rating_feedback) VALUES
('TCK-8421', 101, 'Payment debited twice for annual subscription renewal', 'I noticed on my bank statement that Invoice #INV-9204 was debited twice at 04:15 AM today. Kindly check and process the refund for the duplicate transaction.', 'Billing', 'High', 'IN_PROGRESS', 'Alex Mercer (Billing Lead)', 'Frustrated - High Urgency', FALSE, NULL, NULL),
('TCK-8390', 101, 'Two-Factor authentication code SMS not arriving', 'Whenever I click \'Send 2FA code\', my mobile phone doesn\'t receive any text message. Carrier is T-Mobile. Please advise how I can reset my verification method.', 'Account', 'Medium', 'OPEN', 'Tier-1 Support Queue', 'Concerned - Moderate', FALSE, NULL, NULL),
('TCK-8105', 101, 'Data Export CSV export freezes at 99% in Firefox', 'Exporting analytics reports with more than 5,000 rows causes the browser tab to hang on Firefox v128. Works fine on Chromium.', 'Technical', 'Medium', 'RESOLVED', 'David Vance (Frontend Engineer)', 'Satisfied', FALSE, 5, 'Super fast technical resolution and direct communication!')
ON DUPLICATE KEY UPDATE subject=VALUES(subject);

-- Seed Ticket Messages
INSERT INTO ticket_messages (id, ticket_id, sender_name, sender_role, avatar, message_text) VALUES
(1, 'TCK-8421', 'Sarah Jenkins', 'CUSTOMER', 'SJ', 'I noticed on my bank statement that Invoice #INV-9204 was debited twice at 04:15 AM today. Kindly check and process the refund for the duplicate transaction.'),
(2, 'TCK-8421', 'Alex Mercer', 'ADMIN', 'AM', 'Hello Sarah, thank you for alerting us! I\'ve checked payment gateway logs and identified the duplicate charge from our merchant processor. I have initiated a refund of $120.00 back to your original payment method. It will reflect in 2-3 business days.'),
(3, 'TCK-8390', 'Sarah Jenkins', 'CUSTOMER', 'SJ', 'Whenever I click \'Send 2FA code\', my mobile phone doesn\'t receive any text message. Carrier is T-Mobile. Please advise how I can reset my verification method.'),
(4, 'TCK-8105', 'Sarah Jenkins', 'CUSTOMER', 'SJ', 'Exporting analytics reports with more than 5,000 rows causes the browser tab to hang on Firefox v128. Works fine on Chromium.'),
(5, 'TCK-8105', 'David Vance', 'ADMIN', 'DV', 'We deployed a hotfix addressing stream chunk buffering for Firefox. Please clear your cache and try exporting again. It now batches smoothly.'),
(6, 'TCK-8105', 'Sarah Jenkins', 'CUSTOMER', 'SJ', 'Confirmed! The CSV file downloaded within 3 seconds. Thank you so much for the quick patch!')
ON DUPLICATE KEY UPDATE message_text=VALUES(message_text);

-- Seed Knowledge Base Articles
INSERT INTO knowledge_base (id, category, title, summary, content, helpful_count, tags) VALUES
('kb-1', 'Billing', 'How to understand your monthly invoice & refund policy', 'Complete breakdown of subscription billings, tax deductions, and standard 14-day refund policy.', 'All subscriptions renew automatically unless paused prior to the cycle date. If you observe any unexpected charge, our billing department offers a no-hassle 14-day refund window for erroneous charges or unutilized service credits.', 48, 'billing,invoice,refund,receipt,charge'),
('kb-2', 'Account', 'Troubleshooting 2FA & Password Reset Delays', 'Steps to take if SMS or email verification codes are delayed or failing.', '1. Verify network coverage and disable SMS spam filters.\n2. Ensure email noreply@verdantcare.com is marked as safe sender.\n3. You can also generate one-time backup recovery codes inside Settings > Security.', 39, '2fa,password,security,login,reset'),
('kb-3', 'Technical', 'Optimizing browser cache & resolving portal loading issues', 'Quick troubleshooting methods to resolve script caching, 500 error screens, or slow page transitions.', 'Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac) to bypass stale web worker caches. Ensure third-party cookies for our auth domain are permitted.', 62, 'cache,technical,browser,speed,error,500'),
('kb-4', 'Service', 'Service Level Agreement (SLA) & Response Times', 'Learn about our response commitments across Urgent, High, Medium, and Low tickets.', 'Urgent/Critical issues receive engineer assignment within 15 minutes. High priority tickets within 1 hour. Standard questions within 4 hours during business days.', 29, 'sla,response time,policy,hours,shipping')
ON DUPLICATE KEY UPDATE title=VALUES(title);
