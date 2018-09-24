<?php
// Populate cable, ferrule, and clamp options from database
// index % 2: 0 - Ground, 1 - Jumper; index > 1: Cluster
$cable_types = array('Ground', 'Jumper', 'Cluster Ground', 'Cluster Jumper');
//$gauges = 
$gauges = getValuesFromGroup($dbc,'AWG');
$colors = getValuesFromGroup($dbc,'Jacket Color');
$kvs = getValuesFromGroup($dbc,'KV Rating');
$styles = getValuesFromGroup($dbc,'Clamp Style');

/*
Of special note is the `grounds_data` table which is not technically required for this project but was included for context. This table is used to store the relevant information for every cable that we build or test.

Note that the `clamp1_id` and `clamp2_id` columns reference the `clamps` table. Note that the `clamps` table has a unique key on (`style_id`,`is_large`,`is_threaded`,`kv`) and has a manufacturer and model number column - this was intended as the default clamp fitting those criteria but as can be seen above, it has lead to an obtuse and restrictive algorithm that has to be reevaluated any time
a new style or other option is added (such as all angle and insulated jumper clamps).

Furthermore, the table was created with the assumption (which is generally but not always true) that the phases of a cluster cable always have identical length and clamp + ferrule configurations.

Obviously this table will need to be refactored at some point but it provides useful context for the code seen here and elsewhere.
 */
$stock_clamps = array();
?>
