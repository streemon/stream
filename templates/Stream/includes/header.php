<nav class="navbar navbar-default" role="navigation">
  <div class="container-fluid">
    <!-- Brand and toggle get grouped for better mobile display -->
    <div class="navbar-header">
      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>		<!-- TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO -->
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="#"><img class="navbar-logo" src="img/logo.png"></img></a>
    </div>

    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse">
      <ul class="nav navbar-nav">
        <li class="active"><a href="?Movies">Movies</a></li>
        <li><a href="?Shows">Shows</a></li>
      </ul>
      <ul class="nav navbar-nav navbar-right">
        <li class="dropdown">
			<!-- Logged out --
			  <a href="#" class="dropdown-toggle" data-toggle="dropdown">Settings <b class="caret"></b></a>
			  <ul class="dropdown-menu">
				<li><a href="#">Sign in</a></li>
				<li><a href="#">Language</a></li>
			  </ul>
			<!-- Logged out -->
			<!-- Logged in -->
			  <a href="#" class="dropdown-toggle" data-toggle="dropdown"><img src="img/1144_big.jpg" class="rounded"></img> Xiamix <b class="caret"></b><span class="badge navbar-notif">9</span></a>
			  <ul class="dropdown-menu">
				<li><a href="#">Account</a></li>
				<li><a href="#">Messages <span class="badge pull-right">2</span></a></li>
				<li><a href="#">Contribute <span class="badge pull-right">6</span></a></li>
				<li><a href="#">Moderate <span class="badge pull-right">1</span></a></li>
				<li class="divider"></li>
				<li><a href="#">Disconnect</a></li>
			  </ul>
			<!-- Logged in -->
        </li>
      </ul>
	  <form class="navbar-form navbar-right" role="search">
        <div class="form-group">
          <input type="text" class="form-control" placeholder="Skyfall, Mentalist, @xiamix, ...">
        </div>
      </form>
    </div><!-- /.navbar-collapse -->
  </div><!-- /.container-fluid -->
</nav>
<!-- Info handler -->
<?php
if(isset($_POST['info'])) { ?>
	<div class="container"><div class="col-xs-12 alert alert-info alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><?php
		foreach ($_POST['info'] as $info) {
			?><p class="text-info"><?php
			echo $info; ?></p><?php } ?>
	</div></div>
<?php } ?>
<!-- Error handler -->
<?php
if(isset($_POST['error'])) { ?>
	<div class="container"><div class="col-xs-12 alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><?php
		foreach ($_POST['error'] as $error) {
			?><p class="text-danger"><?php
			echo $error; ?></p><?php } ?>
	</div></div>
<?php } ?>
<!-- Success handler -->
<?php
if(isset($_POST['success'])) { ?>
	<div class="container"><div class="col-xs-12 alert alert-success alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><?php
		foreach ($_POST['success'] as $success) {
			?><p class="text-success"><?php
			echo $success; ?></p><?php } ?>
	</div></div>
<?php } ?>