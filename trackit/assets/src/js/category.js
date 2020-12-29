$(document).ready(function () {

   // Local Variables
   let dd_type_id;
   let chk_status = true;
   let action_type, url;
   let alert_msg = '';

   // Sweet Alert Toast 
   const Toast = Swal.mixin({
      toast: true,
      position: 'center',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      onOpen: (toast) => {
         toast.addEventListener('mouseenter', Swal.stopTimer)
         toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
   });

   // GET
   // List Table
   let table = $('#dt_category').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "ajax": {
         url: '/api/config/category/?format=datatables',
         type: "GET",
         dataSrc: function (json) {
            return json.data.filter(function (item) {
               return item.is_archive == false;
            });
         }
      },
      "columns": [
         { data: "name" },
         { data: "category_type.name" },
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
               if($('#changeCategoryHidden').val() == 'true') {
                  data = data + "<a href='#' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>";
               }
               if($('#deleteCategoryHidden').val() == 'true') {
                  data = data + "<a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>";
               }
               return data
            },
         }
      ],
   });

   // Select2 Config
   $('#dd_types').select2({
      allowClear: true,
      placeholder: 'Select Category Type',
      cache: true,
   });

   // Get Dropdown Value
   $('#dd_types').on('change', function () {
      dd_type_id = $("#dd_types option:selected").val();
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
   $('#btn_new').on('click', function () {
      // Assign AJAX Action Type and URL
      action_type = 'POST';
      url = '/api/config/category/'
      alert_msg = 'Saved Successfully';

      $("#formModal").modal();
      $(".modal-title").text('New Category Type');
      $('#txt_categoryname').val('');
   });


   // UPDATE / PUT
   $('#dt_category tbody').on('click', '.btn_edit', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id'];

      // Assign AJAX Action Type/Method and URL
      action_type = 'PUT';
      url = `/api/config/category/${id}/`;
      alert_msg = 'Update Successfully';

      // Open Modal
      // Rename Modal Title
      $("#formModal").modal();
      $(".modal-title").text('Update Cataegory');

      // Populate Fields
      $('#txt_categoryname').val(dt_data['name']);
      $('#dd_types').val(dt_data['category_type'].id).trigger('change');
      $('#chk_status').prop("checked", dt_data['is_active']);
   });


   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      var data = {}
      var success = 2;

      // Data Values
      data.name = $('#txt_categoryname').val();
      data.category_type = dd_type_id;
      data.is_active = chk_status;

      // Validation
      if ($('#txt_categoryname').val() == '') {
         $('#txt_categoryname').addClass('form-error');
         $('#error-info-name').html('*This field cannot be empty');
         success--;
      } else {
         $('#txt_categoryname').removeClass('form-error');
         $('#error-info-name').html('');
      }

      if ($("#dd_types option:selected").val() == "") {
         $('.select2-selection--single').css('border-color', '#dc3546a2');
         $('#error-info-type').html('*This field cannot be empty');
         success--;
      } else {
         $('#dd_types').removeClass('form-error');
         $('#error-info-type').html('');
      }

      // Form is Valid
      if (success == 2) {
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
                  $('#txt_categoryname').addClass('form-error');
                  $('#error-info-name').html(`*${xhr.responseJSON.name}`)
               } else {
                  $('#txt_categoryname').removeClass('form-error');
                  $('#error-info-name').html('')
               }
               if (xhr.responseJSON.category_type) {
                  $('.select2-selection--single').css('border-color', '#dc3546a2'); // change border color to red
                  $('#error-info-type').html(`*${xhr.responseJSON.category_type}`)
               } else {
                  $('.select2-selection--single').css('border-color', '#ced4da'); // change border color to light gray
                  $('#error-info-type').html('')
               }
               Toast.fire({
                  icon: 'error',
                  title: error,
               });
            },
         }).done(function () {
            $('#formModal').modal('hide');
            $('#dd_types').val('').trigger('change');
            $("#form").trigger("reset");
            $('.error-info').html('');
         });
      }
   });

   // DELETE / PATCH
   $('#dt_category tbody').on('click', '.btn_delete', function () {
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
               url: `/api/config/category/${id}/`,
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

   // DELETE / PATCH
   $('#dt_department tbody').on('click', '.btn_delete', function () {
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
               url: `/api/config/category/${id}/`,
               type: 'PATCH',
               data: {
                  is_archive: true,
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
      $('#txt_categoryname').removeClass('form-error');
      $('.select2-selection--single').css('border-color', '');
      $('.error-info').html('');
      $('#chk_status').prop("checked", true);
      $('#dd_types').val('').trigger('change');
   });

   // RELOAD TABLE
   $("#btn_reload").click(function () {
      table.ajax.reload();
   });

});