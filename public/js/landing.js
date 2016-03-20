/**
 * Created by AlWilliam on 3/21/2016.
 */
$('#lobbycode').on('input propertychange paste', function () {
  $('#joinlobby').attr("href", "/game/" + $('#lobbycode').val());
});
$.get("/api/users", function(data, status){
  $('#users').text(data);
});
$.get("/api/totalgames", function(data, status){
  $('#games').text(data);
});
