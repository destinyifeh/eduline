var tim = document.getElementById('tim');

var notebox = document.getElementById('notebox');

var userNote = document.getElementById('userNote');


userNote.addEventListener('click', function(){
    notebox.style.display='block';


});



tim.addEventListener('click', function(){
    notebox.style.display='none';

});


