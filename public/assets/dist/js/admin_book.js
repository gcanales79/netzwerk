$(document).ready(function () {
  $("#sidebarCollapse").on("click", function () {
    $("#sidebar").toggleClass("active");
  });

  paginationLibro(1);

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

  //Abrir Modal para Editar Libro
  $(document).on("click", ".editTweet", function (event) {
    event.preventDefault();
    let pageNum = $(this).attr("page");
    let tweetId = $(this).attr("value");

    $.get(`/get-tweet-id/${tweetId}`, () => {}).then((data) => {
      const { tweet } = data;
      //console.log(tweet)
      let fecha = moment(tweet.schedule_date).format("YYYY-MM-DDTHH:mm");
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

   //Limpiar User Form
   function clearUserForm() {
    $("#userForm").css("display", "none");
  }

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
