$(document).ready(function () {
  // Getting references to our form and inputs
  var loginForm = $("form.login");
  var emailInput = $("input#email-input");
  var passwordInput = $("input#password-input");

  // When the form is submitted, we validate there's an email and password entered
  loginForm.on("submit", function (event) {
    event.preventDefault();

    var userData = {
      email: emailInput.val().trim(),
      password: passwordInput.val().trim(),
    };

    if (!userData.email || !userData.password) {
      return;
    }

    // If we have an email and password we run the loginUser function and clear the form
    loginUser(userData.email, userData.password);
    emailInput.val("");
    passwordInput.val("");
  });

  // loginUser does a post to our "api/login" route and if successful, redirects us the the members page
  function loginUser(email, password) {
    $.get("/signin", {
      email: email,
      password: password,
    }).then((data) => {
      console.log(data);
      $("#myToast").toast("show");
      $("#myToast").attr("class", data.alert);
      $("#bodyToast").text(data.message);
      localStorage.setItem("ACCESS_TOKEN",data.accessToken);
      localStorage.setItem("REFRESH_TOKEN",data.refreshToken);
      window.location.href=("./admin")
    });
  }
});
