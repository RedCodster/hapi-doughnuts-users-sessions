$(document).ready(function () {
  $('#signup').on('submit', function (e) {
    e.preventDefault();
    $('#signup-form-message').text('');

    var user = {
      email   : $('#signup [name="email"]').val(),
      name    : $('#signup [name="name"]').val(),
      username: $('#signup [name="username"]').val(),
      password: $('#signup [name="password"]').val()
    };

    $.ajax({
      type: "POST",
      url: '/api/users',
      data: user,
      success: function (response) {
        console.log(response);
        $('#signup-form-message').text('User Successfully Created');
          $('#signup [name="email"]').val('');
          $('#signup [name="name"]').val('');
          $('#signup [name="username"]').val('');
          $('#signup [name="password"]').val('');
        },
      error: function (respsonse) {
        console.log(respsonse);
        $('#signup-form-message').text(respsonse.responseJSON.message);
      }
    })

  });

  $('#signin').on('submit', function (e) {
    e.preventDefault();

    var user = {
      username: $('#signin [name="username"]').val(),
      password: $('#signin [name="password"]').val()
    };

    $.ajax({
      type: "POST",
      url: "http://0.0.0.0:8000/api/sessions",
      data: user,
      dataType: 'JSON',
      xhrFields: {
        withCredentials: true
      },
      success: function(response){
        console.log(response);
        window.location.href = '/doughnuts';
      },
      error: function(response){
        console.log(response);
      }
    });
  });

  $.ajax({
    type: "GET",
    url: "/api/authenticated",
    success: function(response){
      if (response.authenticated) {
        window.location.href = '/doughnuts';
      } else {
        console.log(response);
      }
    }
  });
});