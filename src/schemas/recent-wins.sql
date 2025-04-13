
-- Recent Wins table schema
CREATE TABLE recent_wins (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_display_name VARCHAR(100),
  game_name VARCHAR(150),
  game_image_url VARCHAR(255),
  win_amount DECIMAL(20, 2),
  currency VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_recent_wins_created_at ON recent_wins(created_at);

-- Sample insert statements for testing
INSERT INTO recent_wins (user_display_name, game_name, game_image_url, win_amount, currency)
VALUES 
  ('Mupfpj...', 'Sweet Bonanza', '/game-images/sweet-bonanza.png', 227.93, 'USDT'),
  ('Hidden***', 'Aviator', '/game-images/aviator.png', 156.42, 'BCD'),
  ('Jackp...', 'Gates of Olympus', '/game-images/gates-of-olympus.png', 893.51, 'USDT');
