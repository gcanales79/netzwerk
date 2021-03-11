$(document).ready(function () {
  $(".pass_show").append('<span class="ptxt">Show</span>');

  $("#resetPwd").submit(function (event) {
    event.preventDefault();
    $("#alertZone").empty();
    $("#alertZone").removeClass("alert alert-danger")
    let newPwd=$("#newPassword").val();
    let confirmPwd=$("#confirmPassword").val();
    if(newPwd !=confirmPwd){
        $("#alertZone").addClass("alert alert-danger")
        $("#alertZone").text("Las contraseñas no coinciden")
    }else{
        console.log(href.location)
    }
  });
});

$(document).on("click", ".pass_show .ptxt", function () {
  $(this).text($(this).text() == "Show" ? "Hide" : "Show");

  $(this)
    .prev()
    .attr("type", function (index, attr) {
      return attr == "password" ? "text" : "password";
    });

  
});
