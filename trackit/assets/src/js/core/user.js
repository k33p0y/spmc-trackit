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
   let table = $('#dt_group').DataTable({
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

      $("#form").trigger("reset"); // reset form
      $("#select2-permissions").val([]).trigger('change'); // reset permissions select2 before loading modal
      $("#select2-groups").val([]).trigger('change'); // reset groups select2 before loading modal
      $("#modal-add-user").modal();
      $(".modal-title").text('New User');
   }); // create new group button end
 
   // UPDATE / PUT
   // $('#dt_group tbody').on('click', '.btn_edit', function () {
   //    let dt_data = table.row($(this).parents('tr')).data();
   //    let id = dt_data['id'];

   //    // Assign AJAX Action Type/Method and URL
   //    action_type = 'PUT';
   //    url = `/api/core/group/${id}/`;
   //    alert_msg = 'Update Successfully';

   //    // // Open Modal
   //    // // Rename Modal Title
   //    $("#modal-add-group").modal();
   //    $(".modal-title").text('Update Group');

   //    // // Populate Fields
   //    $('#txt-group-name').val(dt_data['name']);
   //    $('#select2-permissions').val(dt_data['permissions']).trigger('change');
   // });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      let data = {}
      let success = 1;

      // Data
      data.username = $('#txt-username').val();
      data.password = $('#txt-password').val();
      data.first_name = $('#txt-firstname').val();
      data.last_name = $('#txt-lastname').val();
      data.is_superuser = $('#chk-superuser-status').is(':checked')
      data.is_staff = $('#chk-staff-status').is(':checked')
      data.is_active = $('#chk-active-status').is(':checked')
      data.groups = $('#select2-groups').val();
      data.user_permissions = $('#select2-permissions').val();

      // Validation
      //    if ($('#txt-group-name').val() == '') {
      //       $('#txt-group-name').addClass('form-error');
      //       $('#group-name-error').html('*This field cannot be empty');
      //       success--;
      //    } else {
      //       $('#txt-group-name').removeClass('form-error');
      //       $('#group-name-error').html('');
      //    }
      
      if (success){ // if form is valid
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
            console.log(error.response.data)
            if (error.response.data.name) {
               $('#txt-group-name').addClass('form-error');
               $('#group-name-error').html(`*${error.response.data.name}`)
            } else {
               $('#txt-group-name').removeClass('form-error');
               $('#group-name-error').html('')
            }
            Toast.fire({
               icon: 'error',
               title: error,
            });
         });
      }
   }); // submit form end
});