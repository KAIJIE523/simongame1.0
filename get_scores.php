<?php
$file = 'scores.txt';
$scores = file_exists($file) ? file($file, FILE_IGNORE_NEW_LINES) : [];
echo json_encode(array_slice($scores, 0, 10));
?>