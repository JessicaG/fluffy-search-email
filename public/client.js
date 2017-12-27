$(window).load(function() {
  
  // why can't I get into this form? 
  $('form').each(function(element){
    console.log(element);
    alert("here")
    //get the object id from the form element
    var objectId = element.find('.object-id').first().val();
    var emailAddress = $('#email-address' + objectId).val();
    console.log(objectId)
    console.log(emailAddress)

    element.submit(function(event){
      event.preventDefault(); 
      postEmail(objectId, emailAddress);
    });
  });  

  var postEmail = function( objectId, emailAddress) {
    //create the request object 
    data = { objectId: objectId, emailAddress: emailAddress};
    console.log(data)

    $.post('/email', data, function(resp) {
      console.log("inside success")
    });
  }
});