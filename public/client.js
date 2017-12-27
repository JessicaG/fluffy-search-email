$(document).ready(function() {
  // the object set by the server containing valuable configuration info
  var glitchApp = window.glitchApp;

   $('#email-drink-recipe').click(function(event) {
      event.preventDefault();
      $.post('/email', function(resp) {
        alert("HERE")
      });
    });
});