$(document).ready(function () {
   let action_type, url;
   let alert_msg = '';

   // Select2 Config
   $('#select2-permissions').select2({
      allowClear: true,
      placeholder: 'Select Permissions',
      cache: true,
   });
 
   // RETRIEVE / GET
   let table = $('#dt_group').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 10,
      "ajax": {
         url: '/api/core/group/?format=datatables',
         type: "GET",
      },
      "columns": [
         { data: "name" },
         {
            data: "null",
            render: function (data, type, row) {
               data = '';
               if($('#changeGroupHidden').val() == 'true') {
                  data = data + "<a href='#' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>";
               }
               if($('#archiveGroupHidden').val() == 'true') {
                  data = data + "<a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>";
               }
               return data
            },
         }
      ],
   });
   
   // Create new group button
   $('#btn-create-group').click(function(e){
      // Assign Axios Action Type and URL
      action_type = 'POST';
      url = '/api/core/group/';
      alert_msg = 'Saved Successfully';

      $("#modal-add-group").modal();
      $(".modal-title").text('New Group');
      $('#txt-group-name').val('');
   });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      let data = {}
      let success = 1;

      // Data
      data.name = $('#txt-group-name').val();
      data.permissions = $('#select2-permissions').val();;

      // Validation
      if ($('#txt-group-name').val() == '') {
         $('#txt-group-name').addClass('form-error');
         $('#group-name-error').html('*This field cannot be empty');
         success--;
      } else {
         $('#txt-group-name').removeClass('form-error');
         $('#group-name-error').html('');
      }

      // Form is Valid
      // if (success == 1) {
      //    $.ajax({
      //       url: url,
      //       type: action_type,
      //       data: data,
      //       beforeSend: function (xhr, settings) {
      //          xhr.setRequestHeader("X-CSRFToken", csrftoken);
      //       },
      //       success: function (result) {
      //          Toast.fire({
      //             icon: 'success',
      //             title: alert_msg,
      //          });
      //          table.ajax.reload();
      //       },
      //       error: function (xhr, status, error) {
      //          if (xhr.responseJSON.name) {
      //             $('#txt_deptname').addClass('form-error');
      //             $('.department-error').html(`*${xhr.responseJSON.name}`)
      //          } else {
      //             $('#txt_deptname').removeClass('form-error');
      //             $('.department-error').html('')
      //          }
      //          if (xhr.responseJSON.department_head) {
      //             $('.select2-selection--single').css('border-color', '#dc3546a2'); // change border color to red
      //             $('.dept-head-error').html(`*${xhr.responseJSON.department_head}`)
      //          } else {
      //             $('.select2-selection--single').css('border-color', '#ced4da'); // change border color to light gray
      //             $('.dept-head-error').html('')
      //          }
      //          Toast.fire({
      //             icon: 'error',
      //             title: error,
      //          });
      //       },
      //    }).done(function () {
      //       $('#formModal').modal('toggle');
      //       $('#dd_depthead').val('').trigger('change');
      //       $("#form").trigger("reset");
      //       $('.error-info').html('');
      //    });
      // }
   });

});