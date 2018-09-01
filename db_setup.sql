/* Create database and default database user */
CREATE DATABASE IF NOT EXISTS `grounds`;
CREATE USER 'dbuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON `grounds`.* TO 'dbuser'@'localhost';
USE `grounds`;
SET `foreign_key_checks`=0;

/* Relevant portions of current DB schema */
DROP TABLE IF EXISTS `grounds_data`;
CREATE TABLE IF NOT EXISTS `grounds_data` (
  `serial_id` BIGINT(20) UNSIGNED NOT NULL,
  `gauge` TINYINT(4) NOT NULL,
  `length` TINYINT(3) UNSIGNED NOT NULL,
  `phase_length` TINYINT(3) UNSIGNED NOT NULL DEFAULT '0',
  `color_id` TINYINT(3) UNSIGNED NOT NULL DEFAULT '1',
  `is_jumper` TINYINT(1) UNSIGNED NOT NULL,
  `is_cluster` TINYINT(1) UNSIGNED NOT NULL,
  `jacket_kv` TINYINT(3) UNSIGNED DEFAULT NULL,
  /* Clamp IDs are used to display clamp description since historically there was no tie-in to an inventory item */
  `clamp1_id` TINYINT(3) UNSIGNED NOT NULL,
  `clamp2_id` TINYINT(3) UNSIGNED NOT NULL,
  PRIMARY KEY (`serial_id`),
  #FOREIGN KEY (`serial_id`) REFERENCES `serial_numbers` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY (`gauge`) REFERENCES `wire_gauges` (`gauge`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (`color_id`) REFERENCES `jacket_colors` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (`jacket_kv`) REFERENCES `jacket_kvs` (`kv`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (`clamp1_id`) REFERENCES `clamps` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (`clamp2_id`) REFERENCES `clamps` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/* Cable-related tables */
DROP TABLE IF EXISTS `elbow_clamp_kvs`;
CREATE TABLE IF NOT EXISTS `elbow_clamp_kvs` (
  `kv` TINYINT(3) UNSIGNED NOT NULL,
  PRIMARY KEY (`kv`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `elbow_clamp_kvs` VALUES (5),(15),(25),(35);

DROP TABLE IF EXISTS `clamp_styles`;
CREATE TABLE IF NOT EXISTS `clamp_styles` (
  `id` TINYINT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `style` VARCHAR(16) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `clamp_styles` VALUES (1,'C-Clamp'),(2,'Duckbill'),(3,'Flat Face'),(4,'Elbow'),(5,'Ball Stud'),(6,'Tower'),(7,'Parrot Bill'),(8,'Spiking Clamp'),(9,'Cabinet Bushing'),(10,'Ferrule Only'),(11,'Other');

DROP TABLE IF EXISTS `clamps`;
CREATE TABLE IF NOT EXISTS `clamps` (
  `id` TINYINT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `style_id` TINYINT(3) UNSIGNED NOT NULL,
  `is_large` TINYINT(1) UNSIGNED NOT NULL,
  `is_threaded` TINYINT(1) UNSIGNED NOT NULL,
  `kv` TINYINT(3) UNSIGNED DEFAULT NULL,
  `manufacturer` VARCHAR(32) NOT NULL,
  `model_number` VARCHAR(16) NOT NULL,
  `url` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `style_id` (`style_id`,`is_large`,`is_threaded`,`kv`),
  FOREIGN KEY (`style_id`) REFERENCES `clamp_styles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (`kv`) REFERENCES `elbow_clamp_kvs` (`kv`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `clamps` VALUES (1,1,0,0,NULL,'Chance','C6002276','http://www.hubbellpowersystems.com/lineman/grounding/clamps/c-type/c6002276.asp'),(2,1,1,0,NULL,'Chance','C6002281','http://www.hubbellpowersystems.com/lineman/grounding/clamps/c-type/c6002281.asp'),(3,1,0,1,NULL,'Chance','T6002708','http://www.hubbellpowersystems.com/lineman/grounding/clamps/c-type/t6002708.asp'),(4,1,1,1,NULL,'Chance','C6002256','http://www.hubbellpowersystems.com/lineman/grounding/clamps/c-type/c6002256.asp'),(5,2,0,0,NULL,'Chance','G3622-1','http://www.hubbellpowersystems.com/lineman/grounding/clamps/snap-on/g36221.asp'),(6,2,1,0,NULL,'Chance','C6000434','http://www.hubbellpowersystems.com/lineman/grounding/clamps/snap-on/c6000434.asp'),(7,2,0,1,NULL,'Chance','C6001734','http://www.hubbellpowersystems.com/lineman/grounding/clamps/snap-on/c6001734.asp'),(8,2,1,1,NULL,'Chance','C6000197','http://www.hubbellpowersystems.com/lineman/grounding/clamps/snap-on/c6000197.asp'),(9,3,0,0,NULL,'Chance','G33634SJ','http://www.hubbellpowersystems.com/lineman/grounding/clamps/tower-flat-face/g336'),(10,3,1,0,NULL,'Chance','G33633SJ','http://www.hubbellpowersystems.com/lineman/grounding/clamps/tower-flat-face/g336'),(11,3,0,1,NULL,'Chance','C6001735','http://www.hubbellpowersystems.com/lineman/grounding/clamps/tower-flat-face/c600'),(12,3,1,1,NULL,'Chance','C6002231','http://www.hubbellpowersystems.com/lineman/grounding/clamps/tower-flat-face/C600'),(13,4,0,1,15,'Chance','215GEHSG',NULL),(14,4,0,1,25,'Chance','225GEHSG',NULL),(15,4,1,1,25,'Chance','225GEHSG',NULL),(16,4,1,1,35,'Chance','235GEHSH',NULL),(17,5,0,0,NULL,'Chance','C6002300','http://www.hubbellcatalog.com/hps/datasheet.asp?PN=C6002300'),(18,5,0,1,NULL,'Chance','C6002100','http://www.hubbellcatalog.com/hps/datasheet.asp?PN=C6002100'),(19,6,0,0,NULL,'Chance','G422810SJ','http://www.hubbellcatalog.com/hps/datasheet.asp?PN=g422810sj'),(20,6,0,1,NULL,'Chance','T6001693','http://www.hubbellcatalog.com/hps/datasheet.asp?PN=t6001693'),(21,7,0,0,NULL,'Safety Line','7314T',NULL),(22,7,0,1,NULL,'Safety Line','7314P',NULL),(23,8,0,0,NULL,'Chance','C6001626','http://www.hubbellcatalog.com/hps/datasheet.asp?PN=C6001626&FAM=personal_groundi'),(24,8,0,1,NULL,'Salisbury','20867',NULL),(25,9,0,0,15,'Chance','',NULL),(26,9,0,0,25,'Chance','',NULL),(27,9,0,1,35,'Chance','',NULL),(28,11,0,0,NULL,'Please specify','',NULL),(29,11,1,0,NULL,'Please specify','',NULL),(30,11,0,1,NULL,'Please specify','',NULL),(31,11,1,1,NULL,'Please specify','',NULL),(32,10,0,0,NULL,'','',NULL),(33,10,1,0,NULL,'','',NULL),(34,10,0,1,NULL,'','',NULL),(35,10,1,1,NULL,'','',NULL);

DROP TABLE IF EXISTS `jacket_colors`;
CREATE TABLE IF NOT EXISTS `jacket_colors` (
  `id` TINYINT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `color` VARCHAR(8) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `jacket_colors` VALUES (1,'Clear'),(2,'Yellow'),(3,'Orange'),(4,'Red'),(5,'Black'),(6,'Green'),(7,'Blue');

DROP TABLE IF EXISTS `jacket_kvs`;
CREATE TABLE IF NOT EXISTS `jacket_kvs` (
  `kv` TINYINT(3) UNSIGNED NOT NULL,
  PRIMARY KEY (`kv`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `jacket_kvs` VALUES (5),(15),(25),(35);

DROP TABLE IF EXISTS `wire_gauges`;
CREATE TABLE IF NOT EXISTS `wire_gauges` (
  `gauge` TINYINT(4) NOT NULL,
  PRIMARY KEY (`gauge`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `wire_gauges` VALUES (-4),(-2),(-1),(2);

/* Inventory-related tables */
CREATE TABLE IF NOT EXISTS `manufacturers` (
  `id` SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `manufacturers` VALUES (167, 'Ace'),(100, 'AFL'),(140, 'Aircraft Dynamics'),(72, 'ALCOA'),(110, 'Allen'),(90, 'American Pneumatic Tool Company'),(1, 'Ampact'),(66, 'Anderson'),(79, 'Aqua Seal'),(111, 'Armstrong'),(112, 'Bashlin'),(2, 'Bethea'),(3, 'Bierer'),(4, 'Bosch'),(104, 'Briggs and Stratton'),(161, 'Brooks Utility Products'),(5, 'Buckingham'),(169, 'Buffalo Gauge'),(43, 'Bulwark'),(6, 'Burndy'),(160, 'Buzzline'),(45, 'BW Honeywell'),(159, 'Cadweld'),(7, 'Campbell'),(113, 'Carhartt'),(8, 'Cembre'),(62, 'Champion'),(9, 'Chance'),(190, 'Co-Link'),(114, 'Cobra'),(10, 'Coffing'),(11, 'Columbus McKinnon'),(80, 'Condux'),(12, 'Cooper'),(115, 'Crescent'),(116, 'Crosby'),(164, 'DBI Sala'),(13, 'DeWalt'),(117, 'Dicke Safety Products'),(89, 'Dillon'),(108, 'Dixon'),(147, 'DPL'),(48, 'Duracell'),(180, 'Dwyer'),(173, 'Dynamic Fluid Components'),(143, 'Eaton'),(14, 'Echo'),(165, 'Elvex'),(107, 'Enerpac'),(120, 'Estex'),(174, 'EZ-Up'),(15, 'Fairmont'),(157, 'Fluke'),(92, 'Gardner Bender'),(163, 'Garmin'),(186, 'Girard Industries'),(99, 'GMP'),(87, 'Green Brook Electronics'),(16, 'Greenlee'),(122, 'GSS Safety'),(52, 'Gunk'),(56, 'Harrington'),(17, 'Hastings'),(154, 'HD Electric'),(182, 'Heath Consultants'),(123, 'HI'),(18, 'Hilti'),(141, 'Hioki'),(19, 'HK Porter'),(124, 'HolmBury'),(60, 'Honda'),(20, 'Hook'),(93, 'Houston Wire and Cable Company'),(51, 'Hubbell'),(21, 'Huskie Tools'),(22, 'Husqvarna'),(23, 'Ingersoll Rand'),(125, 'Jacobs'),(24, 'Jameson'),(156, 'JBC'),(168, 'Jet'),(102, 'John Deere'),(188, 'Justus Bag'),(64, 'Kafko'),(166, 'Keeper'),(25, 'Klein Tools'),(103, 'Knopp'),(142, 'Kunz'),(153, 'Lapco'),(26, 'Lincoln'),(27, 'Little Mule'),(181, 'Ludell'),(126, 'Lufkin'),(28, 'Lug-All'),(68, 'Luminite'),(149, 'Magid'),(95, 'Makita'),(146, 'Marigold'),(150, 'Mathey Dearman'),(177, 'MC Miller'),(55, 'McMaster Carr'),(29, 'Megger'),(30, 'Milwaukee'),(50, 'Morgan Power'),(84, 'Morpac Industries, Inc.'),(127, 'MultiQuip'),(71, 'MUSTANG'),(49, 'MW Bevins'),(31, 'N&L Line Equipment'),(151, 'National Safety Apparel'),(85, 'Naval Company, Inc'),(61, 'NGK'),(144, 'Niagara'),(179, 'Nicopress'),(32, 'North'),(184, 'Northwest Wire Rope'),(162, 'NoShock'),(33, 'Novax'),(128, 'OEM'),(105, 'Omron'),(63, 'Oregon'),(129, 'Oztec'),(158, 'Paddle Plastics'),(86, 'Panduit'),(82, 'Parker'),(187, 'Pelican'),(54, 'Phillips 66'),(94, 'Pico'),(109, 'pioneer'),(130, 'PIP'),(185, 'Pipeline Industries'),(171, 'PolyWater'),(70, 'PORLINE TOOLS'),(47, 'Power Team'),(88, 'Precision Brand'),(101, 'Procell'),(200, 'Professional Plastics'),(69, 'Proline Tools'),(97, 'Proto'),(198, 'R&D Utility Products'),(34, 'Racine'),(131, 'Rasco FR'),(132, 'Raychem'),(196, 'Reed'),(81, 'Reliable'),(191, 'Ridan Composites'),(78, 'Ridgid'),(35, 'Ripley'),(197, 'rubber dynamics'),(46, 'S&C'),(36, 'Safety Line'),(37, 'Salisbury'),(58, 'Scott'),(38, 'Sherman & Reilly'),(83, 'Simonds'),(145, 'Simplex'),(59, 'Solo'),(193, 'SouthCo'),(39, 'Speed Systems'),(106, 'Spro Connex'),(40, 'Stanley'),(41, 'Stihl'),(96, 'Subaru'),(199, 'System Three'),(98, 'Tanaka'),(134, 'Tesla'),(133, 'Tiiger'),(178, 'Timber Tuff'),(42, 'Travis'),(135, 'Trystar'),(183, 'Tsurumi'),(175, 'TTC'),(91, 'Tulsa Power, LLC'),(44, 'Tyco'),(53, 'U Line'),(136, 'Ubangi'),(137, 'USA'),(77, 'Utility Solutions'),(192, 'Venture'),(170, 'Victor'),(189, 'Vizcon'),(74, 'Von'),(152, 'walbro'),(76, 'Warren Rupp'),(138, 'Weller'),(194, 'West Coast Wire Rope'),(148, 'White'),(172, 'Winters'),(176, 'Wood Owl'),(155, 'Workrite'),(139, 'Youngstown');

CREATE TABLE IF NOT EXISTS `inventory_catalog` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` INT(10) UNSIGNED NULL DEFAULT NULL COMMENT 'Main item id for alternate part numbers',
  `manufacturer_id` SMALLINT(5) UNSIGNED NOT NULL,
  `part_number` VARCHAR(32) NOT NULL,
  `description` VARCHAR(256) NOT NULL,
  `upc` VARCHAR(20) NULL DEFAULT NULL,
  `cost` MEDIUMINT(8) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Standard cost, in cents',
  `price` MEDIUMINT(8) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Standard selling price, in cents',
  `billing_min` DECIMAL(4,2) NULL DEFAULT NULL,
  `billing_ratio` DECIMAL(4,2) NULL DEFAULT 1.5,
  `calibration_rate_id` TINYINT(3) UNSIGNED NULL DEFAULT NULL,
  `stock_level` SMALLINT(5) UNSIGNED NOT NULL DEFAULT '0',
  `reorder_point` SMALLINT(5) UNSIGNED NOT NULL DEFAULT '0',
  `default_bin_id` INT(10) UNSIGNED NULL DEFAULT NULL,
  `last_editor_id` INT(10) UNSIGNED NULL DEFAULT NULL COMMENT 'Id of last user to edit this entry',
  PRIMARY KEY (`id`),
  INDEX `part_number` (`part_number`),
  UNIQUE KEY (`manufacturer_id`, `part_number`),
  FOREIGN KEY (`parent_id`) REFERENCES `inventory_catalog` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
  #FOREIGN KEY (`calibration_rate_id`) REFERENCES `calibration_rates` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  #FOREIGN KEY (`default_bin_id`) REFERENCES `warehouse_bins` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  #FOREIGN KEY (`last_editor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/* TODO: Populated inventory_catalog with available cables, ferrules and clamps */

SET `foreign_key_checks`=1;
