-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: uandinaturals
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `address_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address_line_1` varchar(255) NOT NULL,
  `address_line_2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint DEFAULT '1',
  PRIMARY KEY (`address_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,2,'Test II','7904716054','365, KGISL Campus','Saravanampatti','Coimbatore','Tamil Nadu','641035','India',0,'2025-11-20 05:54:03','2025-11-24 14:37:43',1),(2,2,'Test I','8765432190','Kumarapalayam','Kumar Nagar','Coimbatore','Tamil Nadu','641035','India',0,'2025-11-20 09:45:23','2025-11-24 14:37:28',1),(3,2,'Sankar K G','9655596650','Test Address Line One','Test Address Line Two','Coimbatore','Tamil Nadu ','641035','India',1,'2025-11-20 10:06:49','2025-11-20 10:06:52',1),(4,2,'Gnanasekar','9943857565','192, Subramaniyapuram Road, Indira Nagar, ','Near Dr. Udhayakumar Hospital','Palani','Tamil Nadu','624601','India',0,'2025-11-23 16:34:16','2025-11-24 14:37:12',0);
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blogs`
--

DROP TABLE IF EXISTS `blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `excerpt` text,
  `featured_image` varchar(500) DEFAULT NULL,
  `status` enum('draft','published','hidden') DEFAULT 'draft',
  `author_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blogs`
--

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;
INSERT INTO `blogs` VALUES (1,'fsef','fsef','<p>ccvrdg</p>','fdgvrf','https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?cs=srgb&dl=pexels-anjana-c-169994-674010.jpg&fm=jpg','draft',NULL,'2025-11-10 13:27:58','2025-11-10 13:27:58'),(2,'new','new-2','<p>test file</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<ul>\n<li>hi</li>\n<li>new</li>\n<li>this is how</li>\n<li>happens</li>\n</ul>','test','https://assets.bucketlistly.blog/sites/5adf778b6eabcc00190b75b1/content_entry5adf77af6eabcc00190b75b6/6075185986d092000b192d0a/files/best-free-travel-images-main-image-hd-op.webp','published',NULL,'2025-11-10 13:30:54','2025-11-10 13:33:18'),(3,'new test blog','new-test-blog-2','<h3>Heading</h3>\n<p>this a test para</p>\n<ul>\n<li><em><strong>newone</strong></em></li>\n<li><em><strong>testone</strong></em></li>\n<li><em><strong>final one</strong></em></li>\n</ul>','new test blog','https://www.vilvahstore.com/cdn/shop/files/3_17.jpg?v=1760081058&width=1000','published',NULL,'2025-11-10 13:45:38','2025-11-10 13:45:58');
/*!40000 ALTER TABLE `blogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `cart_item_id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `product_id` int NOT NULL,
  `source_collection_id` int unsigned DEFAULT NULL,
  `variant_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `sub_total` decimal(10,2) NOT NULL,
  `variant_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_item_id`),
  UNIQUE KEY `unique_cart_item` (`user_id`,`product_id`,`variant_id`,`source_collection_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_variant_id` (`variant_id`),
  KEY `idx_collection_id` (`source_collection_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `variants` (`variant_id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_4` FOREIGN KEY (`source_collection_id`) REFERENCES `collections` (`collection_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (48,7,14,NULL,28,1,179.00,179.00,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764222939427-512c8abf536e27d97a3b8bc4-DSC00515.webp','2025-11-27 06:34:54','2025-11-27 06:34:54');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist_items`
--

DROP TABLE IF EXISTS `wishlist_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist_items` (
  `wishlist_item_id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `product_id` int NOT NULL,
  `variant_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`wishlist_item_id`),
  UNIQUE KEY `unique_wishlist_item` (`user_id`,`product_id`,`variant_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_variant_id` (`variant_id`),
  CONSTRAINT `wishlist_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `variants` (`variant_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist_items`
--

LOCK TABLES `wishlist_items` WRITE;
/*!40000 ALTER TABLE `wishlist_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlist_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `category_description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (7,'Lip Balm','','2025-11-27 05:13:04'),(8,'Hair Oil','','2025-11-27 05:13:12'),(9,'Body Butter','','2025-11-27 05:13:23'),(10,'Soap','','2025-11-27 05:13:45'),(11,'Shampoo','','2025-11-27 05:13:54');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collection_products`
--

DROP TABLE IF EXISTS `collection_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collection_products` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `collection_id` int unsigned NOT NULL,
  `product_id` int NOT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_collection_product` (`collection_id`,`product_id`),
  KEY `fk_product` (`product_id`),
  CONSTRAINT `fk_collection` FOREIGN KEY (`collection_id`) REFERENCES `collections` (`collection_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collection_products`
--

LOCK TABLES `collection_products` WRITE;
/*!40000 ALTER TABLE `collection_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `collection_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collections`
--

DROP TABLE IF EXISTS `collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collections` (
  `collection_id` int unsigned NOT NULL AUTO_INCREMENT,
  `collection_name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`collection_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collections`
--

LOCK TABLES `collections` WRITE;
/*!40000 ALTER TABLE `collections` DISABLE KEYS */;
INSERT INTO `collections` VALUES (1,'New Arrivals',1,'2025-11-19 05:51:08','2025-11-19 05:51:08'),(2,'Kids',1,'2025-11-19 05:51:08','2025-11-19 05:51:08'),(3,'Teens',1,'2025-11-19 05:51:08','2025-11-19 05:51:08'),(4,'Adults',1,'2025-11-19 05:51:08','2025-11-19 05:51:08'),(5,'Treatment',1,'2025-11-19 05:51:08','2025-11-19 05:51:08');
/*!40000 ALTER TABLE `collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupon_collections`
--

DROP TABLE IF EXISTS `coupon_collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon_collections` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `coupon_id` int unsigned NOT NULL,
  `collection_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_coupon_collection` (`coupon_id`,`collection_id`),
  KEY `collection_id` (`collection_id`),
  CONSTRAINT `coupon_collections_ibfk_1` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`coupon_id`),
  CONSTRAINT `coupon_collections_ibfk_2` FOREIGN KEY (`collection_id`) REFERENCES `collections` (`collection_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon_collections`
--

LOCK TABLES `coupon_collections` WRITE;
/*!40000 ALTER TABLE `coupon_collections` DISABLE KEYS */;
INSERT INTO `coupon_collections` VALUES (1,1,2);
/*!40000 ALTER TABLE `coupon_collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupon_user_map`
--

DROP TABLE IF EXISTS `coupon_user_map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon_user_map` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `coupon_id` int unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `used_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_coupon_user` (`coupon_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `coupon_user_map_ibfk_1` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`coupon_id`) ON DELETE CASCADE,
  CONSTRAINT `coupon_user_map_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon_user_map`
--

LOCK TABLES `coupon_user_map` WRITE;
/*!40000 ALTER TABLE `coupon_user_map` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupon_user_map` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `coupon_id` int unsigned NOT NULL AUTO_INCREMENT,
  `coupon_code` varchar(50) NOT NULL,
  `coupon_type` enum('collection','user','sales') NOT NULL,
  `discount_type` enum('percentage','flat') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `min_order_amount` decimal(10,2) DEFAULT '0.00',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `total_usage_limit` int DEFAULT '0',
  `per_user_limit` int DEFAULT '0',
  `usage_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`coupon_id`),
  UNIQUE KEY `coupon_code` (`coupon_code`),
  KEY `idx_code` (`coupon_code`),
  KEY `idx_active` (`is_active`,`start_date`,`end_date`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'SAVE45','collection','percentage',10.00,10.00,100.00,'2025-11-19 14:18:00','2025-11-26 14:18:00',1,10,1,0,'2025-11-19 08:58:37','2025-11-19 08:58:37');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `order_item_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `product_id` int NOT NULL,
  `variant_id` int DEFAULT NULL,
  `quantity` int unsigned NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `sub_total` decimal(10,2) NOT NULL,
  `source_collection_id` int unsigned DEFAULT NULL,
  `coupon_discount` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_variant` (`variant_id`),
  KEY `idx_collection` (`source_collection_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `variants` (`variant_id`),
  CONSTRAINT `order_items_ibfk_4` FOREIGN KEY (`source_collection_id`) REFERENCES `collections` (`collection_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  `address_id` bigint unsigned NOT NULL,
  `coupon_id` int unsigned DEFAULT NULL,
  `coupon_code` varchar(50) DEFAULT NULL,
  `coupon_type` enum('collection','user','general','sales') DEFAULT NULL,
  `coupon_discount` decimal(10,2) DEFAULT '0.00',
  `source_collection_id` int unsigned DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('COD','Prepaid','Card','UPI','Razorpay') NOT NULL,
  `payment_status` enum('Pending','Paid','Failed','Refunded') DEFAULT 'Pending',
  `order_status` enum('Processing','Shipped','Delivered','Cancelled') DEFAULT 'Processing',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `user_id` (`user_id`),
  KEY `address_id` (`address_id`),
  KEY `idx_coupon_id` (`coupon_id`),
  KEY `idx_coupon_type` (`coupon_type`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`address_id`),
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`coupon_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_attributes`
--

DROP TABLE IF EXISTS `product_attributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_attributes` (
  `attribute_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `key_ingredients` text,
  `know_about_product` varchar(500) DEFAULT NULL,
  `benefits` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`attribute_id`),
  KEY `fk_product_attrs_product` (`product_id`),
  CONSTRAINT `fk_product_attrs_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_attributes`
--

LOCK TABLES `product_attributes` WRITE;
/*!40000 ALTER TABLE `product_attributes` DISABLE KEYS */;
INSERT INTO `product_attributes` VALUES (4,13,'Cocos Nucifera (Coconut) Oil, Olea Europaea (Olive) Fruit Oil, Prunus Amygdalus Dulcis (Sweet Almond) Oil, Santalum Album (Sandalwood), Aloe Barbadensis (Aloe Vera) Leaf, Maranta Arundinacea (Arrowroot) Powder, Tocopherol (Vitamin E), Fragrance (Parfum).','','[{\"benefit_title\": \"Deep Moisture\", \"benefit_description\": \"Coconut, olive, and almond oils give long-lasting hydration and softness.\"}, {\"benefit_title\": \"Calms & Soothes Skin\", \"benefit_description\": \"Aloe vera and sandalwood help cool irritation and keep skin feeling relaxed.\"}, {\"benefit_title\": \"Light, Non-Greasy Feel\", \"benefit_description\": \"Arrowroot powder leaves a smooth, fresh finish without any heaviness.\"}]','2025-11-27 05:41:06','2025-11-27 05:41:06'),(5,14,'Aqua (Water), Sodium Cocoyl Isethionate, Decyl Glucoside, Cocamidopropyl Betaine, Vitis Vinifera (Red Wine), Glycerin, Panthenol, Glycol Stearate (and) Stearamide AMP, Polyquaternium-7, Disodium EDTA, Phenoxyethanol (and) Ethylhexylglycerin, Parfum (Fragrance).','','[{\"benefit_title\": \"Strengthens & Protects\", \"benefit_description\": \"Red wine antioxidants help shield your hair from damage and keep it looking healthy and revived.\"}, {\"benefit_title\": \"Soft, Hydrated Hair\", \"benefit_description\": \"Glycerin and panthenol lock in moisture, giving your strands a smooth, nourished feel.\"}, {\"benefit_title\": \"Gentle, Fresh Cleanse\", \"benefit_description\": \"Mild surfactants cleanse without stripping, leaving your hair clean, light, and softly fragrant.\"}]','2025-11-27 05:55:39','2025-11-27 05:55:39'),(6,15,'Sodium Cocoate (Coconut Oil), Sodium Palmate\n(Palm Oil), Sodium Sunflowerseedate (Sunflower\nOil), Sodium Lactate, Caprae Lac ( Goat milk)\nParfum (Fragrance).','','[{\"benefit_title\": \"Deep Hydration\", \"benefit_description\": \"Goat milk and sodium lactate keep the skin moisturised, soft, and smooth after every wash.\"}, {\"benefit_title\": \"Gentle on Skin\", \"benefit_description\": \"Coconut, palm, and sunflower oils cleanse without stripping, making it ideal for sensitive or dry skin.\"}, {\"benefit_title\": \"Nourishes & Soothes\", \"benefit_description\": \"The creamy formula calms the skin, leaving it supple, refreshed, and lightly fragrant.\"}]','2025-11-27 06:10:54','2025-11-27 06:10:54'),(7,16,'Cocos Nucifera (Coconut) Oil, Ricinus Communis (Castor) Seed Oil, Butyrospermum Parkii (Shea) Butter, Cera Alba (Beeswax), Tocopherol (Vitamin E), Flavor (Lip-Safe), Pigment (Lip-Safe), and other skin- conditioning agents.','','[{\"benefit_title\": \"Deep Nourishment\", \"benefit_description\": \"Coconut oil, castor oil, and shea butter hydrate and soften lips from within.\"}, {\"benefit_title\": \"Long-Lasting Protection\", \"benefit_description\": \"Natural beeswax forms a gentle barrier to lock in moisture and guard against dryness.\"}, {\"benefit_title\": \"Smooth, Healthy Look\", \"benefit_description\": \"Vitamin E and skin-conditioning agents keep lips supple, soothed, and naturally glossy.\"}]','2025-11-27 06:14:58','2025-11-27 06:14:58'),(8,17,'Coconut Oil (Sodium Cocoate), Palm Oil (Sodium Palmate), Sunflower Oil (Sodium Sunflowerseedate), Olive Oil (Sodium Olivate), Water (Aqua), Sodium Lactate, White Kaolin Clay (Kaolin), Pink Clay, Activated Charcoal (Charcoal Powder), Fragrance Oil(Parfum)','','[{\"benefit_title\": \"Deep Detox & Purification\", \"benefit_description\": \"Pink clay, kaolin, and activated charcoal draw out dirt, oil, and impurities for clearer skin.\"}, {\"benefit_title\": \"Gentle, Nourishing Cleanse\", \"benefit_description\": \"Coconut, palm, sunflower, and olive oils cleanse without stripping, keeping skin soft and balanced.\"}, {\"benefit_title\": \"Smooths & Refreshes Skin\", \"benefit_description\": \"The clay blend lightly exfoliates, leaving your skin fresh, refined, and naturally glowing.\"}]','2025-11-27 06:33:19','2025-11-27 06:33:19');
/*!40000 ALTER TABLE `product_attributes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `variant_id` int DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_main` tinyint(1) DEFAULT '0',
  `is_video` tinyint(1) DEFAULT '0',
  `duration_seconds` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `product_id` (`product_id`),
  KEY `variant_id` (`variant_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `product_images_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `variants` (`variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (83,13,27,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764222066850-16dd416230e72f749cf3c10b-DSC00563.webp',1,0,NULL,'2025-11-27 05:41:12'),(84,13,27,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764222067625-9069a117b65b49ab526b20e2-DSC00579.webp',0,0,NULL,'2025-11-27 05:41:12'),(85,13,27,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764222068112-989efc3dbbca4a44e9038257-DSC00583.webp',0,0,NULL,'2025-11-27 05:41:12'),(86,13,27,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764222068272-6947c17034003baec8272a36-DSC00598.webp',0,0,NULL,'2025-11-27 05:41:12'),(87,14,28,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764222939427-512c8abf536e27d97a3b8bc4-DSC00515.webp',1,0,NULL,'2025-11-27 05:55:47'),(88,14,28,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764222939593-01a1cbe3e16cf8aa6b1894b1-DSC00909.webp',0,0,NULL,'2025-11-27 05:55:47'),(89,14,28,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764222940387-1dfe2e171a23bf76c157fb47-DSC00504.webp',0,0,NULL,'2025-11-27 05:55:47'),(90,14,28,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764222940534-a7528937a0eaaab9bb01f0a1-DSC00816.webp',0,0,NULL,'2025-11-27 05:55:47'),(91,15,29,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764223854741-e5fd82da29b66e3d7c2fe110-DSC00333.webp',1,0,NULL,'2025-11-27 06:11:00'),(92,15,29,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764223855122-db0b09ae86a82c82cee984ba-DSC00370.webp',0,0,NULL,'2025-11-27 06:11:00'),(93,15,29,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764223855357-dfa4c2001b52d0e271a4f0f1-DSC00446.webp',0,0,NULL,'2025-11-27 06:11:00'),(94,15,29,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764223855863-9398e3fdcab6e4ee13ec03a7-DSC00383.webp',0,0,NULL,'2025-11-27 06:11:00'),(95,16,30,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764224098336-289af05e0b188396f95b35db-DSC00612-2.webp',1,0,NULL,'2025-11-27 06:15:04'),(96,16,30,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764224098860-a889168525bc08b215b5e74d-DSC00621.webp',0,0,NULL,'2025-11-27 06:15:04'),(97,16,30,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764224099031-5b56b805854ab54d82a5428f-DSC00647.webp',0,0,NULL,'2025-11-27 06:15:04'),(98,16,30,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764224099221-7a75b4badc933cdc2dcf2731-DSC00626.webp',0,0,NULL,'2025-11-27 06:15:04'),(99,17,31,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764225200000-fb8354f2acfa9c4d22dafb45-DSC00206.webp',1,0,NULL,'2025-11-27 06:33:25'),(100,17,31,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764225200266-377c17c6ced1474e7f015754-DSC00185.webp',0,0,NULL,'2025-11-27 06:33:25'),(101,17,31,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764225200619-e553da93fd09a228c2e681f1-DSC00249.webp',0,0,NULL,'2025-11-27 06:33:25'),(102,17,31,'https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/products%2Fimages%2F1764225200798-cbe83ba60797647e4a71259c-DSC00163.webp',0,0,NULL,'2025-11-27 06:33:25');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_reels`
--

DROP TABLE IF EXISTS `product_reels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_reels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `variant_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `video_url` varchar(500) NOT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `views_count` int DEFAULT '0',
  `status` enum('active','inactive','processing') DEFAULT 'processing',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reels`
--

LOCK TABLES `product_reels` WRITE;
/*!40000 ALTER TABLE `product_reels` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_reels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `tag_id` int DEFAULT NULL,
  `product_name` varchar(150) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`tag_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (13,9,1,'Shearoots Body Butter','A nourishing, nature-rooted blend of coconut, olive, and sweet almond oils that melts into the skin with silky ease. Sandalwood calms, aloe vera soothes, arrowroot keeps it light, and vitamin E protects. A soft fragrance completes this smooth, everyday glow ritual.',1,'2025-11-27 05:41:06','2025-11-27 05:41:06'),(14,11,2,'Red Wine Shampoo','A refreshing, antioxidant-rich cleanse powered by gentle surfactants and the goodness of red wine. It washes away buildup without stripping your strands, while glycerin and panthenol lock in moisture for a soft, healthy bounce. The formula glides through your hair with a creamy lather, leaving it clean, nourished, and faintly perfumed — like a quiet luxury moment for your everyday wash.',1,'2025-11-27 05:55:39','2025-11-27 05:55:39'),(15,10,1,'Goat Milk Moisturizing Soap','A gentle, creamy bar crafted with the old-world goodness of goat milk and nourishing plant oils. Coconut, palm, and sunflower oils cleanse without stripping, while goat milk brings that soft, milky comfort your skin instantly drinks in. Each wash leaves your skin calm, hydrated, and lightly scented — a simple, timeless cleanse made for modern days.',1,'2025-11-27 06:10:54','2025-11-27 06:10:54'),(16,7,2,'Sweet Lips Lip Balm','A buttery, melt-on-contact blend crafted to keep your lips soft the way old remedies always promised. Coconut and castor oils sink in deep, shea butter seals the moisture, and beeswax gives that natural shield against dryness. Vitamin E steps in as the quiet hero, keeping your lips nourished, smooth, and ready for the day. Finished with a lip-safe flavor and tint, it’s your everyday pocket ritual for soft, healthy, kiss-ready lips.',1,'2025-11-27 06:14:58','2025-11-27 06:14:58'),(17,10,1,'Trio Clay Soap','A detoxifying, skin-loving bar powered by the perfect trio of white kaolin clay, pink clay, and activated charcoal. Blended with nourishing coconut, palm, sunflower, and olive oils, it cleanses deeply without drying, drawing out impurities while keeping the skin soft and balanced. Each wash feels earthy, refreshing, and subtly fragrant — a simple ritual that leaves your skin renewed and clear.',1,'2025-11-27 06:33:19','2025-11-27 06:33:19');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `ratings` tinyint NOT NULL,
  `review_title` varchar(255) DEFAULT NULL,
  `review_description` text,
  `images_json` json DEFAULT (json_array()),
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `fk_reviews_product` (`product_id`),
  KEY `fk_reviews_user` (`user_id`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK ((`ratings` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'superadmin','Has full access to all system features and settings','2025-10-22 17:08:50'),(2,'admin','Manages users, content, and core operations','2025-10-22 17:08:50'),(3,'manager','Oversees teams and business processes','2025-10-22 17:08:50'),(4,'staff','Performs assigned operational tasks','2025-10-22 17:08:50'),(5,'customer','End user who purchases or uses the products/services','2025-10-22 17:08:50');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shiprocket_order_responses`
--

DROP TABLE IF EXISTS `shiprocket_order_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shiprocket_order_responses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `shiprocket_order_id` bigint unsigned DEFAULT NULL,
  `channel_order_id` varchar(255) DEFAULT NULL,
  `shipment_id` bigint unsigned DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `status_code` int DEFAULT NULL,
  `onboarding_completed_now` tinyint DEFAULT NULL,
  `awb_code` varchar(255) DEFAULT NULL,
  `courier_company_id` varchar(255) DEFAULT NULL,
  `courier_name` varchar(255) DEFAULT NULL,
  `new_channel` tinyint DEFAULT NULL,
  `packaging_box_error` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_shiprocket_orders` (`order_id`),
  CONSTRAINT `fk_shiprocket_orders` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shiprocket_order_responses`
--

LOCK TABLES `shiprocket_order_responses` WRITE;
/*!40000 ALTER TABLE `shiprocket_order_responses` DISABLE KEYS */;
/*!40000 ALTER TABLE `shiprocket_order_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shoppable_videos`
--

DROP TABLE IF EXISTS `shoppable_videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shoppable_videos` (
  `video_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `reel_url` varchar(1024) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`video_id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `shoppable_videos_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shoppable_videos`
--

LOCK TABLES `shoppable_videos` WRITE;
/*!40000 ALTER TABLE `shoppable_videos` DISABLE KEYS */;
/*!40000 ALTER TABLE `shoppable_videos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `tag_id` int NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(50) NOT NULL,
  PRIMARY KEY (`tag_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,'Bestseller'),(2,'new launch'),(3,'fresh');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonials`
--

DROP TABLE IF EXISTS `testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testimonials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(100) NOT NULL,
  `customer_image` varchar(500) DEFAULT NULL,
  `rating` tinyint NOT NULL,
  `testimonial_text` text NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `verified_purchase` tinyint(1) DEFAULT '0',
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `testimonials_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonials`
--

LOCK TABLES `testimonials` WRITE;
/*!40000 ALTER TABLE `testimonials` DISABLE KEYS */;
INSERT INTO `testimonials` VALUES (1,'Test Testimonial','https://static.wikia.nocookie.net/harrypotter/images/c/ce/Harry_Potter_DHF1.jpg/revision/latest/thumbnail/width/360/height/360?cb=20140603201724',5,'Goodd','Thudiyalur, Coimbatore',1,'approved',1,'2025-11-04 05:14:17','2025-11-04 05:14:17');
/*!40000 ALTER TABLE `testimonials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `google_id` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `profile_picture_url` varchar(255) DEFAULT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_at` datetime DEFAULT NULL,
  `last_logout_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `role_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `google_id` (`google_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone_number` (`phone_number`),
  KEY `role_id` (`role_id`),
  KEY `idx_google_id` (`google_id`),
  KEY `idx_email` (`email`),
  KEY `idx_phone_number` (`phone_number`),
  KEY `idx_refresh_token` (`refresh_token`),
  KEY `idx_reset_token` (`reset_token`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'103412267829058909224','sankarspydy@gmail.com','9655596650',NULL,'Sankar','Gnanasekar','2003-05-21','https://lh3.googleusercontent.com/a/ACg8ocIC5XuznZUkf9viodDylnP5YLvzFnCi6UujvFk9onmKbqCG4s-4=s96-c',NULL,NULL,NULL,'2025-10-24 07:15:11','2025-11-27 05:11:14','2025-11-27 05:31:49','2025-11-27 10:41:14',1,5),(3,NULL,'sankarconnectme@gmail.com','7904716054','$2b$10$0/SV/Hbp.PQQUv5nE5IZa.9sA28XbgwTadkSImHys4nE7aAZm3LUO','Sankar','Gnanasekar',NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJpYXQiOjE3NjEzMDc3OTMsImV4cCI6MTc2MTkxMjU5M30.W4_ROVN5JiErJObAeOW2-OqQQH40Rf2FrKwe8TBtjsw',NULL,NULL,'2025-10-24 07:19:34','2025-11-05 14:42:50',NULL,NULL,1,2),(4,'111033263584861869089','sidharthinfernal@gmail.com',NULL,NULL,'sidharth','babu',NULL,'https://lh3.googleusercontent.com/a/ACg8ocKVRcc96eUpHaAqLpHIrNNyNQ1T4w8Txy-SenToi_TSCkNdb7c=s96-c','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJpYXQiOjE3NjIxNjM3MjgsImV4cCI6MTc2Mjc2ODUyOH0.Np2acIW5E3CKaGCzJDp1rCuMNFC5J91XXCHN2oWPceY',NULL,NULL,'2025-10-24 12:11:34','2025-11-03 09:55:28',NULL,NULL,1,2),(5,NULL,'info@uandinaturals.com','7338873353','$2b$10$8as0MlaNq23bYFrYPJpqLOB8Pb4WHeoVzn6DS9Qiq6ENrzVFxjFvW','U&I','Naturals',NULL,NULL,NULL,NULL,NULL,'2025-10-30 09:14:32','2025-11-20 10:04:12','2025-11-20 15:29:55','2025-11-20 15:34:12',1,1),(6,'105142069784169900676','thepixelatedcafe@gmail.com',NULL,NULL,'The Pixelated','Café',NULL,'https://lh3.googleusercontent.com/a/ACg8ocJawnB30mmFgDhLjDwwMFXs7t_o2yTTng55YbyU_JbwFT8s1vg=s96-c','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJpYXQiOjE3NjI4ODU5NTMsImV4cCI6MTc2MzQ5MDc1M30.V_k4KJ-DYi_oKMW8Ci2MhlNxyM0kb4Q1s2uGQuboVuE',NULL,NULL,'2025-11-05 14:31:40','2025-11-11 18:32:33',NULL,NULL,1,5),(7,'110001161167461047905','sankarfrompalani@gmail.com',NULL,NULL,'Sankar','Gnanasekar',NULL,'https://lh3.googleusercontent.com/a/ACg8ocKRDc_TUMPCT8wdRSpEEyH5MCzkzfUbmseBYZpDfq5bJ7JYiqc=s96-c','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJpYXQiOjE3NjQyMjAyODUsImV4cCI6MTc2NDgyNTA4NX0.Q5PIRsIypVEC8i7OWCrNf_ruzrEkyHwjg7s6roGortY',NULL,NULL,'2025-11-07 06:21:07','2025-11-27 05:11:25','2025-11-27 10:41:25','2025-11-21 23:06:44',1,2);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variants`
--

DROP TABLE IF EXISTS `variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variants` (
  `variant_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `variant_name` varchar(50) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `mrp_price` decimal(10,2) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `gst_percentage` decimal(5,2) DEFAULT '0.00',
  `gst_included` tinyint(1) DEFAULT '1',
  `gst_amount` decimal(10,2) DEFAULT '0.00',
  `final_price` decimal(10,2) NOT NULL,
  `stock` int DEFAULT '0',
  `weight` decimal(10,2) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`variant_id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variants`
--

LOCK TABLES `variants` WRITE;
/*!40000 ALTER TABLE `variants` DISABLE KEYS */;
INSERT INTO `variants` VALUES (27,13,'50g','shearoots-body-butter-50g',299.00,149.00,18.00,1,22.73,149.00,50,50.00,'g','2025-11-27 05:41:12','2025-11-27 05:41:12'),(28,14,'120ml','red-wine-shampoo-120',359.00,179.00,18.00,1,27.31,179.00,50,120.00,'ml','2025-11-27 05:55:47','2025-11-27 05:55:47'),(29,15,'120g','goat-milk-soap-120',238.00,119.00,18.00,1,18.15,119.00,50,120.00,'g','2025-11-27 06:11:00','2025-11-27 06:11:00'),(30,16,'6g','sweet-lips-6',139.00,69.00,18.00,1,10.53,69.00,50,6.00,'g','2025-11-27 06:15:04','2025-11-27 06:15:04'),(31,17,'120g','trio-clay-soap-120',238.00,119.00,18.00,1,18.15,119.00,50,120.00,'g','2025-11-27 06:33:25','2025-11-27 06:33:25');
/*!40000 ALTER TABLE `variants` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-27 12:37:26
