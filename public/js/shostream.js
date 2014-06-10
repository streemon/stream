/* Toggle navbar on navigate */
$(function() {
    $('.nav a').on('click', function(){ 
        if($('.navbar-toggle').css('display') !='none'){
            $(".navbar-toggle").trigger( "click" );
        }
    });
});
/* Apple web app handler */
$(function() {
	window.on('load', function(){
		if(window.navigator.standalone == true) {
			var e = document.getElementById('apple-status-bar-style');
			e.style.display = 'block';
			var e = document.getElementById('apple-status-bar-margin');
			e.style.display = 'block';
		}
	});
});