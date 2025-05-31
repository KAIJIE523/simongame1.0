<?php
if (isset($_POST['score'])) {
  $score = intval($_POST['score']);
  $file = 'scores.txt';
  $scores = file_exists($file) ? file($file, FILE_IGNORE_NEW_LINES) : [];
  $scores[] = $score;
  rsort($scores, SORT_NUMERIC);
  $top = array_slice($scores, 0, 10);
  file_put_contents($file, implode(PHP_EOL, $top));
  echo "OK";
}
?>