$(document).ready(function () {

   // Local Variables
   let chk_status = true;
   let action_type, url;
   let alert_msg = '';

   // Spectrum Picker
   $('#txt_color').spectrum({
      type: "text",
      showPalette: false,
   });

   // RETRIEVE / GET
   // List Table
   let table = $('#dt_forms').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 4,
      "ajax": {
         url: '/api/requests/formtype/?format=datatables',
         type: "GET",
         dataSrc: function (json) {
            return json.data.filter(function (item) {
               return item.is_archive == false;
            });
         }
      },
      "columns": [
         { data: "name" },
         {
            render: function (data, type, row) {
               data = `<div class="circle" style="background-color:${row.color};"></div>`;
               return data
            }
         },
         {
            render: function (data, type, row) {
               data = row.form_fields
               return data
            }
         },
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
               data = `<a href='#' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>
                     <a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>`;
               return data
            },
         }
      ],
   });

   // Select2 Config
   $('#dd_depthead').select2({
      allowClear: true,
      placeholder: 'Select Head of Department',
      cache: true,
   });

   // Get Dropdown Value
   $('#dd_depthead').on('change', function () {
      dd_head_id = $("#dd_depthead option:selected").val();
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
      url = '/api/config/department/';
      alert_msg = 'Saved Successfully';

      $("#formModal").modal();
      $(".modal-title").text('New Form');
      $('#txt_typename').val('');
      $('#txt_color').val('');

      // Add and Remove fields
      $('#btn_add').click(function () {
         let row = $('.field_wrapper');
         row.append(
            `<div class="row">
               <div class="col-md-11">
                  <div class="form-group">
                     <input type="text" class="form-control form-control-sm" id="txt_fields"
                        placeholder="Enter field name">
                     <small class="error-info"></small>
                  </div>
               </div>
               <div class="col-md-1">
                  <button type="button" class="btn btn-link btn-sm" id="btn_remove">
                     <span class="fas fa-xs fa-times"></span>
                  </button>
               </div>
            </div>`
         )
      });

      $('.field_wrapper').on('click', '#btn_remove', function () {
         $(this).parents("div.row").remove()
      });
   });

   // UPDATE / PUT
   $('#dt_department tbody').on('click', '.btn_edit', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id'];

      // Assign AJAX Action Type/Method and URL
      action_type = 'PUT';
      url = `/api/config/department/${id}/`;
      alert_msg = 'Update Successfully';

      // Open Modal
      // Rename Modal Title
      $("#formModal").modal();
      $(".modal-title").text('Update Department');

      // Populate Fields
      $('#txt_deptname').val(dt_data['name']);
      $('#dd_depthead').val(dt_data['department_head'].id).trigger('change');
      $('#chk_status').prop("checked", dt_data['is_active']);
   });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      let data = {}
      let success = 1;

      // Data
      data.name = $('#txt_typename').val();
      data.color = $('#txt_color').val();
      data.is_active = chk_status;
      data.is_archive = false;

      // Validation
      if ($('#txt_deptname').val() == '') {
         $('#txt_deptname').addClass('form-error');
         $('.error-info').html('*This field cannot be empty');
         success--;
      } else {
         $('#txt_deptname').removeClass('form-error');
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
            error: function (a, b, error) {
               Toast.fire({
                  icon: 'error',
                  title: error,
               });

               console.log(a)
            },
         }).done(function () {
            $('#formModal').modal('toggle');
            $('#dd_depthead').val('').trigger('change');
            $('#chk_status').prop("checked", true);
         });
      }
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
               url: `/api/config/department/${id}/`,
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

});

