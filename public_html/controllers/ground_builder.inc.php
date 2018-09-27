<?php
// Populate cable, ferrule, and clamp options from database
// index % 2: 0 - Ground, 1 - Jumper; index > 1: Cluster
$cable_types = array('Ground', 'Jumper', 'Cluster Ground', 'Cluster Jumper');
$gauges = getValuesFromGroup($dbc,'AWG');
$colors = getValuesFromGroup($dbc,'Jacket Color');
$kvs = getValuesFromGroup($dbc,'KV Rating');
$styles = getValuesFromGroup($dbc,'Clamp Style');
$connections = getValuesFromGroup($dbc,'Connection Type');
$ferr_mat = getValuesFromGroup($dbc,'Ferrule Material');
// TODO clamp sizes
?>
