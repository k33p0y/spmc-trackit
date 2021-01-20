$(document).ready(function () {
      let action_type, url;
      let alert_msg = '';

      // Permissions Select2 Config
      $('#select2-permissions').select2({
         allowClear: true,
         placeholder: 'Select Permissions',
         cache: true,
      });

      // Groups Select2 Config
      $('#select2-groups').select2({
         allowClear: true,
         placeholder: 'Select Groups',
         cache: true,
      });

      // Deparments Select2 Config
      $('#select2-departments').select2({
         allowClear: true,
         placeholder: 'Select Departments',
         cache: true,
      });
  
   // RETRIEVE / GET
   let table = $('#dt_user').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 10,
      "ajax": {
         url: '/api/core/user/?format=datatables',
         type: "GET",
      },
      "columns": [
         { data: "username" },
         { data: "first_name" },
         { data: "last_name" },
         {
         data: null,
         render: function (data, type, row) {
            if (type == 'display') {
               data = '';
               if (row.is_staff == true) {
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
               if($('#changeUserHidden').val() == 'true') {
                  data = data + "<a href='#' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>";
               }
               if($('#archiveUserHidden').val() == 'true') {
                  data = data + "<a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>";
               }
               return data
            },
         }
      ],
   }); // table end
    
   // Create new group button
   $('#btn-create-user').click(function(e){
      // Assign Axios Action Type and URL
      action_type = 'POST';
      url = '/api/core/user/';
      alert_msg = 'Saved Successfully';
      $('.password-group').show()

      $("#form").trigger("reset"); // reset form
      $("#select2-permissions").val([]).trigger('change'); // reset permissions select2 before loading modal
      $("#select2-groups").val([]).trigger('change'); // reset groups select2 before loading modal
      $("#modal-add-user").modal();
      $(".modal-title").text('New User');
   }); // create new group button end
 
   // UPDATE / PUT
   $('#dt_user tbody').on('click', '.btn_edit', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id'];

      // Assign AJAX Action Type/Method and URL
      action_type = 'PUT';
      url = `/core/user/${id}/update`;
      alert_msg = 'Update Successfully';
      $('.password-group').hide()

      // // // Open Modal
      // // // Rename Modal Title
      $("#modal-add-user").modal();
      $(".modal-title").text('Update User');

      // // // Populate Fields
      $('#txt-username').val(dt_data['username']); // USERNAME
      $('#txt-firstname').val(dt_data['first_name']); // FIRST NAME
      $('#txt-lastname').val(dt_data['last_name']); // LAST NAME
      if (dt_data['is_superuser']) $('#chk-superuser-status').prop('checked', true); else $('#chk-superuser-status').prop('checked', false); // IS SUPERUSER
      if (dt_data['is_staff']) $('#chk-staff-status').prop('checked', true); else $('#chk-staff-status').prop('checked', false); // IS STAFF
      if (dt_data['is_active']) $('#chk-active-status').prop('checked', true); else $('#chk-active-status').prop('checked', false); // IS ACTIVE
      $('#select2-groups').val(dt_data['groups']).trigger('change'); // GROUPS
      $('#select2-permissions').val(dt_data['user_permissions']).trigger('change'); // PERMISSIONS
   });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      let data = {}
      let success = 1;

      // Data
      data.username = $('#txt-username').val();
      if ($('#txt-password1').val()) data.password = $('#txt-password1').val();
      if ($('#txt-password2').val()) data.password2 = $('#txt-password2').val();
      data.first_name = $('#txt-firstname').val();
      data.last_name = $('#txt-lastname').val();
      data.is_superuser = $('#chk-superuser-status').is(':checked')
      data.is_staff = $('#chk-staff-status').is(':checked')
      data.is_active = $('#chk-active-status').is(':checked')
      data.groups = $('#select2-groups').val();
      data.user_permissions = $('#select2-permissions').val();
      
      axios({
         method: action_type,
         url: url,
         data: data,
         headers: axiosConfig,
      }).then(function (response) { // success
         Toast.fire({
            icon: 'success',
            title: alert_msg,
         });
         
         $("#form").trigger("reset"); // reset form
         $("#select2-permissions").val([]).trigger('change'); // reset permissions select2
         $("#select2-groups").val([]).trigger('change'); // reset groups select2
         $('#modal-add-user').modal('toggle');
         table.ajax.reload();
      }).catch(function (error) { // error
         if (error.response.data.username) showFieldErrors(error.response.data.username, 'username'); else removeFieldErrors('username');
         if (error.response.data.first_name) showFieldErrors(error.response.data.first_name, 'firstname'); else removeFieldErrors('firstname');
         if (error.response.data.last_name) showFieldErrors(error.response.data.last_name, 'lastname'); else removeFieldErrors('lastname');
         if (error.response.data.password) showFieldErrors(error.response.data.password, 'password'); else removeFieldErrors('password');

         Toast.fire({
            icon: 'error',
            title: error,
         });
      });
   }); // submit form end

   let showFieldErrors = function(obj, field){
      if (field === 'password') {
         $(`#txt-${field}1`).addClass('form-error')
         $(`#txt-${field}2`).addClass('form-error')
      } else $(`#txt-${field}`).addClass('form-error');
      let errors = ''
      for (i=0; i<obj.length; i++) errors += `${obj[i]} `;
      $(`#${field}-error`).html(`*${errors}`)
   };

   let removeFieldErrors = function(field){
      if (field === 'password') {
         $(`#txt-${field}1`).removeClass('form-error')
         $(`#txt-${field}2`).removeClass('form-error')
      } else $(`#txt-${field}`).removeClass('form-error');
      $(`#${field}-error`).html(``)
   };
});