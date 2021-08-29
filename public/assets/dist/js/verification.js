$(document).ready(function () {

    $('.not-first'). prop("disabled", true);
  
    $('.btn-verify'). prop("disabled", true);
  
  });   
  
  $(function() {
    'use strict';
    var body = $('body');
  
    function goToNextInput(e) {
      var key = e.which,
          t = $(e.target),
          sib = t.next('input');
  
      if (key === 9) {
        return true;
      }
  
      if (!sib || !sib.length) {
        sib = body.find('input').eq(0);
        $('.btn-verify'). prop("disabled", false);
      }
  
      sib.select().removeAttr('disabled');
      sib.select().focus();
  
    }
  
    function onFocus(e) {
      $(e.target).select();
    }
  
    body.on('keyup', 'input', goToNextInput);
    body.on('click', 'input', onFocus);

    $("#verifyFA").on("click",function(e) {
        e.preventDefault();
        let first=$("#first").val();
        let second=$("#second").val();
        let third=$("#third").val();
        let fourth=$("#fourth").val();
        let fifth=$("#fifth").val();
        let sixth=$("#sixth").val();
        let code=first+second+third+fourth+fifth+sixth;
        let userId=$("#verifyFA").attr("userId");
        //console.log(code)
        $.post(`/fa-validation/${userId}`,{
          code:code
        }).then((data)=>{
          notificationToast(data.alert, data.message)
          window.location.href = data.redirect;
        })
    })

    //Notification Function

  function notificationToast(result, message) {
    //console.log("Entro")
    switch (result) {
      case "Success":
        $.notify(
          {
            icon: "far fa-check-circle",
            message: message,
          },
          {
            type: "success",
          }
        );
        break;
      case "Error":
        //console.log("Error")
        $.notify(
          {
            icon: "far fa-times-circle",
            message: message,
          },
          {
            type: "danger",
          }
        );
        break;
    }
  }
  
  })