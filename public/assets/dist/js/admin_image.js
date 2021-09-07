$(document).ready(function () {
  $("#sidebarCollapse").on("click", function () {
    $("#sidebar").toggleClass("active");
  });

  paginationImage(1);

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
