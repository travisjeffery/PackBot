$(document).ready(function(){
  var client = new Faye.Client('/faye', {
    timeout: 120
  });

  client.subscribe('/channel', function(message) {
    var message_data, message_html;

    message_data = {message: message.text};
    message_html = ich.message(message_data);

    $("#messages").append(message_html);
  });

  $("form#message").submit(function(event){
    event.preventDefault();
    
    $.post("/message", {message: $("textarea#message-text").val()});
  });
});
