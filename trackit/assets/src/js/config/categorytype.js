$(document).ready(function () {

   var searchInput = function() { return $('#search-input').val(); }
   var activeFilter = function() { return $('#active-filter').val(); }

   // Local Variables
   let chk_status = true;
   let action_type, url;
   let alert_msg = '';

   // GET
   // List Table
   let table = $('#dt_category_type').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "ajax": {
         url: '/api/config/categorytype/?format=datatables',
         type: "GET",
         data: {
            "search": searchInput,
            "is_active": activeFilter,
            "is_archive": false
         },
      },
      "columns": [
         { data: "name" },
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {

                  if (row.is_active == true) {
                     data = "<i class='fas fa-check-circle text-success'></i>";
                  } else {
                     data = "<i class='fas fa-times-circle text-secondary'></i>";
                  }
               }
               return data
            }
         },
         {
            data: "null",
            render: function (data, type, row) {
               data = '';
               if($('#changeTypeHidden').val() == 'true') {
                  data = data + "<a href='#' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>";
               }
               if($('#deleteTypeHidden').val() == 'true') {
                  data = data + "<a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>";
               }
               return data
            },
         }
      ],
   });

   // Get Checkbox State
   $('#chk_status').click(function () {
      if ($(this).prop("checked") == true) {
         chk_status = true;
      }
      else if ($(this).prop("checked") == false) {
         chk_status = false;
      }
   });

   // CREATE / POST
   $('#btn-create-type').on('click', function () {
      // Assign AJAX Action Type and URL
      action_type = 'POST';
      url = '/api/config/categorytype/'
      alert_msg = 'Saved Successfully';

      $("#formModal").modal();
      $(".modal-title").text('New Category Type');
      $('#txt_typename').val('');
   });

   // UPDATE / PUT
   $('#dt_category_type tbody').on('click', '.btn_edit', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id'];

      // Assign AJAX Action Type/Method and URL
      action_type = 'PUT';
      url = `/api/config/categorytype/${id}/`;
      alert_msg = 'Update Successfully';

      // Open Modal
      // Rename Modal Title
      $("#formModal").modal();
      $(".modal-title").text('Update Cataegory Type');

      // Populate Fields
      $('#txt_typename').val(dt_data['name']);
      $('#chk_status').prop("checked", dt_data['is_active']);
   });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      var data = {}
      var success = 1;

      // Data Values
      data.name = $('#txt_typename').val();
      data.is_active = chk_status;

      // Validation
      if ($('#txt_typename').val() == '') {
         $('#txt_typename').addClass('form-error');
         $('.error-info').html('*This field cannot be empty');
         success--;
      } else {
         $('#txt_typename').removeClass('form-error');
         $('#error-password').html('');
      }

      // Form is Valid
      if (success == 1) {
         $.ajax({
            url: url,
            type: action_type,
            data: data,
            beforeSend: function (xhr, settings) {
               xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            success: function (result) {
               Toast.fire({
                  icon: 'success',
                  title: alert_msg,
               });
               table.ajax.reload();
            },
            error: function (xhr, status, error) {
               if (xhr.responseJSON.name) {
                  $('#txt_typename').addClass('form-error');
                  $('.name-error').html(`*${xhr.responseJSON.name}`)
               } else {
                  $('#txt_typename').removeClass('form-error');
                  $('.name-error').html('')
               }
               Toast.fire({
                  icon: 'error',
                  title: error,
               });
            },
         }).done(function () {
            $('#formModal').modal('toggle');
            $("#form").trigger("reset");
            $('.error-info').html(''); 
         });
      }
   });

   // DELETE / PATCH
   $('#dt_category_type tbody').on('click', '.btn_delete', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id'];

      Swal.fire({
         title: 'Are you sure?',
         icon: 'error',
         showCancelButton: true,
         confirmButtonText: 'Delete',
         confirmButtonColor: '#d9534f',
      }).then((result) => {
         if (result.value) {
            $.ajax({
               url: `/api/config/categorytype/${id}/`,
               type: 'PATCH',
               data: {
                  is_archive: true,
               },
               beforeSend: function (xhr, settings) {
                  xhr.setRequestHeader("X-CSRFToken", csrftoken);
               },
               success: function (result) {
                  Toast.fire({
                     icon: 'success',
                     title: 'Delete Successfully',
                  });
                  table.ajax.reload();
               },
               error: function (a, b, error) {
                  Toast.fire({
                     icon: 'error',
                     title: error,
                  });
               },
            })
         }
      })
   });

   //Modal Cancel
   $('#btn_cancel').click(function () {
      // Reset Fields to Defaults
      $('#txt_typename').removeClass('form-error');
      $('.error-info').html('');
      $('#chk_status').prop("checked", true);
   });

   // // //  Filters
   // Select2 config
   $('.select-filter').select2();

   // Search Bar onSearch Event
   $("#search-input").on('search', function () {
      table.ajax.reload();
      return false; // prevent refresh
   });

   // Search Bar onClick Event
   $("#execute-search").click(function () {
      table.ajax.reload();
      return false; // prevent refresh
   });

   // Apply Filter
   $("#btn_apply").click(function () {
      table.ajax.reload();
      return false; // prevent refresh
   });

   // Clear Filter
   $("#btn_clear").click(function () {
      $('#form-filter').trigger("reset");
      $('#form-filter select').trigger("change");
      table.ajax.reload();
      return false; // prevent refresh
   });
   
   // Close Dropdown 
   $('#close_dropdown').click(function (){ toggleFilter() });

   // Close Dropdown When Click Outside 
   $(document).on('click', function (e) { toggleFilter() });

   // Dropdown Prevent From closing
   $('.dropdown-filter').on('hide.bs.dropdown', function (e) {
      if (e.clickEvent) e.preventDefault();      
   });

});