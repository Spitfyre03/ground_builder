<?php
$modules['javascript'][] = 'js/cable_builder.js';
// Populate cable, ferrule, and clamp options from database
$cable_types = array('Ground Cable', 'Jumper Cable', 'Ground Cluster', 'Jumper Cluster');
$gauges = getValuesFromGroup($dbc,'AWG');
$colors = getValuesFromGroup($dbc,'Jacket Color');
$kvs = getValuesFromGroup($dbc,'KV Rating');
$styles = getValuesFromGroup($dbc,'Clamp Style');
$connections = getValuesFromGroup($dbc,'Connection Type');
$ferr_mat = getValuesFromGroup($dbc,'Ferrule Material');
// TODO clamp sizes
?>
