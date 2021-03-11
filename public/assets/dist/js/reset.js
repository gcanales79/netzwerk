$(document).ready(function () {
  $(".pass_show").append('<i class="fas fa-eye ptxt"></i>');

  $("#resetPwd").submit(function (event) {
    event.preventDefault();
    $("#alertZone").empty();
    $("#alertZone").removeClass("alert alert-danger");
    let newPwd = $("#newPassword").val();
    let confirmPwd = $("#confirmPassword").val();
    let token = $("#btnReset").val();
    if (newPwd != confirmPwd) {
      $("#alertZone").addClass("alert alert-danger");
      $("#alertZone").text("Las contraseñas no coinciden");
    } else {
      $.post(`/reset/${token}`, {
        password: newPwd,
        confirm: confirmPwd,
      }).then((data) => {
        console.log(data)
        notificationToast(data.alert,data.message);
      });
    }
  });

  function notificationToast(result, message) {
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
});

$(document).on("click", ".pass_show .ptxt", function () {
  let oldClass=$(this).attr("class")
  let newClass=$(this).hasClass("svg-inline--fa fa-eye fa-w-18 ptxt") ? "svg-inline--fa fa-eye-slash fa-w-18 ptxt" : "svg-inline--fa fa-eye fa-w-18 ptxt"
  $(this).removeClass(oldClass).addClass(newClass)

  //$(this).class($(this).hasclass() == "fas fa-eye ptx" ? "fas fa-eye-slash ptx" : "fas fa-eye ptx");

  $(this)
    .prev()
    .attr("type", function (index, attr) {
      return attr == "password" ? "text" : "password";
    });


});
