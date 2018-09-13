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
    `group` varchar(16) NOT NULL UNIQUE,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/* Table that contains the different values for each group. */
CREATE TABLE IF NOT EXISTS `tag_values` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `group_id` INT UNSIGNED NOT NULL,
    `value` varchar(16),
    `priority` INT UNSIGNED NOT NULL UNIQUE,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`group_id`) REFERENCES `tag_groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/* Used for assigning tags to items from inventory_catalog */
CREATE TABLE IF NOT EXISTS `tag_assign` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `item` varchar(32) NOT NULL,
    `tag_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`tag_id`) REFERENCES `tag_values` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;