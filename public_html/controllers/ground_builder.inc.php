<?php
$modules['javascript'][] = 'js/cable_builder.js';
// Populate cable, ferrule, and clamp options from database
// index % 2: 0 - Ground, 1 - Jumper; index > 1: Cluster
$cable_types = array('Ground Cable', 'Jumper Cable', 'Ground Cluster', 'Jumper Cluster');
$gauges = getValuesFromGroup($dbc,'AWG');
$colors = getValuesFromGroup($dbc,'Jacket Color');
$kvs = getValuesFromGroup($dbc,'KV Rating');
$styles = getValuesFromGroup($dbc,'Clamp Style');
$connections = getValuesFromGroup($dbc,'Connection Type');
$ferr_mat = getValuesFromGroup($dbc,'Ferrule Material');
// TODO clamp sizes
?>
