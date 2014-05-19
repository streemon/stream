$(document).on("click", ".show-trigger", function(event){
    event.preventDefault();
    $(this).closest('div').next('.show-victim').toggle();
}); 