<html>
	<head>
		<?php include'/includes/head.php' ?>
		<link rel="stylesheet" href="../Stream/css/stream.css">
		<title>
			Stream
		</title>
	</head>
	<body>
		<!-- Warning example --> <?php $_POST['error'] = array('Your account\'s picture is to big!', 'The link you tried to add already exists!'); ?>
		<!-- Info example --> <?php $_POST['info'] = array('To provide you with all our site\'s functions, we\'re using <a href="http://en.wikipedia.org/wiki/HTTP_cookie" target="_blank">cookies</a>.', 'By using this site, you agree the <a href="#">terms</a>.'); ?>
		<!-- Success example --> <?php $_POST['success'] = array('Your settings have been updated!', 'Link successfully added!'); ?>
		<?php include'includes/header.php' ?>
		<?php include'includes/movies.php' ?>
	</body>
</html>