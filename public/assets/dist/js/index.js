$(document).ready(function () {
  $("#facebookFrame").attr(
    "src",
    "https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fnetzwerkmx&tabs=timeline&width=340&height=500&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=false&appId=212194213188545"
  );

  $.get("/get-fav-post", () => {}).then((data) => {
    //console.log(data.post)
    for (let i = 0; i < data.post.length; i++) {
      //console.log(data.post[i]);
      //Div del Popular Post
      divFav = $("<div>");
      divFav.attr("class", "widget-posts");

      //Div de la Imagen
      divImg = $("<div>");
      divImg.attr("class", "post-thumb");
      //Link Image
      Imglink = $("<a>");
      Imglink.attr("href", `blog/${data.post[i].url}`);
      picDiv = $("<img>");
      picDiv.attr("src", data.post[i].image);
      picDiv.attr("alt", data.post[i].alt);
      Imglink.append(picDiv);
      divImg.append(Imglink);
      //Div del Titulo
      divTitle = $("<div>");
      divTitle.attr("class", "post-title");
      titleH5 = $("<h5>");
      titleRef = $("<a>");
      titleRef.attr("href", `blog/${data.post[i].url}`);
      titleRef.text(data.post[i].title);
      titleH5.append(titleRef);
      //Agregando todo al Div Fav Post
      divTitle.append(titleH5);
      divFav.append(divImg);
      divFav.append(divTitle);
      //Agregar al Div Principal
      $("#favPost").append(divFav);
    }
  });



});
