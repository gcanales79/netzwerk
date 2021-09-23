$(document).ready(function () {
  $("#sidebarCollapse").on("click", function () {
    $("#sidebar").toggleClass("active");
  });

  paginationTracking(1);

  //Open Modal to Add Trackings
  $("#addTrack").on("click", function (event) {
    event.preventDefault();
    $("#trackMain")[0].reset();
    $("#modalTrackLongTitle").text("Añadir Tracking");
    $("#createTrack").text("Añadir");
    $("#modalTrackCenter").attr("type", "Create");
    $("#modalTrackCenter").modal("show");
  });

  //Add a tracking Number
  $("#trackMain").submit(function (event) {
    event.preventDefault();
    let buttonType = $("#modalTrackCenter").attr("type");
    let description = $("#trackDescription").val().trim();
    let tracking = $("#trackNumber").val().trim();
    let phone = $("#trackPhone").val();
    let carrier = $("#trackCarrier").val();
    let pageNum = $(this).find("#createTrack").attr("page");
    let trackId = $(this).find("#createTrack").attr("trackId");
    if (buttonType === "Create") {
      $.post("/add-tracking", {
        description: description,
        tracking: tracking,
        carrier: carrier,
        phone: phone,
      }).then((data) => {
        if (data.alert === "Error") {
          notificationToast(data.alert, data.message);
        } else {
          $("#modalTrackCenter").modal("hide");
          notificationToast(data.alert, data.message);
          paginationTracking(1);
        }
      });
    } else if (buttonType == "Update") {
      //console.log(`PageNum: ${pageNum} PostId: ${postId}`);
      let changes = {
        description: description,
        tracking: tracking,
        carrier: carrier,
        phone: phone,
      };
      $.ajax({
        url: `/update-tracking/${trackId}`,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(changes),
        success: function (data) {
          $("#modalTrackCenter").modal("hide");
          notificationToast(data.alert, data.message);
          paginationTracking(pageNum);
        },
      });
    }
  });

  //List all the tracking numbers
  function paginationTracking(pageNumber) {
    $("#pagination-containertrack").empty();
    if ($("#pagination-containertrack").length) {
      //console.log("Entro")
      //Pagination
      $("#pagination-containertrack").pagination({
        dataSource: function (done) {
          $.ajax({
            type: "GET",
            url: "/get-all-tracking",
            success: function (response) {
              //console.log(response)
              done(response.data);
            },
          });
        },
        pageSize: 10,
        pageNumber: pageNumber,
        callback: function (data, pagination) {
          $("#trackList").empty();
          for (let i = 0; i < data.length; i++) {
            newItem = $("<tr>");
            descriptionTrack = $("<td>");
            descriptionTrack.text(data[i].description);
            trackingTrack = $("<td>");
            trackingTrack.text(data[i].tracking);
            carrierTrack = $("<td>");
            carrierTrack.text(data[i].carrier);
            statusTrack = $("<td>");
            statusTrack.text(data[i].status);
            actionTrack = $("<td>");
            etaTrack=$("<td>");
            let eta_date=moment(data[i].eta).format("DD-MM-YYYY")
            etaTrack.text(eta_date);

            //Button Edit
            buttonEdit = $("<button>");
            buttonEdit.attr("type", "button");
            buttonEdit.attr("class", "btn btn-primary editTrack");
            buttonEdit.css("margin", "5px");
            buttonEdit.attr("value", data[i].id);
            buttonEdit.attr("page", pagination.pageNumber);
            editIcon = $("<i>");
            editIcon.attr("class", "fas fa-edit");
            buttonEdit.append(editIcon);
            //Button Delete
            buttonDelete = $("<button>");
            buttonDelete.attr("type", "button");
            buttonDelete.attr("class", "btn btn-danger deleteTrack");
            buttonDelete.css("margin", "5px");
            buttonDelete.attr("value", data[i].id);
            buttonDelete.attr("page", pagination.pageNumber);
            deleteIcon = $("<i>");
            deleteIcon.attr("class", "fas fa-trash-alt");
            buttonDelete.append(deleteIcon);
            //Append Icons to Div
            actionTrack.append(buttonEdit);
            actionTrack.append(buttonDelete);

            newItem.append(descriptionTrack);
            newItem.append(trackingTrack);
            newItem.append(carrierTrack);
            newItem.append(statusTrack);
            newItem.append(etaTrack)
            newItem.append(actionTrack);
            //Append Item to Tweet
            $("#trackList").append(newItem);
          }
        },
      });
    }
  }

  //Open Modal to Confirm Delete Tracking

  $(document).on("click", ".deleteTrack", function (event) {
    event.preventDefault();
    let trackId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    $.get(`/get-tracking-id/${trackId}`, () => {}).then((data) => {
      const { tracking } = data;
      //console.log(post);
      buttonBorrarTrack(trackId, pageNum);
      $("#adminModalCenter").modal("show");
      clearUserForm();
      $("#adminModalLongTitle").text("Borrar Tracking");
      $("#modalBodyAlert").css("display", "inline-block");
      $("#modalBodyAlert").text(
        `Seguro que quieres borrar el tracking de ${tracking.description}`
      );
    });
  });

  //Confirmar Borrar Tracking
  $(document).on("click", "#buttonBorrarTrack", function (event) {
    event.preventDefault();
    let trackId = $(this).attr("value");
    let pageNum = $(this).attr("page");
    $.ajax({
      url: `/delete-tracking/${trackId}`,
      type: "DELETE",
      contentType: "application/json",
      success: function (data) {
        //console.log(data)
        $("#adminModalCenter").modal("hide");
        notificationToast(data.alert, data.message);
        //console.log("Usuario borrado");
        paginationTracking(pageNum);
      },
    });
  });
  //Create button to Delete tracking
  function buttonBorrarTrack(trackId, pageNum) {
    $("#modalFooter").empty();

    //Boton Cerrar
    let buttonClose = $("<button>");
    buttonClose.attr("class", "btn btn-secondary rounded-pill");
    buttonClose.attr("data-dismiss", "modal");
    buttonClose.text("Cerrar");
    $("#modalFooter").append(buttonClose);

    //Boton Borrar
    let buttonBorrar = $("<button>");
    buttonBorrar.attr("class", "btn btn-danger rounded-pill");
    buttonBorrar.attr("id", "buttonBorrarTrack");
    buttonBorrar.text("Eliminar");
    buttonBorrar.attr("value", trackId);
    buttonBorrar.attr("page", pageNum);
    $("#modalFooter").append(buttonBorrar);
  }

  //Limpiar User Form
  function clearUserForm() {
    $("#userForm").css("display", "none");
  }

  //Abrir Modal para Editar Tracking
  $(document).on("click", ".editTrack", function (event) {
    event.preventDefault();
    let pageNum = $(this).attr("page");
    let trackId = $(this).attr("value");

    $.get(`/get-tracking-id/${trackId}`, () => {}).then((data) => {
      const { tracking } = data;
      //console.log(tracking)
      $("#modalTrackLongTitle").text("Actualizar Tracking");
      $("#createTrack").text("Actualizar");
      $("#createTrack").attr("trackId", trackId);
      $("#createTrack").attr("page", pageNum);
      $("#modalTrackCenter").attr("type", "Update");
      $("#trackDescription").val(tracking.description);
      $("#trackNumber").val(tracking.tracking);
      $("#trackPhone").val(tracking.phone);
      $("#trackCarrier").val(tracking.carrier);

      $("#modalTrackCenter").modal("show");
    });
  });

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
