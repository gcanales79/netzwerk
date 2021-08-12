$(document).ready(function () {
  $("#sidebarCollapse").on("click", function () {
    $("#sidebar").toggleClass("active");
  });

  getUsers(true);
  paginationBlog(1);
  paginationImage(1);
  paginationLibro(1);
  paginationTweet(1);
  //$("#main-nav").addClass("hide-libro");

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
            if (data[i].image != null) {
              buttonImage.attr("class", "btn btn-success imagePost");
            } else {
              buttonImage.attr("class", "btn btn-primary imagePost");
            }
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
            //Button fav
            buttonFav = $("<button>");
            buttonFav.attr("type", "button");
            let classFav = data[i].favorite
              ? "btn btn-success favPost"
              : "btn btn-danger favPost";
            buttonFav.attr("class", classFav);
            buttonFav.css("margin", "5px");
            buttonFav.attr("value", data[i].id);
            buttonFav.attr("page", pagination.pageNumber);
            FavIcon = $("<i>");
            FavIcon.attr("class", "far fa-thumbs-up");
            buttonFav.append(FavIcon);
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
            newDiv.append(buttonFav);
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
      "insertdatetime media table paste code help wordcount autosave",
    ],
    browser_spellcheck: true,
    contextmenu: false,
    spellchecker_language: "es",
    toolbar:
      "undo redo | formatselect | " +
      "bold italic backcolor | alignleft aligncenter " +
      "alignright alignjustify | bullist numlist outdent indent | " +
      "removeformat | help | restoredraft",
    autosave_interval: "60s",
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

  //Froala
  /* var editor=new FroalaEditor("#descriptionPost",{
    width:"100%",
    height:"270",
    spellcheck:true,
    toolbarButtons: {
      'moreText': {
        'buttons': ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'textColor', 'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting']
      },
      'moreParagraph': {
        'buttons': ['alignLeft', 'alignCenter', 'formatOLSimple', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent', 'quote']
      },
      'moreRich': {
        'buttons': ['insertLink', 'insertImage', 'insertVideo', 'insertTable', 'emoticons', 'fontAwesome', 'specialCharacters', 'embedly', 'insertFile', 'insertHR']
      },
      'moreMisc': {
        'buttons': ['undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help'],
        'align': 'right',
        'buttonsVisible': 2
      }
    }
  })*/

  //Create Post Function #createPost

  $("#postBlogMain").submit(function (event) {
    event.preventDefault();
    //console.log($("#postBlogMain").validate())
    //$("#postBlogMain").submit()
    let title = $("#tituloPost").val().trim();
    let url = $("#urlPost").val().toLowerCase().trim();
    let modifyurl = url.replace(/\s/g, "-");
    let description = tinymce.get("descriptionPost").getContent();
    //Froala
    //let description=editor.html.get()
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

  //Change Post Url as you write spaces for "-"
  $("#urlPost").keyup(function (event) {
    event.preventDefault();
    //console.log($(this).val())
    let url = $(this).val().toLowerCase();
    let modifyurl = url.replace(/\s/g, "-");
    $("#urlPost").val(modifyurl);
  });

  //Edit Post
  $(document).on("click", ".editPost", function (event) {
    event.preventDefault();
    let pageNum = $(this).attr("page");
    let postId = $(this).attr("value");
    //console.log(`Page: ${pageNum} PostId: ${postId}`);
    tinymce.get("descriptionPost").setContent("");
    //Froala
    //editor.html.set("");
    $.get(`/get-post-id/${postId}`, () => {}).then((data) => {
      const { post } = data;
      console.log(post);
      $("#modalPostLongTitle").text("Actualizar Nuevo Post");
      $("#createPost").text("Actualizar Post");
      $("#createPost").attr("postId", postId);
      $("#createPost").attr("page", pageNum);
      $("#modalPostCenter").attr("type", "Update");
      $("#tituloPost").val(post.title);
      $("#urlPost").val(post.url);
      $("#temaPost").val(post.tema);
      tinymce.get("descriptionPost").insertContent(post.description);
      //Froala
      //editor.html.set(post.description);

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

  //Make a Post a Favorite
  $(document).on("click", ".favPost", function (event) {
    event.preventDefault();
    let postId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    let classId = $(this).attr("class");
    let favorite = classId == "btn btn-success favPost" ? false : true;
    //console.log(postId)
    let changes = {
      favorite: favorite,
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
    //console.log(file)
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
        let fileName = file.data.split(".");
        let postchange = {
          image: `${fileName[0]}.webp`,
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
    $("#imageAlt").val("");
    $("#previewImage").attr("src", "");
    $("#modalImageLongTitle").text("Agregar Imagen");
    $("#uploadImage").text("Subir Imagen");
    $("#uploadImage").attr("accion", "secundaria");
    $("#mainImage").val("");
    $("#ProgressBar").hide();
    $("#imageProgressBar").css("width", "0%");
    $("#modalImageCenter").modal("show");
  });

  //Erase Data if Modal to Add Image is close
  $("#modalImageCenter").on("hidden.bs.modal", function () {
    $("#imageAlt").val("");
    $("#previewImage").attr("src", "");
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
            newImage.attr("class", "img-fluid img-thumbnail mh-100");
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

  //Listado de todos los Libros
  function paginationLibro(pageNumber) {
    $("#pagination-containerlibro").empty();
    if ($("#pagination-containerlibro").length) {
      //console.log("Entro")
      //Pagination
      $("#pagination-containerlibro").pagination({
        dataSource: function (done) {
          $.ajax({
            type: "GET",
            url: "/get-all-books",
            success: function (response) {
              //console.log(response)
              done(response.data);
            },
          });
        },
        pageSize: 10,
        pageNumber: pageNumber,
        callback: function (data, pagination) {
          $("#libroList").empty();
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
            //Button Edit
            buttonEdit = $("<button>");
            buttonEdit.attr("type", "button");
            buttonEdit.attr("class", "btn btn-primary editBook");
            buttonEdit.css("margin", "5px");
            buttonEdit.attr("value", data[i].id);
            buttonEdit.attr("page", pagination.pageNumber);
            editIcon = $("<i>");
            editIcon.attr("class", "fas fa-edit");
            buttonEdit.append(editIcon);
            //Button Image
            buttonImage = $("<button>");
            buttonImage.attr("type", "button");
            //console.log(data[i].image.length)
            if (data[i].image != null) {
              buttonImage.attr("class", "btn btn-success imageBook");
            } else {
              buttonImage.attr("class", "btn btn-primary imageBook");
            }
            buttonImage.css("margin", "5px");
            buttonImage.attr("value", data[i].id);
            buttonImage.attr("page", pagination.pageNumber);
            imageIcon = $("<i>");
            imageIcon.attr("class", "far fa-image");
            buttonImage.append(imageIcon);
            //Button ON
            buttonOn = $("<button>");
            buttonOn.attr("type", "button");
            let classOn = data[i].active
              ? "btn btn-success activeBook"
              : "btn btn-danger activeBook";
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
            buttonDelete.attr("class", "btn btn-danger deleteBook");
            buttonDelete.css("margin", "5px");
            buttonDelete.attr("value", data[i].id);
            buttonDelete.attr("page", pagination.pageNumber);
            deleteIcon = $("<i>");
            deleteIcon.attr("class", "fas fa-trash-alt");
            buttonDelete.append(deleteIcon);
            //Append Icons to Div
            newDiv.append(buttonEdit);
            newDiv.append(buttonImage);
            newDiv.append(buttonOn);
            newDiv.append(buttonDelete);
            //Append Div to Item
            newItem.append(divTitle);
            newItem.append(newDiv);
            //Append Item to List
            $("#libroList").append(newItem);
          }
        },
      });
    }
  }

  //Abrir Modal Para Añadir libros
  $("#addLibro").on("click", function (event) {
    event.preventDefault();
    $("#libroMain")[0].reset();
    $("#portadaLibro").addClass("hide-libro");
    $("portadaLibro").attr("src", "");
    $("#modalLibroLongTitle").text("Añadir Nuevo Libro");
    $("#createLibro").text("Añadir Libro");
    $("#modalLibroCenter").attr("type", "Create");
    $("#modalLibroCenter").modal("show");
  });

  //Create Libro Function #createLibro

  $("#libroMain").submit(function (event) {
    event.preventDefault();
    //console.log($("#postBlogMain").validate())
    //$("#postBlogMain").submit()
    let title = $("#tituloLibro").val().trim();
    let url = $("#urlLibro").val().trim();
    let modifyurl = url.replace(/\s/g, "-");
    let author = $("#autorLibro").val().trim();
    let description = $("#descripcionLibro").val().trim();
    let imagen_alt = $("#imageBookAlt").val();
    let buttonType = $("#modalLibroCenter").attr("type");
    let pageNum = $(this).find("#createLibro").attr("page");
    let libroId = $(this).find("#createLibro").attr("libroId");
    var file = document.getElementById("bookImage").files[0];
    //console.log(pageNum);
    //console.log(postId);
    if (
      title.length !== 0 &&
      url.length !== 0 &&
      author.length !== 0 &&
      description.length !== 0
    ) {
      if (buttonType == "Create") {
        $.post("/add-libro", {
          title: title,
          url: modifyurl,
          author: author,
          description: description,
          image_alt: imagen_alt,
        }).then((data) => {
          //console.log(data);
          const { libro } = data;
          //console.log(libro)
          libroId = libro.id;
          //Crear el metatag
          $("#modalLibroCenter").modal("hide");
          //Limpiar la forma despues de hacer submitt
          $("#libroMain")[0].reset();
          $("#libroMain").removeClass("was-validated");
          uploadBookImage(buttonType, libroId, pageNum, file);
          notificationToast(data.alert, data.message);
          paginationLibro(1);
        });
      } else if (buttonType == "Update") {
        //console.log(`PageNum: ${pageNum} PostId: ${postId}`);
        let changes = {
          title: title,
          url: modifyurl,
          author: author,
          description: description,
          image_alt: imagen_alt,
        };
        $.ajax({
          url: `/update-libro/${libroId}`,
          type: "PUT",
          contentType: "application/json",
          data: JSON.stringify(changes),
          success: function (data) {
            $("#modalLibroCenter").modal("hide");
            $("#libroMain").removeClass("was-validated");
            notificationToast(data.alert, data.message);
            uploadBookImage(buttonType, libroId, pageNum, file);
            //console.log("Usuario borrado");
            paginationLibro(pageNum);
          },
        });
      }
    } else {
      //console.log("No valida");
    }
  });

  //Abrir Modal para Editar Libro
  $(document).on("click", ".editBook", function (event) {
    event.preventDefault();
    let pageNum = $(this).attr("page");
    let libroId = $(this).attr("value");
    //divPortada=$("<img>")
    //divPortada.attr("class","img-thumbnail")
    //divPortada.attr("id","portadaLibro")
    //$("#libroThumbnail").append(divPortada)
    //console.log(`Page: ${pageNum} PostId: ${postId}`);
    $.get(`/get-libro-id/${libroId}`, () => {}).then((data) => {
      const { libro } = data;
      //console.log(libro);
      $("#modalLibroLongTitle").text("Actualizar Libro");
      $("#createLibro").text("Actualizar Libro");
      $("#createLibro").attr("libroId", libroId);
      $("#createLibro").attr("page", pageNum);
      $("#modalLibroCenter").attr("type", "Update");
      $("#tituloLibro").val(libro.title);
      $("#urlLibro").val(libro.url);
      $("#autorLibro").val(libro.author);
      $("#descripcionLibro").val(libro.description);
      $("#imageBookAlt").val(libro.image_alt);

      $("#portadaLibro").attr("src", libro.image);

      $("#modalLibroCenter").modal("show");
    });
  });

  //Upload Book Picture

  function uploadBookImage(buttonType, libroId, pageNum, file) {
    let accion = buttonType;

    var formData = new FormData();

    //console.log(file)
    formData.append("imagenBook", file);
    var xhr = new XMLHttpRequest();

    // your url upload
    xhr.open("post", "/bookupload", true);

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
      if (accion === "Create" || accion === "Update") {
        var file = JSON.parse(xhr.responseText);
        //console.log(file);
        //$("#modalImageCenter").modal("hide");
        notificationToast(file.alert, file.message);
        let fileName = file.data.split(".");
        let postchange = {
          image: `${fileName[0]}.webp`,
        };
        let changes = {
          image: `https://netzwerk.mx${file.data}`,
        };
        $.ajax({
          url: `/update-libro/${libroId}`,
          type: "PUT",
          contentType: "application/json",
          data: JSON.stringify(postchange),
          success: function (data) {
            notificationToast(data.alert, data.message);
            paginationLibro(pageNum);
          },
        });
        //$("#modalImageCenter").modal("hide");
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
  }

  //Hide Picture if Book Modal is hide
  $("#modalLibroCenter").on("hidden.bs.modal", function () {
    $("#portadaLibro").attr("src", "");
    //console.log("Cerro el Modal")
  });

  //Abrir el Modal Para Borrar un Libro

  $(document).on("click", ".deleteBook", function (event) {
    event.preventDefault();
    let libroId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    $.get(`/get-libro-id/${libroId}`, () => {}).then((data) => {
      const { libro } = data;
      //console.log(post);
      buttonBorrarLibro(libroId, pageNum);
      $("#adminModalCenter").modal("show");
      clearUserForm();
      $("#adminModalLongTitle").text("Borrar Libro");
      $("#modalBodyAlert").css("display", "inline-block");
      $("#modalBodyAlert").text(
        `Seguro que quieres borrar el libro ${libro.title}`
      );
    });
  });

  //Crear boton Borrar Libro
  function buttonBorrarLibro(libroId, pageNum) {
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
    buttonBorrar.attr("id", "buttonBorrarLibro");
    buttonBorrar.text("Eliminar");
    buttonBorrar.attr("value", libroId);
    buttonBorrar.attr("page", pageNum);
    $("#modalFooter").append(buttonBorrar);
  }

  //Confirmar Borrar Libro
  $(document).on("click", "#buttonBorrarLibro", function (event) {
    event.preventDefault();
    let libroId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    $.ajax({
      url: `/delete-libro/${libroId}`,
      type: "DELETE",
      contentType: "application/json",
      success: function (data) {
        //console.log(data)
        $("#adminModalCenter").modal("hide");
        notificationToast(data.alert, data.message);
        //console.log("Usuario borrado");
        paginationLibro(pageNum);
      },
    });
  });

  //Activate Book
  $(document).on("click", ".activeBook", function (event) {
    event.preventDefault();
    let libroId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    let classId = $(this).attr("class");
    let active = classId == "btn btn-success activeBook" ? false : true;
    //console.log(active)
    let changes = {
      active: active,
    };
    $.ajax({
      url: `/update-libro/${libroId}`,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(changes),
      success: function (data) {
        notificationToast(data.alert, data.message);
        paginationLibro(pageNum);
      },
    });
  });

  //Preview Image Before Upload Image For Post and Secondary Images
  mainImage.onchange = (evt) => {
    const [file] = mainImage.files;
    if (file) {
      previewImage.src = URL.createObjectURL(file);
      previewImage.onload = function () {
        URL.revokeObjectURL(previewImage.src); // free memory
      };
    }
  };

  //Preview Image Before Upload for Books
  bookImage.onchange = (evt) => {
    const [file] = bookImage.files;
    if (file) {
      portadaLibro.src = URL.createObjectURL(file);
      $("#portadaLibro").removeClass("hide-libro");
      portadaLibro.onload = function () {
        URL.revokeObjectURL(portadaLibro.src); // free memory
      };
    }
  };

  //Abrir Modal Para Añadir tweet
  $("#addTweet").on("click", function (event) {
    event.preventDefault();
    $("#tweetMain")[0].reset();
    $("#modalTweetLongTitle").text("Añadir Nuevo Tweet");
    $("#createTweet").text("Añadir Tweet");
    $("#modalTweetCenter").attr("type", "Create");
    $("#modalTweetCenter").modal("show");
  });

  //Create Tweet Function #createTweet

  $("#tweetMain").submit(function (event) {
    event.preventDefault();
    //console.log($("#postBlogMain").validate())
    //$("#postBlogMain").submit()
    let title = $("#tituloTweet").val().trim();
    let tweet = $("#contenidoTweet").val().trim();
    let schedule_date = $("#fechaTweet").val();
    //console.log(schedule_date)
    let buttonType = $("#modalTweetCenter").attr("type");
    let pageNum = $(this).find("#createTweet").attr("page");
    let tweetId = $(this).find("#createTweet").attr("tweetId");
    //console.log(pageNum);
    //console.log(postId);
    if (
      title.length !== 0 &&
      tweet.length !== 0 &&
      schedule_date.length !== 0
    ) {
      if (buttonType == "Create") {
        $.post("/add-tweet", {
          title: title,
          tweet: tweet,
          schedule_date: schedule_date,
        }).then((data) => {
          //console.log(data);
          const { tweet } = data;
          //console.log(libro)
          tweetId = tweet.id;
          //Crear el metatag
          $("#modalTweetCenter").modal("hide");
          //Limpiar la forma despues de hacer submitt
          $("#tweetMain")[0].reset();
          $("#tweetMain").removeClass("was-validated");
          //uploadBookImage(buttonType, libroId, pageNum, file);
          notificationToast(data.alert, data.message);
          paginationTweet(1);
        });
      } else if (buttonType == "Update") {
        //console.log(`PageNum: ${pageNum} PostId: ${postId}`);
        let changes = {
          title: title,
          tweet: tweet,
          schedule_date: schedule_date,
        };
        $.ajax({
          url: `/update-tweet/${tweetId}`,
          type: "PUT",
          contentType: "application/json",
          data: JSON.stringify(changes),
          success: function (data) {
            $("#modalTweetCenter").modal("hide");
            $("#tweetMain").removeClass("was-validated");
            notificationToast(data.alert, data.message);
            //uploadBookImage(buttonType, libroId, pageNum, file);
            //console.log("Usuario borrado");
            paginationTweet(pageNum);
          },
        });
      }
    } else {
      //console.log("No valida");
    }
  });

  //Listado de todos los tweet
  function paginationTweet(pageNumber) {
    $("#pagination-containertweet").empty();
    if ($("#pagination-containertweet").length) {
      //console.log("Entro")
      //Pagination
      $("#pagination-containertweet").pagination({
        dataSource: function (done) {
          $.ajax({
            type: "GET",
            url: "/get-all-tweets",
            success: function (response) {
              //console.log(response)
              done(response.data);
            },
          });
        },
        pageSize: 10,
        pageNumber: pageNumber,
        callback: function (data, pagination) {
          $("#tweetList").empty();
          for (let i = 0; i < data.length; i++) {
            /*newItem = $("<li>");
            newItem.attr(
              "class",
              "list-group-item d-flex justify-content-center"
            );
            divTitle = $("<div>");
            divTitle.text(data[i].title);
            divTitle.attr("class", "col");
            divFecha = $("<div>");
            let fecha = moment(data[i].schedule_date).format(
              "DD-MM-YYYY hh:mm a"
            );
            divFecha.text(fecha);
            divFecha.attr("class", "col");
            newDiv = $("<div>");
            newDiv.attr("class", "col");
            if (data[i].complete) {
              //Button Tweet
              buttonTweet = $("<button>");
              buttonTweet.attr("type", "button");
              buttonTweet.attr("class", "btn btn-success");
              buttonTweet.css("margin", "5px");
              buttonTweet.attr("value", data[i].id);
              buttonTweet.attr("page", pagination.pageNumber);
              tweetIcon = $("<i>");
              tweetIcon.attr("class", "fab fa-twitter-square");
              buttonTweet.append(tweetIcon);
              //Append Icons to Div
              newDiv.append(buttonTweet);
            } else {
              //Button Edit
              buttonEdit = $("<button>");
              buttonEdit.attr("type", "button");
              buttonEdit.attr("class", "btn btn-primary editTweet");
              buttonEdit.css("margin", "5px");
              buttonEdit.attr("value", data[i].id);
              buttonEdit.attr("page", pagination.pageNumber);
              editIcon = $("<i>");
              editIcon.attr("class", "fas fa-edit");
              buttonEdit.append(editIcon);
              //Button Delete
              buttonDelete = $("<button>");
              buttonDelete.attr("type", "button");
              buttonDelete.attr("class", "btn btn-danger deleteTweet");
              buttonDelete.css("margin", "5px");
              buttonDelete.attr("value", data[i].id);
              buttonDelete.attr("page", pagination.pageNumber);
              deleteIcon = $("<i>");
              deleteIcon.attr("class", "fas fa-trash-alt");
              buttonDelete.append(deleteIcon);
              //Append Icons to Div
              newDiv.append(buttonEdit);
              newDiv.append(buttonDelete);
            }
            //Append Div to Item
            newItem.append(divTitle);
            newItem.append(divFecha);
            newItem.append(newDiv);
            //Append Item to List
            $("#tweetList").append(newItem);
            */
           newItem=$("<tr>")
           titleTweet=$("<td>")
           titleTweet.text(data[i].title);
           fechaTweet=$("<td>")
           let fecha = moment(data[i].schedule_date).format(
            "DD-MM-YYYY hh:mm a"
          );
           fechaTweet.text(fecha)
           actionTweet = $("<td>");
            if (data[i].complete) {
              //Button Tweet
              buttonTweet = $("<button>");
              buttonTweet.attr("type", "button");
              buttonTweet.attr("class", "btn btn-success");
              buttonTweet.css("margin", "5px");
              buttonTweet.attr("value", data[i].id);
              buttonTweet.attr("page", pagination.pageNumber);
              tweetIcon = $("<i>");
              tweetIcon.attr("class", "fab fa-twitter-square");
              buttonTweet.append(tweetIcon);
              //Append Icons to Div
              actionTweet.append(buttonTweet);
            } else {
              //Button Edit
              buttonEdit = $("<button>");
              buttonEdit.attr("type", "button");
              buttonEdit.attr("class", "btn btn-primary editTweet");
              buttonEdit.css("margin", "5px");
              buttonEdit.attr("value", data[i].id);
              buttonEdit.attr("page", pagination.pageNumber);
              editIcon = $("<i>");
              editIcon.attr("class", "fas fa-edit");
              buttonEdit.append(editIcon);
              //Button Delete
              buttonDelete = $("<button>");
              buttonDelete.attr("type", "button");
              buttonDelete.attr("class", "btn btn-danger deleteTweet");
              buttonDelete.css("margin", "5px");
              buttonDelete.attr("value", data[i].id);
              buttonDelete.attr("page", pagination.pageNumber);
              deleteIcon = $("<i>");
              deleteIcon.attr("class", "fas fa-trash-alt");
              buttonDelete.append(deleteIcon);
              //Append Icons to Div
              actionTweet.append(buttonEdit);
              actionTweet.append(buttonDelete);
            }
            newItem.append(titleTweet)
            newItem.append(fechaTweet);
            newItem.append(actionTweet);
            //Append Item to Tweet
            $("#tweetList").append(newItem);
           
          }
        },
      });
    }
  }

  //Abrir el Modal Para Borrar un Tweet

  $(document).on("click", ".deleteTweet", function (event) {
    event.preventDefault();
    let tweetId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    $.get(`/get-tweet-id/${tweetId}`, () => {}).then((data) => {
      const { tweet } = data;
      //console.log(post);
      buttonBorrarTweet(tweetId, pageNum);
      $("#adminModalCenter").modal("show");
      clearUserForm();
      $("#adminModalLongTitle").text("Borrar Tweet");
      $("#modalBodyAlert").css("display", "inline-block");
      $("#modalBodyAlert").text(
        `Seguro que quieres borrar el Tweet ${tweet.title}`
      );
    });
  });

  //Crear boton Borrar Libro
  function buttonBorrarTweet(tweetId, pageNum) {
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
    buttonBorrar.attr("id", "buttonBorrarTweet");
    buttonBorrar.text("Eliminar");
    buttonBorrar.attr("value", tweetId);
    buttonBorrar.attr("page", pageNum);
    $("#modalFooter").append(buttonBorrar);
  }

  //Confirmar Borrar Tweet
  $(document).on("click", "#buttonBorrarTweet", function (event) {
    event.preventDefault();
    let tweetId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    $.ajax({
      url: `/delete-tweet/${tweetId}`,
      type: "DELETE",
      contentType: "application/json",
      success: function (data) {
        //console.log(data)
        $("#adminModalCenter").modal("hide");
        notificationToast(data.alert, data.message);
        //console.log("Usuario borrado");
        paginationTweet(pageNum);
      },
    });
  });

  //Abrir Modal para Editar Libro
  $(document).on("click", ".editTweet", function (event) {
    event.preventDefault();
    let pageNum = $(this).attr("page");
    let tweetId = $(this).attr("value");
    
    $.get(`/get-tweet-id/${tweetId}`, () => {}).then((data) => {
      const { tweet } = data;
      //console.log(tweet)
      let fecha=moment(tweet.schedule_date).format("YYYY-MM-DDTHH:mm")
      //console.log(fecha)
      //console.log(libro);
      $("#modalTweetLongTitle").text("Actualizar Tweet");
      $("#createTweet").text("Actualizar Tweet");
      $("#createTweet").attr("tweetId", tweetId);
      $("#createTweet").attr("page", pageNum);
      $("#modalTweetCenter").attr("type", "Update");
      $("#tituloTweet").val(tweet.title);
      $("#fechaTweet").val(fecha);
      $("#contenidoTweet").val(tweet.tweet);
      $("#modalTweetCenter").modal("show");
    });
  });

  //Contar caracteres
  $("#contenidoTweet").keyup(function(){
    let char= $("#contenidoTweet").val().length;
    $("#chaCount").text(`Num. Caracteres: ${char}`)    
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
