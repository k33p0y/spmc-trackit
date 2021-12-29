$(document).ready(function () {
   let method, url, action;
   let department;
   let alert_msg = '';

   var searchInput = function () { return $('#search-input').val(); }
   var staffFilter = function () { return $('#staff-filter').val(); }
   var superuserFilter = function () { return $('#superuser-filter').val(); }
   var activeFilter = function () { return $('#active-filter').val(); }
   var departmentFilter = function () { return $('#department-filter').val(); }
   var groupFilter = function () { return $('#group-filter').val(); }
   var dateFromFilter = function () { return $('#date-from-filter').val(); }
   var dateToFilter = function () { return $('#date-to-filter').val(); }
   var statusFilter = function () { return $('#status-filter').val(); }

   const getCounterDash = function() {
      const api_url = '/api/core/all/user/';

      $('.spinner-dash').removeClass('d-none'); // remove spinners
      $('.counter').html(''); // clear values
         
      $.get(api_url, (response) => { // get all users
         $('#spinner_users').addClass('d-none'); // remove spinners
         $('#count_users').html(response.count) // registered users
      });     
      $.get(api_url, {"is_active" : 0}, (response) => { // get all active users
         $('#spinner_active').addClass('d-none'); // remove spinners
         $('#count_active').html(response.count) // display count
      });
      $.get(api_url, {"is_active" : 1}, (response) => { // get all inactive users
         $('#spinner_inactive').addClass('d-none'); // remove spinners
         $('#count_inactive').html(response.count) // display count
      });
      $.get(api_url, {"is_member" : true}, (response) => { // get all members
         $('#spinner_members').addClass('d-none'); // remove spinners
         $('#count_members').html(response.count) // display count
      });
      $.get(api_url, {"is_staff" : 0}, (response) => { // get all staff
         $('#spinner_staff').addClass('d-none'); // remove spinners
         $('#count_staff').html(response.count) // display count
      });
      $.get(api_url, {"is_superuser" : 0}, (response) => { // get all superuser
         $('#spinner_superuser').addClass('d-none'); // remove spinners
         $('#count_superuser').html(response.count) // display count
      });
      $.get(api_url, {"status" : "declined"}, (response) => { // get all declined users
         $('#spinner_decline').addClass('d-none'); // remove spinners
         $('#count_decline').html(response.count) // display count
      });
      $.get(api_url, {"status" : "pending"}, (response) => { // get all pending
         $('#spinner_pending').addClass('d-none'); // remove spinners
         $('#count_pending').html(response.count) // display count
      });
      $.get(api_url, {"status" : "verified"}, (response) => { // get all verified users
         $('#spinner_verified').addClass('d-none'); // remove spinners
            $('#count_verified').html(response.count) // display count
      });
   }
   getCounterDash();

   // RETRIEVE / GET
   let table = $('#dt_user').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 15,
      "ajax": {
         url: '/api/core/all/user/?format=datatables',
         type: "GET",
         data: {
            "search": searchInput,
            "is_staff": staffFilter,
            "is_superuser": superuserFilter,
            "is_active": activeFilter,
            "department": departmentFilter,
            "group": groupFilter,
            "date_from": dateFromFilter,
            "date_to": dateToFilter,
            "status" : statusFilter
         }
      },
      "columns": [
         {
            data: "first_name",
            render: function (data, type, row) {
               if (type == 'display') {
                  let name_template = `<div class="d-flex align-items-center" id="name_profile">
                     <div class="profile-img">${row.first_name.charAt(0)}${row.last_name.charAt(0)}</div>
                        <div class="ml-2"> 
                           <p class="title text-nowrap m-0">${row.first_name} ${row.last_name}</p> 
                           <span class="sub-title text-muted">${row.username}</span>
                        </div>
                     </div>`;

                  data = ($('#changeUserHidden').val() == 'true') ? `<a href="#" class='btn-link-orange btn_edit'>${name_template}</a>` : name_template;
               }
               return data
            },
         },
         {
            data: "department",
            render: function (data, type, row) {
               if (type == 'display') data = (row.department) ? `${row.department.name}` : '';
               return data
            },
         },
         {
            data: "null",
            render: function (data, type, row) {
               data = '';
               if (row.is_staff) data = "<span class='text-nowrap'><i class='fas fa-user-tie text-info mr-1'></i>Staff</span>";
               if (row.is_superuser) data = "<span class='text-nowrap'><i class='fas fa-unlock-alt text-orange mr-1'></i>Superuser</span>";
               if (!row.is_superuser && !row.is_staff) data = "<span class='text-nowrap'><i class='fas fa-user mr-1'></i>Member</span>";
               return data
            },
         },
         {
            data: "groups",
            render: function (data, type, row) {
               if (type == 'display') {
                  var data = '';
                  if (row.groups) {
                     row.groups.forEach(group => data += `<span class='badge badge-orange text-uppercase p-1 mr-1'> ${group.name}</span>`);
                  }
               }
               return data
            },
         },
         {
            data: "date_joined",
            render: function (data, type, row) {
               if (type == 'display') {
                  var date = moment(row.date_joined).format('DD MMMM YYYY');
                  var time = moment(row.date_joined).format('h:mm:ss a');

                  data = `<p class="title mb-0">${date}</p><span class="sub-title">${time}</span>`
               }
               return data
            },
         },
         {
            data: "verified_at",
            render: function (data, type, row) {
               data = '';
               if (row.is_verified || row.is_superuser || row.is_staff) data = "<div class='badge badge-primary text-uppercase d-inline-flex align-items-center p-1'> <span> Verified </span> </div>";
               else if (row.is_verified == null) data = "<div class='badge badge-info text-uppercase d-inline-flex align-items-center p-1'> <span> Pending </span> </div>";
               else if (row.is_verified == false) data = "<div class='badge badge-warning text-uppercase d-inline-flex align-items-center p-1'> <span> Declined </span> </div>";
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
         }
      ],
      "order": [[4, "desc"]],
   }); // table end

   // Permissions Select2 Config
   $('#select2-permissions').select2({
      allowClear: true,
      placeholder: 'Select permissions',
      cache: true,
      sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),
   });

   // Groups Select2 Config
   $('#select2-groups').select2({
      allowClear: true,
      placeholder: 'Select groups',
      cache: true,
      sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),
   });

   // Deparments Select2 Config
   $('#select2-department').select2({
      allowClear: true,
      placeholder: 'Select department',
      cache: true,
      sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),
   });

   // SElECT ON CHANGE EVENT
   $('#select2-department').on('change', function () { // department dropdown
      department = $("#select2-department option:selected").val();
   });

   // Create
   $('#btn-create-user').click(function (e) {
      // Assign Axios Action Type and URL
      method = 'POST';
      action = 'CREATE';
      url = '/api/core/user/';
      $('.name-group').show() // username, firstname, lastname
      $('.password-group').show() // password1, password2
      $('#btn-change-password').hide() // change passwordlink
      $('.status-group').show() // is-active, is-superuser, is-staff
      $('.m2m-group').show() // groups, user permissions

      resetForm(); // reset form
      $("#select2-department").val('').trigger('change'); // reset department select2 before loading modal
      $("#select2-permissions").val([]).trigger('change'); // reset permissions select2 before loading modal
      $("#select2-groups").val([]).trigger('change'); // reset groups select2 before loading modal
      $("#modal-add-user").modal();
      $(".modal-title").text('Add User');
   }); // create new group button end

   // UPDATE / PUT
   $('#dt_user tbody').on('click', '.btn_edit', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id']

      // Assign AJAX Action Type/Method and URL
      method = 'PUT';
      action = 'UPDATE';
      url = `/core/user/${id}/update`;
      $('.name-group').show()
      $('.password-group').hide()
      $('#btn-change-password').show()
      $('.status-group').show()
      $('.m2m-group').show()

      // // // Open Modal
      // // // Rename Modal Title
      $("#modal-add-user").modal({
         show: true,
         backdrop: 'static',
         keyboard: false,
      });
      $("#modal-add-user .modal-title").text(`Update User - ${dt_data['first_name']} ${dt_data['last_name']}`);

      // // // Populate Fields
      resetForm(); // reset form
      $('#txt-username').val(dt_data['username']); // USERNAME
      $('#txt-firstname').val(dt_data['first_name']); // FIRST NAME
      $('#txt-middlename').val(dt_data['middle_name']); // MIDDLE NAME
      $('#txt-lastname').val(dt_data['last_name']); // LAST NAME
      $('#txt-suffix').val(dt_data['suffix']); // SUFFIX
      $('#txt-email').val(dt_data['email']); // EMAIL ADDRESS
      $('#txt-contact').val(dt_data['contact_no']); // CONTACT NO
      $('#txt-license').val(dt_data['license_no']); // LICENSE NO
      if (dt_data['department']) $('#select2-department').val(dt_data['department'].id).trigger('change'); else $('#select2-department').val('').trigger('change'); // DEPARTMENT
      if (dt_data['is_superuser']) $('#chk-superuser-status').prop('checked', true); else $('#chk-superuser-status').prop('checked', false); // IS SUPERUSER
      if (dt_data['is_staff']) $('#chk-staff-status').prop('checked', true); else $('#chk-staff-status').prop('checked', false); // IS STAFF
      if (dt_data['is_active']) $('#chk-active-status').prop('checked', true); else $('#chk-active-status').prop('checked', false); // IS ACTIVE
      $('#select2-groups').val($.map(dt_data['groups'], (group) => group.id)).trigger('change'); // GROUPS
      $('#select2-permissions').val(dt_data['user_permissions']).trigger('change'); // PERMISSIONS
      $('#btn-change-password').data('user', dt_data);
      verifyDocuments(dt_data['documents']); // VERIFICATION DOCUMENTS

      // // // show alert verification status
      if (dt_data['is_verified'] === true || dt_data['is_superuser'] || dt_data['is_staff']) $(".alert-verified").removeClass('d-none');
      else if (dt_data['is_verified'] === false) $(".alert-decline").removeClass('d-none');
      else if (dt_data['is_verified'] === null) {
         $("#verify_user, #decline_user").data('user', id);
         $(".alert-pending").removeClass('d-none');
      }
   });

   $('#file_wrapper').on('click', '.card-preview', function(e) {
      $('#previewImage').modal('show');
      $("#file_src").prop('src', $(this).data('file'));
   });

   // Submit Form 
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      let data = {}
      data.username = $('#txt-username').val();
      data.password = $('#txt-password1').val();
      data.password2 = $('#txt-password2').val();
      data.first_name = $('#txt-firstname').val();
      data.middle_name = $('#txt-middlename').val();
      data.last_name = $('#txt-lastname').val();
      data.suffix = $('#txt-suffix').val();
      data.email = $('#txt-email').val();
      data.contact_no = $('#txt-contact').val();
      data.department = department
      data.license_no = $('#txt-license').val();
      data.is_superuser = $('#chk-superuser-status').is(':checked')
      data.is_staff = $('#chk-staff-status').is(':checked')
      data.is_active = $('#chk-active-status').is(':checked')
      data.groups = $('#select2-groups').val();
      data.user_permissions = $('#select2-permissions').val();

      axios({
         method: method,
         url: url,
         data: data,
         headers: axiosConfig,
      }).then(function (response) { // success
         toastSuccess('Success');

         $("#form").trigger("reset"); // reset form
         $("#select2-department").val('').trigger('change'); // reset permissions select2
         $("#select2-permissions").val([]).trigger('change'); // reset permissions select2
         $("#select2-groups").val([]).trigger('change'); // reset groups select2
         $('#modal-add-user').modal('toggle');
         table.ajax.reload();
      }).catch(function (error) { // error
         if (error.response.data.username) showFieldErrors(error.response.data.username, 'username'); else removeFieldErrors('username');
         if (error.response.data.first_name) showFieldErrors(error.response.data.first_name, 'firstname'); else removeFieldErrors('firstname');
         if (error.response.data.last_name) showFieldErrors(error.response.data.last_name, 'lastname'); else removeFieldErrors('lastname');
         if (error.response.data.password) showFieldErrors(error.response.data.password, 'password'); else removeFieldErrors('password');
         if (error.response.data.email) showFieldErrors(error.response.data.email, 'email'); else removeFieldErrors('email');
         if (error.response.data.contact_no) showFieldErrors(error.response.data.contact_no, 'contact'); else removeFieldErrors('contact');
         if (error.response.data.department) showFieldErrors(error.response.data.department, 'department'); else removeFieldErrors('department');
      });
   }); // submit form end

   // CHANGE PASSWORD / PUT
   $('#btn-change-password').click(function () {
      let data = $(this).data('user');

      // // // Open Modal
      $('#modal-add-user').modal('hide')
      $('#modal-change-password').modal();

      // // // // Populate Fields
      $("#info-user").text(`${data.first_name} ${data.last_name}`)
      $('#txt-username').val(data.username); // USERNAME
      $('#btn_submit_password').data('id', data.id)
   });

   // Sumbit Change Password
   $('#btn_submit_password').click(function (e) {
      e.preventDefault();

      // Variables
      let id = $(this).data('id')

      let data = new Object();
      data.username = $('#txt-username').val();
      data.password = $('#txt-changepassword1').val();
      data.password2 = $('#txt-changepassword2').val();

      axios({
         method: 'PUT',
         url: `/api/core/user/${id}/`,
         data: data,
         headers: axiosConfig,
      }).then(function (response) { // success
         toastSuccess('Password Change');

         $("#change-password-form").trigger("reset"); // reset form
         $('#modal-change-password').modal('toggle');
         table.ajax.reload();

      }).catch(function (error) { // error
         if (error.response.data.password) showFieldErrors(error.response.data.password, 'changepassword'); else removeFieldErrors('changepassword');
      });
   });

   // Verify User
   $('#verify_user').click(function (e) {
      const id = $(this).data('user');
      
      axios({
         url: `/api/core/verify/user/${id}/`,
         method: "PUT",
         headers: axiosConfig
      }).then(function (response) {
         $(".spinner-verify").removeClass('d-none');
         $(this).prop('disabled', true)

         setTimeout(function() { 
            $(".spinner-verify").addClass('d-none');
            $('#modal-add-user').modal('toggle');
            toastSuccess('Success'); // alert
            getCounterDash(); // reload counter
            table.ajax.reload(); // reload table
         }, 800);         
      }).catch(function (error) {
         toastError(error.response.statusText)
      });
   });

   // Decline User
   $('#decline_user').click(function (e) {
      const id = $(this).data('user');
      
      axios({
         url: `/api/core/decline/user/${id}/`,
         method: "PUT",
         headers: axiosConfig
      }).then(function (response) {
         $(".spinner-decline").removeClass('d-none');
         $(this).prop('disabled', true)

         setTimeout(function() { 
            $(".spinner-decline").addClass('d-none');
            $('#modal-add-user').modal('toggle');
            toastSuccess('Success'); // alert
            getCounterDash(); // reload counter
            table.ajax.reload(); // reload table
         }, 800);         
      }).catch(function (error) {
         toastError(error.response.statusText)
      });
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
   $('#close_dropdown').click(function () { toggleFilter() });

   // Close Dropdown When Click Outside 
   $(document).on('click', function (e) { toggleFilter() });

   // Dropdown Prevent From closing
   $('.dropdown-filter').on('hide.bs.dropdown', function (e) {
      if (e.clickEvent) e.preventDefault();
   });

   let showFieldErrors = function (obj, field) {
      if (field === 'password') {
         $(`#txt-${field}1`).addClass('form-error')
         $(`#txt-${field}2`).addClass('form-error')
      } else if (field === 'changepassword') {
         $(`#txt-${field}1`).addClass('form-error')
         $(`#txt-${field}2`).addClass('form-error')
      } else if (field === 'department') {
         $(`#select2-${field}`).next().find('.select2-selection').addClass('form-error')
      } else $(`#txt-${field}`).addClass('form-error');
      let errors = ''
      for (i = 0; i < obj.length; i++) errors += `${obj[i]} `;
      $(`#${field}-error`).html(`*${errors}`)
   };

   let removeFieldErrors = function (field) {
      if (field === 'password') {
         $(`#txt-${field}1`).removeClass('form-error')
         $(`#txt-${field}2`).removeClass('form-error')
      } else if (field === 'changepassword') {
         $(`#txt-${field}1`).removeClass('form-error')
         $(`#txt-${field}2`).removeClass('form-error')
      } else if (field === 'department') {
         $(`#select2-${field}`).next().find('.select2-selection').removeClass('form-error')
      } else $(`#txt-${field}`).removeClass('form-error');
      $(`#${field}-error`).html(``)
   };

   let resetForm = function (e) {
      $('#form').trigger('reset');
      removeFieldErrors('username');
      removeFieldErrors('firstname');
      removeFieldErrors('lastname');
      removeFieldErrors('password');
      removeFieldErrors('department');
      removeFieldErrors('contact');
      $('#file_wrapper').empty();
      $("#verify_helptext").removeClass('d-none');
      $(".alert-decline, .alert-pending, .alert-verified").addClass('d-none');
   }

   let verifyDocuments = function(documents ) {
      if  (documents.length > 0) {
         $("#verify_helptext").addClass('d-none');
         $('#file_wrapper').empty();
      } else $("#verify_helptext").removeClass('d-none');

      documents.forEach(document => {
         $('#file_wrapper').append(`<div class="col-4 col-md-3">
            <a href="#" class="card-preview" data-file="${document.file}">
               <div class="card m-0 w-100">
                  <img src="${document.file}" class="card-img" alt="${document.file_name}">
                  <div class="card-body p-1">
                     <small class="text-muted">${document.file_name}</small>
                  </div>
               </div>
            </a>
         </div>`)
      });
   }
});