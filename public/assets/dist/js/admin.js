$(document).ready(function () {
  $("#sidebarCollapse").on("click", function () {
    $("#sidebar").toggleClass("active");
  });

  getUsers(true);
  paginationBlog(1);
  paginationImage(1);

  //Toggle de Usuarios Activos
  $("#activosToggle").on("change", function (event) {
    event.preventDefault();
    let toggleValue = $("#activosToggle").is(":checked") ? true : false;
    console.log(toggleValue);
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
        notificationToast(data.alert, data.message);
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
      //console.log(user);
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
        notificationToast(data.alert, data.message);
        getUsers(toggleValue);
      } else {
        let alertDiv = $("<div>");
        alertDiv.attr("class", data.alert);
        alertDiv.text(data.message);
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
  $(document).on("click", ".buttonEdit", function (event) {
    event.preventDefault();
    let userId = $(this).attr("value");
    //console.log(userId);
    $.get(`/get-user/${userId}`, () => {}).then((data) => {
      const { user } = data;
      //console.log(user)
      $("#adminModalCenter").modal("show");
      buttonEditUser(user.id);
      clearModalAlert();
      $("#adminModalLongTitle").text("Editar Usuario");
      $("#userForm").css("display", "inline-block");
      $("#passwordUserForm").css("display", "none");
      $("#inputEmail").val(user.email);
      $("#selectRole").val(user.role);
    });
  });

  //Guardar datos usuario editado
  $(document).on("click", "#buttonEditUser", function (event) {
    let userEmail = $("#inputEmail").val().trim();
    let userRole = $("#selectRole").val();
    let toggleValue = $("#activosToggle").is(":checked") ? true : false;
    let changes = {
      email: userEmail,
      role: userRole,
    };
    let userId = $("#buttonEditUser").val();
    $.ajax({
      url: `/activate-user/${userId}`,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(changes),
      success: function (data) {
        //console.log(data);
        $("#adminModalCenter").modal("hide");
        notificationToast(data.alert, data.message);
        getUsers(toggleValue);
      },
    });
  });

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
        notificationToast(data.alert, data.message);
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
    buttonSave.attr("value", userId);
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

  //Listado de Blogs
  function paginationBlog(pageNumber) {
    $("#pagination-container").empty();
    if ($("#pagination-container").length) {
      //console.log("Entro")
      //Pagination
      $("#pagination-container").pagination({
        dataSource: function (done) {
          $.ajax({
            type: "GET",
            url: "/get-all-posts",
            success: function (response) {
              //console.log(response)
              done(response.data);
            },
          });
        },
        pageSize: 10,
        pageNumber: pageNumber,
        callback: function (data, pagination) {
          $("#postList").empty();
          for (let i = 0; i < data.length; i++) {
            newItem = $("<li>");
            newItem.attr(
              "class",
              "list-group-item d-flex justify-content-around align-items-start"
            );
            divTitle = $("<div>");
            divTitle.text(data[i].title);
            divTitle.attr("class", "col");
            newDiv = $("<div>");
            newDiv.attr("class", "col");
            //Button See
            buttonSee = $("<a>");
            buttonSee.attr("class", "btn btn-primary");
            buttonSee.attr("href", data[i].url);
            buttonSee.attr("role", "button");
            buttonSee.css("margin", "5px");
            seeIcon = $("<i>");
            seeIcon.attr("class", "far fa-eye");
            buttonSee.append(seeIcon);
            //Button Edit
            buttonEdit = $("<button>");
            buttonEdit.attr("type", "button");
            buttonEdit.attr("class", "btn btn-primary editPost");
            buttonEdit.css("margin", "5px");
            buttonEdit.attr("value", data[i].id);
            buttonEdit.attr("page", pagination.pageNumber);
            editIcon = $("<i>");
            editIcon.attr("class", "fas fa-edit");
            buttonEdit.append(editIcon);
            //Button Image
            buttonImage = $("<button>");
            buttonImage.attr("type", "button");
            buttonImage.attr("class", "btn btn-primary imagePost");
            buttonImage.css("margin", "5px");
            buttonImage.attr("value", data[i].id);
            buttonImage.attr("page", pagination.pageNumber);
            imageIcon = $("<i>");
            imageIcon.attr("class", "far fa-image");
            buttonImage.append(imageIcon);
            //Button Twitter
            buttonTwitter = $("<button>");
            buttonTwitter.attr("type", "button");
            buttonTwitter.attr("class", "btn btn-primary twitterPost");
            buttonTwitter.css("margin", "5px");
            buttonTwitter.attr("value", data[i].id);
            buttonTwitter.attr("page", pagination.pageNumber);
            twitterIcon = $("<i>");
            twitterIcon.attr("class", "fab fa-twitter");
            buttonTwitter.append(twitterIcon);
            //Button ON
            buttonOn = $("<button>");
            buttonOn.attr("type", "button");
            let classOn = data[i].active
              ? "btn btn-success activePost"
              : "btn btn-danger activePost";
            buttonOn.attr("class", classOn);
            buttonOn.css("margin", "5px");
            buttonOn.attr("value", data[i].id);
            buttonOn.attr("page", pagination.pageNumber);
            OnIcon = $("<i>");
            OnIcon.attr("class", "fas fa-power-off");
            buttonOn.append(OnIcon);
            //Button Delete
            buttonDelete = $("<button>");
            buttonDelete.attr("type", "button");
            buttonDelete.attr("class", "btn btn-danger deletePost");
            buttonDelete.css("margin", "5px");
            buttonDelete.attr("value", data[i].id);
            buttonDelete.attr("page", pagination.pageNumber);
            deleteIcon = $("<i>");
            deleteIcon.attr("class", "fas fa-trash-alt");
            buttonDelete.append(deleteIcon);
            //Append Icons to Div
            newDiv.append(buttonSee);
            newDiv.append(buttonEdit);
            newDiv.append(buttonImage);
            newDiv.append(buttonTwitter);
            newDiv.append(buttonOn);
            newDiv.append(buttonDelete);
            //Append Div to Item
            newItem.append(divTitle);
            newItem.append(newDiv);
            //Append Item to List
            $("#postList").append(newItem);
          }
        },
      });
    }
  }

  //Funcion delete en lista de Post

  $(document).on("click", ".deletePost", function (event) {
    event.preventDefault();
    let postId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    $.get(`/get-post-id/${postId}`, () => {}).then((data) => {
      const { post } = data;
      //console.log(post);
      buttonBorrarPost(postId, pageNum);
      $("#adminModalCenter").modal("show");
      clearUserForm();
      $("#adminModalLongTitle").text("Borrar Post");
      $("#modalBodyAlert").css("display", "inline-block");
      $("#modalBodyAlert").text(
        `Seguro que quieres borrar el post de ${post.title}`
      );
    });
  });

  //Crear boton Borrar Post
  function buttonBorrarPost(postId, pageNum) {
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
    buttonBorrar.attr("id", "buttonBorrarPost");
    buttonBorrar.text("Eliminar");
    buttonBorrar.attr("value", postId);
    buttonBorrar.attr("page", pageNum);
    $("#modalFooter").append(buttonBorrar);
  }

  //Funcion borrar Post en Modal
  $(document).on("click", "#buttonBorrarPost", function (event) {
    event.preventDefault();
    let postId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    $.ajax({
      url: `/delete-post/${postId}`,
      type: "DELETE",
      contentType: "application/json",
      success: function (data) {
        //console.log(data)
        $("#adminModalCenter").modal("hide");
        notificationToast(data.alert, data.message);
        //console.log("Usuario borrado");
        paginationBlog(pageNum);
      },
    });
  });

  //Modal añadir post
  $("#addPost").on("click", function (event) {
    event.preventDefault();
    $("#modalPostLongTitle").text("Crear Nuevo Post");
    $("#createPost").text("Crear Post");
    $("#modalPostCenter").attr("type", "Create");
    $("#modalPostCenter").modal("show");
  });

  //TinyMCE
  tinymce.init({
    selector: "#descriptionPost",
    width: "100%",
    height: 270,
    plugins: [
      "advlist autolink lists link image charmap print preview anchor",
      "searchreplace visualblocks code fullscreen",
      "insertdatetime media table paste code help wordcount tinymcespellchecker autosave",
    ],
    spellchecker_language: "es",
    toolbar:
      "undo redo | formatselect | " +
      "bold italic backcolor | alignleft aligncenter " +
      "alignright alignjustify | bullist numlist outdent indent | " +
      "removeformat | help | restoredraft",
      autosave_interval:"60s"
  });

  $(document).on("focusin", function (e) {
    if (
      $(e.target).closest(
        ".tox-tinymce, .tox-tinymce-aux, .moxman-window, .mce-window, .tam-assetmanager-root"
      ).length
    ) {
      e.stopImmediatePropagation();
    }
  });

  //Create Post Function #createPost

  $("#postBlogMain").submit(function (event) {
    event.preventDefault();
    //console.log($("#postBlogMain").validate())
    //$("#postBlogMain").submit()
    let title = $("#tituloPost").val().trim();
    let url = $("#urlPost").val().toLowerCase().trim();
    let modifyurl = url.replace(/\s/g, "-");
    let description = tinymce.get("descriptionPost").getContent();
    let buttonType = $("#modalPostCenter").attr("type");
    let tema = $("#temaPost").val().trim();
    let pageNum = $(this).find("#createPost").attr("page");
    let postId = $(this).find("#createPost").attr("postid");
    console.log(pageNum);
    console.log(postId);
    if (title.length !== 0 && url.length !== 0 && tema.length !== 0) {
      if (buttonType == "Create") {
        $.post("/add-post", {
          title: title,
          url: modifyurl,
          description: description,
          tema: tema,
        }).then((data) => {
          console.log(data);
          const { post } = data;
          //console.log(post)
          //Crear el metatag
          $.post("/add-metatags", {
            title: post.title,
            url: `https://netzwerk.mx/blog/${post.url}`,
            BlogId: post.id,
          }).then((tag) => {
            $("#modalPostCenter").modal("hide");
            $("#postBlogMain").removeClass("was-validated");
            notificationToast(data.alert, data.message);
            paginationBlog(1);
          });
        });
      } else if (buttonType == "Update") {
        //console.log(`PageNum: ${pageNum} PostId: ${postId}`);
        let changes = {
          title: title,
          url: modifyurl,
          description: description,
          tema: tema,
        };
        $.ajax({
          url: `/update-post/${postId}`,
          type: "PUT",
          contentType: "application/json",
          data: JSON.stringify(changes),
          success: function (data) {
            $("#modalPostCenter").modal("hide");
            $("#postBlogMain").removeClass("was-validated");
            notificationToast(data.alert, data.message);
            //console.log("Usuario borrado");
            paginationBlog(pageNum);
          },
        });
      }
    } else {
      console.log("No valida");
    }
  });

  //Edit Post
  $(document).on("click", ".editPost", function (event) {
    event.preventDefault();
    let pageNum = $(this).attr("page");
    let postId = $(this).attr("value");
    //console.log(`Page: ${pageNum} PostId: ${postId}`);
    $.get(`/get-post-id/${postId}`, () => {}).then((data) => {
      const { post } = data;
      //console.log(post);
      $("#modalPostLongTitle").text("Actualizar Nuevo Post");
      $("#createPost").text("Actualizar Post");
      $("#createPost").attr("postId", postId);
      $("#createPost").attr("page", pageNum);
      $("#modalPostCenter").attr("type", "Update");
      $("#tituloPost").val(post.title);
      $("#urlPost").val(post.url);
      $("#temaPost").val(post.tema);
      tinymce.get("descriptionPost").insertContent(post.description);
      $("#modalPostCenter").modal("show");
    });
  });

  //Activate Post
  $(document).on("click", ".activePost", function (event) {
    event.preventDefault();
    let postId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    let classId = $(this).attr("class");
    let active = classId == "btn btn-success activePost" ? false : true;
    //console.log(active)
    let changes = {
      active: active,
    };
    $.ajax({
      url: `/update-post/${postId}`,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(changes),
      success: function (data) {
        notificationToast(data.alert, data.message);
        paginationBlog(pageNum);
      },
    });
  });

  //Fill Twitter From
  $(document).on("click", ".twitterPost", function (event) {
    event.preventDefault();
    let postId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    $("#createTwitter").attr("value", postId);
    $("#createTwitter").attr("page", pageNum);
    //console.log(`Postid: ${postId} PageNum:${pageNum}`);
    $.get(`/get-metatags/${postId}`, () => {}).then((data) => {
      const { tag } = data;
      $("#metatagTitle").val(tag.title);
      $("#metatagDescription").val(tag.description);
      $("#metatagKeywords").val(tag.keywords);
      $("#metatagCardType").val(tag.cardType);
      $("#metatagSite").val(tag.site);
      $("#metatagCreator").val(tag.creator);
      $("#metatagUrl").val(tag.url);
      $("#metatagTwitterTitle").val(tag.twitterTitle);
      $("#metatagTwitterDescription").val(tag.twitterDescription);
      $("#metatagTwitterImage").val(tag.image);
      $("#modalTwitterCenter").modal("show");
    });
  });

  //Update Metatag Twitter
  $("#createTwitter").on("click", function (event) {
    event.preventDefault();
    let postId = $(this).attr("value");
    let pageNum = $(this).attr("page");

    let title = $("#metatagTitle").val();
    let description = $("#metatagDescription").val();
    let keywords = $("#metatagKeywords").val();
    let cardType = $("#metatagCardType").val();
    let site = $("#metatagSite").val();
    let creator = $("#metatagCreator").val();
    let url = $("#metatagUrl").val();
    let twitterTitle = $("#metatagTwitterTitle").val();
    let twitterDescription = $("#metatagTwitterDescription").val();
    let twitterImage = $("#metatagTwitterImage").val();
    let changes = {
      title: title,
      description: description,
      keywords: keywords,
      cardType: cardType,
      site: site,
      creator: creator,
      url: url,
      twitterTitle: twitterTitle,
      twitterDescription: twitterDescription,
      twitterImage: twitterImage,
    };
    $.ajax({
      url: `/update-metatags/${postId}`,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(changes),
      success: function (data) {
        $("#modalTwitterCenter").modal("hide");
        notificationToast(data.alert, data.message);
        //console.log("Usuario borrado");
        paginationBlog(pageNum);
      },
    });
  });

  //Upload file

  $("#uploadImage").on("click", function (event) {
    event.preventDefault();
    let accion = $(this).attr("accion");
    let postId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    let imagen_alt = $("#imageAlt").val();
    var formData = new FormData();
    var file = document.getElementById("mainImage").files[0];
    formData.append("imagenPost", file);
    formData.append("imagen_alt", imagen_alt);
    var xhr = new XMLHttpRequest();

    // your url upload
    xhr.open("post", "/fileupload", true);

    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        var percentage = (e.loaded / e.total) * 100;
        //console.log(percentage.toFixed(0) + "%");
        $("#ProgressBar").show();
        $("#imageProgressBar").css("width", percentage.toFixed(0) + "%");
        //$("#imageProgressBar").html(percentage.toFixed(0) + "%");
      }
    };

    xhr.onerror = function (e) {
      console.log("Error");
      console.log(e);
    };
    xhr.onload = function () {
      if (accion === "principal") {
        var file = JSON.parse(xhr.responseText);
        console.log(file);
        $("#modalImageCenter").modal("hide");
        notificationToast(file.alert, file.message);
        let postchange = {
          image: file.data,
          image_alt: file.image_alt,
        };
        let changes = {
          image: `https://netzwerk.mx${file.data}`,
        };
        $.ajax({
          url: `/update-post/${postId}`,
          type: "PUT",
          contentType: "application/json",
          data: JSON.stringify(postchange),
          success: function (data) {
            notificationToast(data.alert, data.message);
          },
        });
        $.ajax({
          url: `/update-metatags/${postId}`,
          type: "PUT",
          contentType: "application/json",
          data: JSON.stringify(changes),
          success: function (data) {
            notificationToast(data.alert, data.message);
            //console.log("Usuario borrado");
            paginationBlog(pageNum);
          },
        });
        $("#modalImageCenter").modal("hide");
      } else {
        var file = JSON.parse(xhr.responseText);
        //console.log(file);
        $("#modalImageCenter").modal("hide");
        notificationToast(file.alert, file.message);
        paginationImage(1);
        //console.log(this.statusText);
      }
    };

    xhr.send(formData);
  });

  //Add Image Button
  $("#addImage").on("click", function (event) {
    //console.log("Entro")
    event.preventDefault();
    $("#modalImageLongTitle").text("Agregar Imagen");
    $("#uploadImage").text("Subir Imagen");
    $("#uploadImage").attr("accion", "secundaria");
    $("#mainImage").val("");
    $("#ProgressBar").hide();
    $("#imageProgressBar").css("width", "0%");
    $("#modalImageCenter").modal("show");
  });

  //Pagination of Images
  function paginationImage(pageNumber) {
    $("#pagination-image").empty();
    if ($("#pagination-image").length) {
      //console.log("Entro pagination Image")
      //Pagination
      $("#pagination-image").pagination({
        dataSource: function (done) {
          $.ajax({
            type: "GET",
            url: "/get-images",
            success: function (response) {
              //console.log(response)
              done(response.data);
            },
          });
        },
        pageSize: 10,
        pageNumber: pageNumber,
        callback: function (data, pagination) {
          $("#imageList").empty();
          for (let i = 0; i < data.length; i++) {
            newItem = $("<li>");
            newItem.attr(
              "class",
              "list-group-item d-flex justify-content-around align-items-start"
            );
            divImage = $("<div>");
            divImage.attr("class", "col image-div");
            divButton = $("<div>");
            divButton.attr("class", "col");
            //images
            newImage = $("<img>");
            newImage.attr("class", "img-fluid img-thumbnail h-100");
            newImage.attr("src", data[i].imagen_url);
            //Append Image to its Div
            divImage.append(newImage);
            //Button Delete
            buttonDelete = $("<button>");
            buttonDelete.attr("type", "button");
            buttonDelete.attr("class", "btn btn-danger deleteImage");
            buttonDelete.css("margin", "5px");
            buttonDelete.attr("value", data[i].id);
            buttonDelete.attr("page", pagination.pageNumber);
            deleteIcon = $("<i>");
            deleteIcon.attr("class", "fas fa-trash-alt");
            buttonDelete.append(deleteIcon);
            //Append Icons to Button Div
            divButton.append(buttonDelete);
            //Append Div to Item
            newItem.append(divImage);
            newItem.append(divButton);
            //Append Item to List
            $("#imageList").append(newItem);
          }
        },
      });
    }
  }

  //Boton Modal Borrar Imagen
  $(document).on("click", ".deleteImage", function (event) {
    event.preventDefault();
    let imageID = $(this).attr("value");
    let pageNum = $(this).attr("page");
    $("#confirmDeleteImage").attr("value", imageID);
    $("#confirmDeleteImage").attr("page", pageNum);
    $("#modalConfirmDelete").modal("show");
  });

  //Confirmar Borrar Imagen
  $("#confirmDeleteImage").on("click", function (event) {
    event.preventDefault();
    let imageID = $(this).attr("value");
    let pageNum = $(this).attr("page");
    $.ajax({
      url: `/delete-image/${imageID}`,
      type: "GET",
      contentType: "application/json",
      success: function (data) {
        $("#modalConfirmDelete").modal("hide");
        notificationToast(data.alert, data.message);
        //console.log("Usuario borrado");
        paginationImage(pageNum);
      },
    });
  });

  //Añadir Imagen Principal del Post
  $(document).on("click", ".imagePost", function (event) {
    event.preventDefault();
    let postId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    $("#uploadImage").attr("value", postId);
    $("#uploadImage").attr("page", pageNum);
    $("#modalImageLongTitle").text("Subir Imagen Principal del Post");
    $("#uploadImage").text("Subir Imagen");
    $("#uploadImage").attr("accion", "principal");
    $("#mainImage").val("");
    $("#ProgressBar").hide();
    $("#imageProgressBar").css("width", "0%");
    $("#modalImageCenter").modal("show");
  });

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
