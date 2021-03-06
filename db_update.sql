/* All ALTER TABLE and other commands required to update the database should be kept in this file */
USE `grounds`;

/* So we don't have to disable key checks */
DROP TABLE IF EXISTS `tag_assign`;
DROP TABLE IF EXISTS `tag_values`;
DROP TABLE IF EXISTS `tag_groups`;

/* Create the tag group table. This table defines the different component types that a cable or
 * cluster of cables can have. Each entry must contain an ID and a group name */
CREATE TABLE IF NOT EXISTS `tag_groups` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `group` VARCHAR(32) NOT NULL UNIQUE,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `tag_groups` (`group`) VALUES ('Cable Type'),('AWG'),('Jacket Color'),('KV Rating'),('Connection Type'),('Ferrule Shrouding'),('Ferrule Material'),('Clamp Style'),('Clamp Mechanism'),('Strain Relief'),('Clamp Jaw'),('Clamp Material'),('Clamp Size'),('ASTM Rating');

/* Table that contains the different values for each group. */
CREATE TABLE IF NOT EXISTS `tag_values` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `group_id` INT UNSIGNED NOT NULL,
    `value` VARCHAR(32),
    `priority` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `group-value` (`group_id`,`value`),
    CONSTRAINT `group_id` FOREIGN KEY (`group_id`) REFERENCES `tag_groups` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `tag_values` (`group_id`,`value`,`priority`) VALUES
(1,'Ground',1),(1,'Jumper',2),
(2,'#2',1),(2,'1/0',2),(2,'2/0',3),(2,'4/0',4),
(3,'Clear',1),(3,'Yellow',2),(3,'Orange',3),(3,'Red',4),(3,'Black',5),(3,'Green',6),(3,'Blue',7),
(4,'N/A',1),(4,'5',2),(4,'15',3),(4,'25',4),(4,'35',5),
(5,'Threaded',1),(5,'Pin',2),
(6,'Unshrouded',1),(6,'Shrouded',2),
(7,'Copper',1),(7,'Tin-plated Copper',2),
(8,'C-Clamp',1),(8,'Duckbill',2),(8,'Flat Face',3),(8,'Elbow',4),(8,'Ball Stud',5),(8,'Tower',6),(8,'Parrot Bill',7),(8,'Spiking Clamp',8),(8,'Cabinet Bushing',9),(8,'Ferrule Only',10),(8,'Other',11),
(9,'Eye Screw',1),(9,'T-Handle',2),(9,'Bayonet',3),
(10,'Strain Relief',1),(10,'No Strain Relief',2),
(11,'Smooth',1),(11,'Serrated',2),
(12,'Aluminum',1),(12,'Bronze',2),

(5,'Elbow',3);

/* Used for assigning tags to items from inventory_catalog */
CREATE TABLE IF NOT EXISTS `tag_assign` (
    `item_id` INT UNSIGNED NOT NULL,
    `tag_id` INT UNSIGNED NOT NULL,
    CONSTRAINT `item_id` FOREIGN KEY (`item_id`) REFERENCES `inventory_catalog` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `tag_id` FOREIGN KEY (`tag_id`) REFERENCES `tag_values` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/* Items skipped:
 * 99651
 * 99653
 * 101162
 * 111671
 * 111687
 * 111699
 * 189072
 */
INSERT INTO `tag_assign` (`item_id`,`tag_id`)VALUES
/* Cables */
(129847,2),(129847,3),(129847,16),(129847,9),
(188535,2),(188535,3),(188535,9),(188535,17),
(129848,1),(129848,3),(129848,7),(129848,14),
(129849,1),(129849,3),(129849,8),(129849,14),
(129850,2),(129850,4),(129850,9),(129850,16),
(188557,2),(188557,4),(188557,9),(188557,17),
(188560,2),(188560,4),(188560,9),(188560,18),
(129851,1),(129851,4),(129851,7),(129851,14),
(129852,1),(129852,4),(129852,8),(129852,14),
(129853,2),(129853,5),(129853,9),(129853,16),
(188534,2),(188534,5),(188534,9),(188534,17),
(188561,2),(188561,5),(188561,9),(188561,18),
(129854,1),(129854,5),(129854,7),(129854,14),
(129855,1),(129855,5),(129855,8),(129855,14),
(129856,2),(129856,6),(129856,9),(129856,16),
(188533,2),(188533,6),(188533,9),(188533,17),
(129857,1),(129857,6),(129857,7),(129857,14),
(129858,1),(129858,6),(129858,8),(129858,14),

/* Clamps */
(44191,14),(44191,19),(44191,26),(44191,39),(44191,42),(44191,43),
(44198,14),(44198,20),(44198,26),(44198,36),(44198,40),(44198,43),
(44217,14),(44217,19),(44217,26),(44217,39),(44217,41),(44217,43),
(44218,14),(44218,19),(44218,27),(44218,36),(44218,40),(44218,42),(44218,43),
(44225,14),(44225,19),(44225,25),(44225,36),(44225,37),(44225,40),(44225,41),(44225,44),
(44226,14),(44226,19),(44226,29),(44226,36),(44226,40),(44226,44),
(44232,14),(44232,19),(44232,27),(44232,37),(44232,39),(44232,44),
(44233,14),(44233,19),(44233,27),(44233,36),(44233,39),(44233,44),
(44235,14),(44235,19),(44235,25),(44235,39),(44235,42),(44235,43),
(44240,14),(44240,20),(44240,25),(44240,39),(44240,41),(44240,43),
(128702,14),(128702,20),(128702,26),(128702,41),(128702,43),
(55969,14),(55969,19),(55969,25),(55969,39),(55969,42),(55969,43),
(59047,14),(59047,20),(59047,32),(59047,36),(59047,40),(59047,43),
(99263,14),(99263,19),(99263,25),(99263,36),(99263,40),(99263,42),(99263,43),
(99264,14),(99264,19),(99264,25),(99264,36),(99264,40),(99264,41),(99264,43),
(99266,14),(99266,19),(99266,25),(99266,36),(99266,40),(99266,43),
(99267,14),(99267,19),(99267,26),(99267,41),(99267,43),
(99268,14),(99268,19),(99268,26),(99268,42),(99268,43),
(99269,14),(99269,20),(99269,26),(99269,41),(99269,43),
(99430,14),(99430,20),(99430,25),(99430,43),
(99583,14),(99583,20),(99583,26),(99583,41),(99583,43),
(99649,14),(99649,19),(99649,25),(99649,42),(99649,43),
(99650,14),(99650,19),(99650,25),(99650,42),(99650,43),
(99656,14),(99656,19),(99656,29),(99656,36),(99656,40),(99656,44),
(99687,14),(99687,20),(99687,25),(99687,36),(99687,41),(99687,43),
(100318,14),(100318,20),(100318,27),(100318,43),
(100319,14),(100319,20),(100319,27),(100319,43),
(100401,14),(100401,20),(100401,26),(100401,42),(100401,43),
(101117,14),(101117,20),(101117,25),(101117,43),
(101118,14),(101118,20),(101118,27),(101118,37),(101118,42),(101118,43),
(101119,14),(101119,20),(101119,27),(101119,37),(101119,44),
(101121,14),(101121,20),(101121,27),(101121,36),(101121,42),(101121,43),
(101122,14),(101122,20),(101122,27),(101122,36),(101122,44),
(111990,14),(111990,19),(111990,25),(111990,36),(111990,39),(111990,41),(111990,44),
(113179,14),(113179,19),(113179,25),(113179,37),(113179,40),(113179,41),(113179,43),

/* Ferrules */
(128534,3),(128534,20),(128534,21),(128534,23),
(128535,3),(128535,19),(128535,21),(128535,23),
(128536,4),(128536,20),(128536,21),(128536,23),
(128537,4),(128537,19),(128537,21),(128537,23),
(128538,5),(128538,20),(128538,21),(128538,23),
(128539,5),(128539,19),(128539,21),(128539,23),
(128540,5),(128540,19),(128540,22),(128540,23),
(128541,5),(128541,21),(128541,23),(128541,45),
(128542,6),(128542,20),(128542,21),(128542,23),
(128543,6),(128543,19),(128543,21),(128543,23),
(128544,6),(128544,19),(128544,22),(128544,23),
(44284,3),(44284,20),(44284,22),(44284,23),
(44286,5),(44286,20),(44286,22),(44286,23),
(99393,3),(99393,20),(99393,21),(99393,24),
(99395,5),(99395,20),(99395,21),(99395,24),
(99513,6),(99513,19),(99513,21),(99513,24),
(111881,4),(111881,19),(111881,21),(111881,24),
(113164,5),(113164,20),(113164,22),(113164,23);