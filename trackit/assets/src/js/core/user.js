$(document).ready(function () {
   let method, url, action;
   let alert_msg = '';

   var searchInput = function() { return $('#search-input').val(); }
   var staffFilter = function() { return $('#staff-filter').val(); }
   var superuserFilter = function() { return $('#superuser-filter').val(); }
   var activeFilter = function() { return $('#active-filter').val(); }
   var groupFilter = function() { return $('#group-filter').val(); }
   var dateFromFilter = function() { return $('#date-from-filter').val(); }
   var dateToFilter = function() { return $('#date-to-filter').val(); }

   // RETRIEVE / GET
   let table = $('#dt_user').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 25,
      "ajax": {
         url: '/api/core/user/?format=datatables',
         type: "GET",
         data: {
            "search": searchInput,
            "is_staff": staffFilter,
            "is_superuser": superuserFilter,
            "is_active": activeFilter,
            "group": groupFilter,
            "date_from": dateFromFilter,
            "date_to" : dateToFilter
         }
      },
      "columns": [
         { 
            data: "username",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = ($('#changeUserHidden').val() == 'true') ? `<a href="#" class='btn-link-orange action-link btn_edit'>${row.username}</a>` : row.username
               }
               return data
            },
         },
         { 
            data: "last_name",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `${row.last_name}, ${row.first_name} ${row.middle_name} ${row.suffix}`
               }
               return data
            },

         },
         { data: "department" },
         { 
            data: "null",
            render: function (data, type, row) {
               data = '';
               if (row.is_staff) data = data + "<i class='fas fa-lg fa-user-tie text-info mr-2' data-toggle='tooltip' data-placement='bottom' title='Staff'></i>";
               if (row.is_superuser) data = data + "<i class='fas fa-lg fa-unlock-alt text-orange mr-2' data-toggle='tooltip' data-placement='bottom' title='Superuser'></i>";
               if (!row.is_superuser && !row.is_staff) data = "<i class='fas fa-lg fa-user text-secondary mr-2' data-toggle='tooltip' data-placement='bottom' title='User'></i>";
               return data
            },
         },
         { 
            data: "date_joined",
            render: function (data, type, row) {
               datetime = moment(row.date_joined).format('MMM DD, YYYY h:mm a');
               data = `<p class="title mb-1">${datetime}</p>`
               return data
            },
         },
         { 
            data: "is_active",
            render: function (data, type, row) {
               if (row.is_active === true) data = "<i class='fas fa-check-circle text-success'></i>";
               else data = "<i class='fas fa-times-circle text-secondary'></i>";
               return data
            },
         },
         {
            data: "null",
            render: function (data, type, row) {
               data = '';
               if($('#changeUserHidden').val() == 'true') {
                  data = data + "<a href='#' class='text-warning action-link btn_edit' data-toggle='tooltip' data-placement='bottom' title='Edit'> <i class='fas fa-pen'></i> </a>";
               }
               if($('#changePasswordHidden').val() == 'true') {
                  data = data + "<a href='#' class='text-secondary action-link btn_change_password' data-toggle='tooltip' data-placement='bottom' title='Change Password'> <i class='fas fa-key'></i> </a>";
               }
               return data
            },
         }
      ],
   }); // table end

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

   // Create
   $('#btn-create-user').click(function(e){
      // Assign Axios Action Type and URL
      method = 'POST';
      action = 'CREATE';
      url = '/api/core/user/';
      alert_msg = 'Saved Successfully';
      $('.name-group').show() // username, firstname, lastname
      $('.password-group').show() // password1, password2
      $('.status-group').show() // is-active, is-superuser, is-staff
      $('.m2m-group').show() // groups, user permissions

      resetForm(); // reset form
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
      method = 'PUT';
      action = 'UPDATE';
      url = `/core/user/${id}/update`;
      alert_msg = 'Update Successfully';
      $('.name-group').show()
      $('.password-group').hide()
      $('.status-group').show()
      $('.m2m-group').show()

      // // // Open Modal
      // // // Rename Modal Title
      $("#modal-add-user").modal();
      $(".modal-title").text('Update User');

      // // // Populate Fields
      resetForm(); // reset form
      $('#txt-username').val(dt_data['username']); // USERNAME
      $('#txt-firstname').val(dt_data['first_name']); // FIRST NAME
      $('#txt-lastname').val(dt_data['last_name']); // LAST NAME
      if (dt_data['is_superuser']) $('#chk-superuser-status').prop('checked', true); else $('#chk-superuser-status').prop('checked', false); // IS SUPERUSER
      if (dt_data['is_staff']) $('#chk-staff-status').prop('checked', true); else $('#chk-staff-status').prop('checked', false); // IS STAFF
      if (dt_data['is_active']) $('#chk-active-status').prop('checked', true); else $('#chk-active-status').prop('checked', false); // IS ACTIVE
      $('#select2-groups').val(dt_data['groups']).trigger('change'); // GROUPS
      $('#select2-permissions').val(dt_data['user_permissions']).trigger('change'); // PERMISSIONS
   });

   // CHANGE PASSWORD / PUT
   $('#dt_user tbody').on('click', '.btn_change_password', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id'];

      // Assign AJAX Action Type/Method and URL
      method = 'PUT';
      action = 'CHANGE-PASSWORD';
      url = `/api/core/user/${id}/`;
      alert_msg = 'Password Changed';
      $('.name-group').hide()
      $('.password-group').show()
      $('.status-group').hide()
      $('.m2m-group').hide()

      // // // Open Modal
      // // // Rename Modal Title
      $("#modal-add-user").modal();
      $(".modal-title").text(`Change password for ${dt_data['first_name']} ${dt_data['last_name']}`);

      // // // // Populate Fields
      resetForm(); // reset form
      $('#txt-username').val(dt_data['username']); // USERNAME
   });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      let data = {}
      let success = 1;

      // Data
      if ($('#txt-username').val()) data.username = $('#txt-username').val();
      if ($('#txt-password1').val()) data.password = $('#txt-password1').val();
      if ($('#txt-password2').val()) data.password2 = $('#txt-password2').val();
      if ($('#txt-firstname').val()) data.first_name = $('#txt-firstname').val();
      if ($('#txt-lastname').val()) data.last_name = $('#txt-lastname').val();
      if ($('#chk-superuser-status').val()) data.is_superuser = $('#chk-superuser-status').is(':checked')
      if ($('#chk-staff-status').val()) data.is_staff = $('#chk-staff-status').is(':checked')
      if ($('#chk-active-status').val()) data.is_active = $('#chk-active-status').is(':checked')
      if ($('#select2-groups').val()) data.groups = $('#select2-groups').val();
      if ($('#select2-permissions').val()) data.user_permissions = $('#select2-permissions').val();
      
      axios({
         method: method,
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

   let resetForm = function(e){
      $('#form').trigger('reset');
      removeFieldErrors('username');
      removeFieldErrors('firstname');
      removeFieldErrors('lastname');
      removeFieldErrors('password');
   }
});