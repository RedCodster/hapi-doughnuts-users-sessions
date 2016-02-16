// Your solution here
$(document).ready(function () {
  // utility
  var createNewLi = function (id, flavor, style) {
    var newLi = '' +
      '<li data-id="' + id + '" data-flavor="' + flavor + '" data-style="' +  style + '">' +
        flavor + ' - ' +
        '<em>' + style + '</em> -' +
        '<button class="edit btn btn-warning">edit</button>' +
        '<button class="delete btn btn-danger">delete</button>' +
      '</li>';

    $('#doughnuts').append(newLi);
  };

  // Main
  var deleteDonut = function (elem) {
    var id = $(elem).parent().data("id");

    $.ajax({
      url: "http://0.0.0.0:8000/api/doughnuts/" + id,
      method: "DELETE",
      success: function (response, status) {
        console.log(response);
        $(elem).parent().remove();
      },
      error: function (response, status) {
        console.log(response);
      }
    });
  };
  //
  var bindButtons = function () {
    $('.edit').off().on("click", function (e) {
      e.preventDefault();
      $('#edit-modal').modal('show');

      var id     = $(this).parent().data('id');
      var flavor = $(this).parent().data('flavor');
      var style  = $(this).parent().data('style');

      $('#edit-doughnut').data("id", id);
      $('#edit-doughnut-flavor').val(flavor);
      $('#edit-doughnut-style').val(style);
    });

    $('.delete').off().on("click", function (e) {
      e.preventDefault();
      deleteDonut(this);
    });
  };

  var getAllDonuts = function () {
    $.ajax({
      url: "http://0.0.0.0:8000/api/doughnuts",
      method: "GET",
      success: function (response, status) {
        response.forEach(function (elem) {
          createNewLi(elem._id, elem.flavor, elem.style);
        });
        bindButtons();
      },
      error: function (response, status) {
        console.log(response);
      }
    });
  };

  var bindCreateButton = function () {
    $('#new-doughnut').on('submit', function (e) {
      e.preventDefault();

      var flavor = $('#new-doughnut-flavor').val();
      var style = $('#new-doughnut-style').val();

      $.ajax({
        url: "http://0.0.0.0:8000/api/doughnuts",
        method: "POST",
        data: {
          flavor: flavor,
          style: style
        },
        success: function (response, status) {
          createNewLi(response._id, response.flavor, response.style);
          bindButtons();
        },
        error: function (response, status) {
          console.log(response);
        }
      });
    });
  };

  var bindUpdateDonut = function () {
    $('#edit-doughnut').on("submit", function (e) {
      e.preventDefault();

      var id = $(this).data("id");
      var flavor = $('#edit-doughnut-flavor').val();
      var style = $('#edit-doughnut-style').val();

      $.ajax({
        url: "http://0.0.0.0:8000/api/doughnuts/" + id,
        method: "PUT",
        data: {
          flavor: flavor,
          style: style
        },
        success: function (response, status) {
          console.log(response);
          $('li[data-id="' + id + '"]').remove();
          createNewLi(id, flavor, style);
          bindButtons();
          $('#edit-modal').modal('hide');
        },
        error: function (response, status) {
          console.log(response);
        }
      });
    });
  };

  var bindSignout = function () {
    $('#signout').on('click', function (e) {
      $.ajax({
        type: "DELETE",
        url: '/api/sessions',
        success: function (response) {
          console.log(response);
          window.location.href = '/';
        }
      });
    });
  };

  var init = function () {
    getAllDonuts();
    bindCreateButton();
    bindUpdateDonut();
    bindSignout();
  };

  init();
});
