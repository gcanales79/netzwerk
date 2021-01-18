$(document).ready(function () {
  $("#sidebarCollapse").on("click", function () {
    $("#sidebar").toggleClass("active");
  });

  getUsers(true);

  //Toggle de Usuarios Activos
  $("#activosToggle").on("change", (event) => {
    event.preventDefault();
    let toggleValue = $("#activosToggle").is(":checked") ? true : false;
    //console.log(toggleValue)
    getUsers(toggleValue);
  });

  //Boton Acitvate Usuarios activos
  $(document).on("click", ".buttonActive", function (event) {
    event.preventDefault();
    let userId = $(this).attr("value");
    let toggleValue = $("#activosToggle").is(":checked") ? true : false;
    //console.log(userId);
    let changes = {
      active: !toggleValue,
    };
    //console.log(JSON.stringify(changes));
    //console.log(`/activate-user/${userId}`);
    $.ajax({
      url: `/activate-user/${userId}`,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(changes),
      success: function (data) {
        console.log(data);
        $("#myToast").toast("show");
        $("#myToast").attr("class", data.alert);
        $("#bodyToast").text(data.message);
        getUsers(toggleValue);
      },
    });
  });

  //Borrar Usuario
  $(document).on("click", ".buttonDelete", function (event) {
    event.preventDefault();
    let userId = $(this).attr("value");
    //console.log(UserId);
    $.get(`/get-user/${userId}`, () => {}).then((data) => {
      const { user } = data;
      console.log(user);
      buttonBorrarUsuario(user.id);
      $("#adminModalCenter").modal("show");
      clearUserForm();
      $("#adminModalLongTitle").text("Borrar Usuario");
      $("#modalBodyAlert").css("display", "inline-block");
      $("#modalBodyAlert").text(`Seguro que quieres borrar a ${user.email}`);
    });
  });

  //Boton Add User
  $(document).on("click", "#buttonAddUser", function (event) {
    //console.log("Add User")
    $("#alertForm").empty();
    let userEmail = $("#inputEmail").val().trim();
    let userPassword = $("#inputPassword").val();
    let userRole = $("#selectRole").val();
    let toggleValue = $("#activosToggle").is(":checked") ? true : false;
    $.post("/signup", {
      email: userEmail,
      password: userPassword,
      role: userRole,
    }).then((data) => {
      if (data.alert === "alert alert-success") {
        $("#adminModalCenter").modal("hide");
        $("#myToast").toast("show");
        $("#myToast").attr("class", data.alert);
        $("#bodyToast").text(data.message);
        getUsers(toggleValue);
      }else{

        let alertDiv=$("<div>");
        alertDiv.attr("class",data.alert);
        alertDiv.text(data.message)
        $("#alertForm").append(alertDiv);
      }
    });
  });

  //Añadir Usuario
  $("#addUser").on("click", (event) => {
    event.preventDefault();
    $("#adminModalCenter").modal("show");
    buttonAddUser();
    clearModalAlert();
    $("#adminModalLongTitle").text("Añadir Usuario");
    $("#userForm").css("display", "inline-block");
  });

  //Editar Usuario
  $(document).on("click",".buttonEdit",function(event){
    event.preventDefault();
    let userId=$(this).attr("value");
    //console.log(userId);
    $.get(`/get-user/${userId}`,()=>{}).then((data)=>{
      const {user}=data;
      //console.log(user)
      $("#adminModalCenter").modal("show");
      buttonEditUser(user.id);
      clearModalAlert();
      $("#adminModalLongTitle").text("Editar Usuario");
      $("#userForm").css("display", "inline-block");
      $("#passwordUserForm").css("display", "none");
      $("#inputEmail").val(user.email)
      $("#selectRole").val(user.role)
    })
  })

  //Guardar datos usuario editado
  $(document).on("click","#buttonEditUser",function(event){
    let userEmail=$("#inputEmail").val().trim();
    let userRole=$("#selectRole").val();
    let toggleValue = $("#activosToggle").is(":checked") ? true : false;
    let changes={
      email: userEmail,
      role:userRole
    }
    let userId=$("#buttonEditUser").val()
    $.ajax({
      url: `/activate-user/${userId}`,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(changes),
      success: function (data) {
        //console.log(data);
        $("#adminModalCenter").modal("hide");
        $("#myToast").toast("show");
        $("#myToast").attr("class", data.alert);
        $("#bodyToast").text(data.message);
        getUsers(toggleValue);
      },
    })
  })

  //Confirmar Borrar
  $(document).on("click", "#buttonBorrarConfirmar", function (event) {
    event.preventDefault();
    let userId = $(this).attr("value");
    //console.log(userId);
    $.ajax({
      url: `/delete-user/${userId}`,
      type: "DELETE",
      contentType: "application/json",
      success: function (data) {
        //console.log(data)
        $("#adminModalCenter").modal("hide");
        $("#myToast").toast("show");
        $("#myToast").attr("class", data.alert);
        $("#bodyToast").text(data.message);
        console.log("Usuario borrado");
        getUsers(false);
      },
    });
  });

  //Obtener los Usuarios
  function getUsers(userStatus) {
    let status = +userStatus;
    //console.log(status)
    //console.log(typeof(status))
    //console.log(`/users-active?active=${status}`)

    $.get("/users-active?active=" + status, () => {}).then((data) => {
      const { users } = data;
      //console.log(users);

      if (!users) {
        $("#bodyTablaUsuarios").empty();
      } else if (userStatus) {
        $("#bodyTablaUsuarios").empty();
        usuariosActivos(users);
      } else {
        $("#bodyTablaUsuarios").empty();
        usuariosInactivos(users);
      }
    });
  }

  function usuariosActivos(users) {
    for (let i = 0; i < users.length; i++) {
      //console.log(users[i].id)
      let newtr = $("<tr>");
      let newtdId = $("<th>");
      newtdId.attr("scope", "row");
      newtdId.text(i + 1);
      let newtdEmail = $("<td>");
      newtdEmail.text(users[i].email);
      let newtdRole = $("<td>");
      newtdRole.text(users[i].role);
      //Boton Desactivar
      var buttonActive = $("<button>");
      buttonActive.attr("class", "btn btn-danger buttonTable buttonActive");
      buttonActive.attr("value", users[i].id);
      buttonActive.attr("id", "editButton" + users[i].id);
      let iconActive = $("<i>");
      iconActive.attr("class", "fas fa-user-alt-slash");
      buttonActive.append(iconActive);

      //Boton Editar
      let buttonEdit = $("<button>");
      buttonEdit.attr("class", "btn btn-info buttonTable buttonEdit");
      buttonEdit.attr("value", users[i].id);
      let iconEdit = $("<i>");
      iconEdit.attr("class", "fas fa-edit");
      buttonEdit.append(iconEdit);

      //Tabla
      let newtdActions = $("<td>");
      newtdActions.append(buttonEdit);
      newtdActions.append(buttonActive);
      newtr.append(newtdId);
      newtr.append(newtdEmail);
      newtr.append(newtdRole);
      newtr.append(newtdActions);
      $("#bodyTablaUsuarios").append(newtr);
    }
  }

  function usuariosInactivos(users) {
    for (let i = 0; i < users.length; i++) {
      //console.log(users[i].id)
      let newtr = $("<tr>");
      let newtdId = $("<th>");
      newtdId.attr("scope", "row");
      newtdId.text(i + 1);
      let newtdEmail = $("<td>");
      newtdEmail.text(users[i].email);
      let newtdRole = $("<td>");
      newtdRole.text(users[i].role);
      //Boton Activar
      let buttonActive = $("<button>");
      buttonActive.attr("class", "btn btn-success buttonTable buttonActive");
      buttonActive.attr("value", users[i].id);
      buttonActive.attr("id", "editButton" + users[i].id);
      let iconActive = $("<i>");
      iconActive.attr("class", "fas fa-user-check");
      buttonActive.append(iconActive);

      //Boton Borrar
      let buttonDelete = $("<button>");
      buttonDelete.attr("class", "btn btn-danger buttonTable buttonDelete");
      buttonDelete.attr("value", users[i].id);
      let iconDelete = $("<i>");
      iconDelete.attr("class", "far fa-trash-alt");
      buttonDelete.append(iconDelete);

      //Tabla
      let newtdActions = $("<td>");
      newtdActions.append(buttonActive);
      newtdActions.append(buttonDelete);
      newtr.append(newtdId);
      newtr.append(newtdEmail);
      newtr.append(newtdRole);
      newtr.append(newtdActions);
      $("#bodyTablaUsuarios").append(newtr);
    }
  }

  //Crear boton Borrar Usuario
  function buttonBorrarUsuario(userId) {
    $("#modalFooter").empty();

    //Boton Cerrar
    let buttonClose = $("<button>");
    buttonClose.attr("class", "btn btn-secondary");
    buttonClose.attr("data-dismiss", "modal");
    buttonClose.text("Cerrar");
    $("#modalFooter").append(buttonClose);

    //Boton Borrar
    let buttonBorrar = $("<button>");
    buttonBorrar.attr("class", "btn btn-danger");
    buttonBorrar.attr("id", "buttonBorrarConfirmar");
    buttonBorrar.text("Borrar");
    buttonBorrar.attr("value", userId);
    $("#modalFooter").append(buttonBorrar);
  }

  //Crear boton Añadir Usuario
  function buttonAddUser() {
    $("#modalFooter").empty();

    //Boton Cerrar
    let buttonClose = $("<button>");
    buttonClose.attr("class", "btn btn-secondary");
    buttonClose.attr("data-dismiss", "modal");
    buttonClose.text("Cerrar");
    $("#modalFooter").append(buttonClose);

    //Boton Borrar
    let buttonAdd = $("<button>");
    buttonAdd.attr("class", "btn btn-info");
    buttonAdd.attr("id", "buttonAddUser");
    buttonAdd.text("Agregar");
    $("#modalFooter").append(buttonAdd);
  }

    //Crear boton Edit Usuario
    function buttonEditUser(userId) {
      $("#modalFooter").empty();
  
      //Boton Cerrar
      let buttonClose = $("<button>");
      buttonClose.attr("class", "btn btn-secondary");
      buttonClose.attr("data-dismiss", "modal");
      buttonClose.text("Cerrar");
      $("#modalFooter").append(buttonClose);
  
      //Boton Borrar
      let buttonSave = $("<button>");
      buttonSave.attr("class", "btn btn-info");
      buttonSave.attr("value",userId)
      buttonSave.attr("id", "buttonEditUser");
      buttonSave.text("Guardar");
      $("#modalFooter").append(buttonSave);
    }

  //Limpiar Modal Boday Alert
  function clearModalAlert() {
    $("#modalBodyAlert").empty();
    $("#modalBodyAlert").css("display", "none");
  }

  //Limpiar User Form
  function clearUserForm() {
    $("#userForm").css("display", "none");
  }

});
