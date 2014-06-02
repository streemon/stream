$(document).on("click", ".show-trigger", function(event){
    event.preventDefault();
    $(this).closest('div').next('.show-victim').toggle();
}); 
$(function() {
    $('.nav a').on('click', function(){ 
        if($('.navbar-toggle').css('display') !='none'){
            $(".navbar-toggle").trigger( "click" );
        }
    });
});