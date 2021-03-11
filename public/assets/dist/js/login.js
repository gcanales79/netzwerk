$(document).ready(function () {
  // Getting references to our form and inputs
  var loginForm = $("form.login");
  var emailInput = $("input#email-input");
  var passwordInput = $("input#password-input");
  var myToken;

  // When the form is submitted, we validate there's an email and password entered
  loginForm.on("submit", function (event) {
    event.preventDefault();
    grecaptcha.ready(function () {
      // do request for recaptcha token
      // response is promise with passed token
      grecaptcha
        .execute("6LcP6XYaAAAAAB0SXo9Dmt7n2xuuB1VJaD6QJ2Hf", {
          action: "submit",
        })
        .then(function (token) {
          // add token value to form
          //console.log(token)
          var userData = {
            email: emailInput.val().trim(),
            password: passwordInput.val().trim(),
            token: token,
          };

          if (!userData.email || !userData.password) {
            return;
          }

          // If we have an email and password we run the loginUser function and clear the form
          loginUser(userData.email, userData.password, userData.token);
          emailInput.val("");
          passwordInput.val("");
        });
    });
  });

  // loginUser does a post to our "api/login" route and if successful, redirects us the the members page
  function loginUser(email, password, token) {
    $.get("/signin", {
      email: email,
      password: password,
      token: token,
    }).then((data) => {
      console.log(data);

      if (data.alert === "Success") {
        notificationToast(data.alert, data.message);
        localStorage.setItem("ACCESS_TOKEN", data.accessToken);
        localStorage.setItem("REFRESH_TOKEN", data.refreshToken);
        window.location.href = "./admin";
      } else {
        notificationToast(data.alert, data.message);
      }
    });
  }

  $("#resetPwd").on("click",function(event){
    event.preventDefault();
    $("#alertZone").empty();
    $("#alertZone").removeClass("alert alert-danger")
    $("#forgotEmail").val("");
    $("#modalForgotCenter").modal("show");
  })

  $("#resetForm").submit(function(event){
    event.preventDefault();
    let email=$("#forgotEmail").val().trim().toLowerCase();
    if (email.length!=0){
      $.post("/forgot",{
        email:email
      }).then((data)=>{
        if(data.alert==="Error"){
          $("#alertZone").addClass("alert alert-danger")
          $("#alertZone").text(data.message)
        }
        if(data.alert==="Success"){
          $("#modalForgotCenter").modal("hide");
          notificationToast(data.alert, data.message)
        }
      })
    }
  })

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

   //Validation of Forms
  // Example starter JavaScript for disabling form submissions if there are invalid fields
  (function () {
    "use strict";

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll(".needs-validation");

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms).forEach(function (form) {
      form.addEventListener(
        "submit",
        function (event) {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
          }

          form.classList.add("was-validated");
        },
        false
      );
    });
  })();
});
