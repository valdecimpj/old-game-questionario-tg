<?php 

$files=scandir('../js/object');
$files=array_slice($files, 2);

$data=$files;
echo json_encode($data);

?>