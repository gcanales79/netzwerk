$(document).ready(function () {
  $("#sidebarCollapse").on("click", function () {
    $("#sidebar").toggleClass("active");
  });

  paginationTweet(1);

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
            newItem = $("<tr>");
            titleTweet = $("<td>");
            titleTweet.text(data[i].title);
            fechaTweet = $("<td>");
            let fecha = moment(data[i].schedule_date).format(
              "DD-MM-YYYY hh:mm a"
            );
            fechaTweet.text(fecha);
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
            newItem.append(titleTweet);
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

  //Crear boton Borrar Tweet
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

  //Abrir Modal para Editar Tweet
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

  //Contar caracteres
  $("#contenidoTweet").keyup(function () {
    let char = $("#contenidoTweet").val().length;
    $("#chaCount").text(`Num. Caracteres: ${char}`);
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
