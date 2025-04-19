-- Table structure for games
DROP TABLE IF EXISTS `games`;
CREATE TABLE `games`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `provider_id` int UNSIGNED NOT NULL,
  `game_server_url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `game_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `game_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `game_code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `game_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `cover` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `technology` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `has_lobby` tinyint NOT NULL DEFAULT 0,
  `is_mobile` tinyint NOT NULL DEFAULT 0,
  `has_freespins` tinyint NOT NULL DEFAULT 0,
  `has_tables` tinyint NOT NULL DEFAULT 0,
  `only_demo` tinyint NULL DEFAULT 0,
  `rtp` bigint NOT NULL COMMENT 'Controle de RTP em porcentagem',
  `distribution` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'O nome do provedor',
  `views` bigint NOT NULL DEFAULT 0,
  `is_featured` tinyint(1) NULL DEFAULT 0,
  `show_home` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `games_provider_id_index`(`provider_id`) USING BTREE,
  INDEX `games_game_code_index`(`game_code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 14478 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- Table structure for affiliate_histories
DROP TABLE IF EXISTS `affiliate_histories`;
CREATE TABLE `affiliate_histories`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int UNSIGNED NOT NULL,
  `inviter` int UNSIGNED NOT NULL,
  `commission` decimal(20, 2) NOT NULL DEFAULT 0.00,
  `commission_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `deposited` tinyint NULL DEFAULT 0,
  `deposited_amount` decimal(10, 2) NULL DEFAULT 0.00,
  `losses` bigint NULL DEFAULT 0,
  `losses_amount` decimal(10, 2) NULL DEFAULT 0.00,
  `commission_paid` decimal(10, 2) NULL DEFAULT 0.00,
  `status` tinyint NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `receita` decimal(10, 2) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `affiliate_histories_user_id_index`(`user_id`) USING BTREE,
  INDEX `affiliate_histories_inviter_index`(`inviter`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- Table structure for providers
DROP TABLE IF EXISTS `providers`;
CREATE TABLE `providers` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `api_endpoint` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `api_key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `api_secret` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- Table structure for game_categories
DROP TABLE IF EXISTS `game_categories`;
CREATE TABLE `game_categories` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `show_home` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `game_categories_slug_unique` (`slug`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- Table structure for game sessions
DROP TABLE IF EXISTS `game_sessions`;
CREATE TABLE `game_sessions` (
  `id` varchar(191) NOT NULL,
  `player_id` varchar(191) NOT NULL,
  `game_id` varchar(191) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `mode` varchar(50) NOT NULL DEFAULT 'real',
  `status` varchar(50) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `expired_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `game_sessions_player_id_index` (`player_id`),
  KEY `game_sessions_game_id_index` (`game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for transactions
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` varchar(191) NOT NULL,
  `player_id` varchar(191) NOT NULL,
  `session_id` varchar(191) NULL,
  `game_id` varchar(191) NULL,
  `round_id` varchar(191) NULL,
  `provider` varchar(191) NOT NULL,
  `type` varchar(50) NOT NULL,
  `amount` decimal(20, 2) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `balance_before` decimal(20, 2) NULL,
  `balance_after` decimal(20, 2) NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transactions_player_id_index` (`player_id`),
  KEY `transactions_session_id_index` (`session_id`),
  KEY `transactions_round_id_index` (`round_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for players
DROP TABLE IF EXISTS `players`;
CREATE TABLE `players` (
  `id` varchar(191) NOT NULL,
  `username` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'EUR',
  `balance` decimal(20, 2) NOT NULL DEFAULT 0.00,
  `status` varchar(50) NOT NULL DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `players_username_unique` (`username`),
  UNIQUE KEY `players_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for wallets
DROP TABLE IF EXISTS `wallets`;
CREATE TABLE `wallets` (
  `id` varchar(191) NOT NULL,
  `player_id` varchar(191) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `balance` decimal(20, 2) NOT NULL DEFAULT 0.00,
  `type` varchar(50) NOT NULL DEFAULT 'main',
  `status` varchar(50) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wallets_player_currency_unique` (`player_id`, `currency`),
  KEY `wallets_player_id_index` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
