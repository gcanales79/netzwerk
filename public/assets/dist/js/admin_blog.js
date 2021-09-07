$(document).ready(function () {
  $("#sidebarCollapse").on("click", function () {
    $("#sidebar").toggleClass("active");
  });

  paginationBlog(1);

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

   //Limpiar User Form
   function clearUserForm() {
    $("#userForm").css("display", "none");
  }

  //Notification Function

  function notificationToast(result, message) {
    //console.log("Entro")
    switch (result) {
      case "Success":
        /*$.notify(
              {
                icon: "far fa-check-circle",
                message: message,
              },
              {
                type: "success",
              }
            )*/
        toastr.success(message);
        break;
      case "Error":
        //console.log("Error")
        /*$.notify(
              {
                icon: "far fa-times-circle",
                message: message,
              },
              {
                type: "danger",
              }
            );*/
        toastr.error(message);
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
