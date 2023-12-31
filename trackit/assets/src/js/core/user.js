$(document).ready(function () {
   let method, url, action;
   let department;
   let alert_msg = '';

   // enforces focus on the Bootstrap modal prevent loses focus to another element  
   $.fn.modal.Constructor.prototype._enforceFocus = function() {};

   // set notification instance to unread = False
   if (localStorage.getItem('user-id')) {
      axios.get(`/api/core/all/user/${localStorage.getItem('user-id')}/`, ).then(res => {
         $("#modal-add-user").modal({
            show: true,
            backdrop: 'static',
            keyboard: false,
         });
         modalUpdate(res.data);
      });
      localStorage.removeItem('user-id');
   }

   // set notification instance to unread = False
   if (localStorage.getItem('notification-id')){
      axios.delete(`/api/user/notifications/${localStorage.getItem('notification-id')}/`, {headers: axiosConfig})
      localStorage.removeItem('notification-id');
   }

   var searchInput = function () { return $('#search-input').val(); }
   var staffFilter = function () { return $('#staff-filter').val(); }
   var superuserFilter = function () { return $('#superuser-filter').val(); }
   var activeFilter = function () { return $('#active-filter').val(); }
   var departmentFilter = function () { return $('#department-filter').val(); }
   var groupFilter = function () { return $('#group-filter').val(); }
   var dateFromFilter = function () { return $('#date-from-filter').val(); }
   var dateToFilter = function () { return $('#date-to-filter').val(); }
   var statusFilter = function () { return $('#status-filter').val(); }

   // RETRIEVE / GET
   let table = $('#dt_user').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverSide": true,
      "processing": true,
      "language": {
         processing: $('#table_spinner').html()
      },
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
            data: "username",
            render: function (data, type, row) {
               if (type == 'display') {
                  let name_template = `<div class="d-flex align-items-center" id="name_profile">
                     <div class="profile-img">${row.first_name.charAt(0)}${row.last_name.charAt(0)}</div>
                        <div class="ml-2"> 
                           <p class="title text-nowrap m-0">${row.first_name} ${row.last_name}</p> 
                           <span class="sub-title text-muted">${row.username}</span>
                        </div>
                     </div>`;

                  data = ($('#changeUserHidden').val() == 'true') ? `<a role="button" class='text-orange btn-edit'>${name_template}</a>` : name_template;
               }
               return data
            },
         }, // Names
         {
            data: "department",
            render: function (data, type, row) {
               if (type == 'display') data = (row.department) ? `${row.department.name}` : '';
               return data
            },
         }, // Department
         {
            data: "is_superuser",
            render: function (data, type, row) {
               data = '';
               if (row.is_staff) data = "<span class='text-nowrap'><i class='fas fa-user-tie text-info mr-1'></i>Staff</span>";
               if (row.is_superuser) data = "<span class='text-nowrap'><i class='fas fa-unlock-alt text-orange mr-1'></i>Superuser</span>";
               if (!row.is_superuser && !row.is_staff) data = "<span class='text-nowrap'><i class='fas fa-user mr-1'></i>Member</span>";
               return data
            },
         }, // Permission
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
         }, // Groups
         {
            data: "modified_at",
            render: function (data, type, row) {
               if (type == 'display') {
                  var date = moment(row.modified_at).format('DD MMMM YYYY');
                  var time = moment(row.modified_at).format('h:mm:ss a');

                  data = `<p class="title mb-0">${date}</p><span class="sub-title">${time}</span>`
               }
               return data
            },
         }, // Modified At
         {
            data: "is_verified",
            render: function (data, type, row) {
               data = '';
               if (row.is_verified) data = "<div class='badge badge-primary text-uppercase d-inline-flex align-items-center p-1'> <span> Verified </span> </div>";
               else if (row.is_verified == null) data = "<div class='badge badge-info text-uppercase d-inline-flex align-items-center p-1'> <span> Pending </span> </div>";
               else if (row.is_verified == false) data = "<div class='badge badge-danger text-uppercase d-inline-flex align-items-center p-1'> <span> Declined </span> </div>";
               return data
            },
         }, // Verification
         {
            data: "is_active",
            render: function (data, type, row) {
               if (row.is_active === true) data = "<i class='fas fa-check-circle text-success'></i>";
               else data = "<i class='fas fa-times-circle text-secondary'></i>";
               return data
            },
         } // Is Active
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

   let formatResult = function(state) {
      let data = $(state.element).data()
      let option = $(`<div><div class="font-weight-bold">${state.text}</div> ${data ? `<div class='text-xs'>Head: ${data.head}</div>`: ''}</div>`);
      return option;
   } 
   let formatSelection = function(state) {
      let data = $(state.element).data()
      let option = $(`<div>${state.text} ${data ? `(Head: ${data.head})</div>`: ''}`);
      if (!state.id) return 'Select department';
      return option;
   } 

   let stringMatch = function(term, candidate) {
      return candidate && candidate.toLowerCase().indexOf(term.toLowerCase()) >= 0;
   }

   let customMatch = function(params, data) {
      // If there are no search terms, return all of the data
      if ($.trim(params.term) === '') {
          return data;
      }
      // Do not display the item if there is no 'text' property
      if (typeof data.text === 'undefined') {
          return null;
      }
      // Match text of option
      if (stringMatch(params.term, data.text)) {
          return data;
      }
      // Match attribute "data-foo" of option
      if (stringMatch(params.term, $(data.element).attr('data-head'))) {
          return data;
      }
      // Return `null` if the term should not be displayed
      return null;
  }
    
   $('#select2-department').select2({
      allowClear: true,
      placeholder: 'Select department',
      cache: true,
      matcher: customMatch,
      templateResult: formatResult,
      templateSelection: formatSelection,
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

      $('#nav-verify-tab').addClass('d-none'); // hide verify tab
      $('#nav-general-tab').addClass('d-none'); // hide general tab
      $('#nav-activity-tab').addClass('d-none'); // hide activity tab

      resetForm(); // reset form
      $("#select2-department").val('').trigger('change'); // reset department select2 before loading modal
      $("#select2-permissions").val([]).trigger('change'); // reset permissions select2 before loading modal
      $("#select2-groups").val([]).trigger('change'); // reset groups select2 before loading modal
      $("#modal-add-user").modal();
      $(".modal-title").text('Add User');
   }); // create new group button end

   // UPDATE / PUT
   $('#dt_user tbody').on('click', '.btn-edit', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      
      // // // Open Modal
      // // // Rename Modal Title
      $("#modal-add-user").modal({
         show: true,
         backdrop: 'static',
         keyboard: false,
      });

      modalUpdate(dt_data);
   });

   let modalUpdate = function (data) {
      method = 'PUT';
      url = `/core/user/${data['id']}/update`;
      
      // modal title 
      $("#modal-add-user .modal-title").text(`Update User - ${data['first_name']} ${data['last_name']}`);

      $('.name-group').show()
      $('.password-group').hide()
      $('#btn-change-password').show()
      $('.status-group').show()
      $('.m2m-group').show()

      $('#nav-verify-tab').removeClass('d-none'); // show verifiy tab
      $('#nav-general-tab').removeClass('d-none'); // show general tab
      $('#nav-activity-tab').removeClass('d-none'); // show activity tab

      // // // Populate Fields
      resetForm(); // reset form
      $('#txt-username').val(data['username']); // USERNAME
      $('#txt-firstname').val(data['first_name']); // FIRST NAME
      $('#txt-middlename').val(data['middle_name']); // MIDDLE NAME
      $('#txt-lastname').val(data['last_name']); // LAST NAME
      $('#txt-suffix').val(data['suffix']); // SUFFIX
      $('#txt-email').val(data['email']); // EMAIL ADDRESS
      $('#txt-contact').val(data['contact_no']); // CONTACT NO
      $('#txt-license').val(data['license_no']); // LICENSE NO
      if (data['department']) $('#select2-department').val(data['department'].id).trigger('change'); else $('#select2-department').val('').trigger('change'); // DEPARTMENT
      if (data['is_superuser']) $('#chk-superuser-status').prop('checked', true); else $('#chk-superuser-status').prop('checked', false); // IS SUPERUSER
      if (data['is_staff']) $('#chk-staff-status').prop('checked', true); else $('#chk-staff-status').prop('checked', false); // IS STAFF
      if (data['is_active']) $('#chk-active-status').prop('checked', true); else $('#chk-active-status').prop('checked', false); // IS ACTIVE
      $('#select2-groups').val($.map(data['groups'], (group) => group.id)).trigger('change'); // GROUPS
      $('#select2-permissions').val(data['user_permissions']).trigger('change'); // PERMISSIONS
      $('#btn-change-password').data('user', data);
      verifyDocuments(data['documents']); // VERIFICATION DOCUMENTS TAB
      viewDetailsTab(data); // DETAILS TAB
      viewActivityLogTab(data['id']); // ACTIVITY LOGS TAB

      // // // show alert verification status
      if (data['is_verified'] === true) $(".alert-verified").removeClass('d-none');
      else if (data['is_verified'] === false) {
         $("#verifyanyway_user").data('user', data['id']);
         $(".alert-decline").removeClass('d-none');
         if (data['remarks']) $(".user-remarks").html(data['remarks']);
      }
      else if (data['is_verified'] === null) {
         $("#verify_user, #decline_user").data('user', data['id']);
         $(".alert-pending").removeClass('d-none');
      }
   }

   $('#file_wrapper').on('click', '.list-preview', function(e) {
      $('#previewImage').modal('show');
      $("#file_src").prop('src', $(this).data('file'));
   });

   // Submit Form 
   $("#btn_save").click(function (e) {
      $(this).attr('disabled', true)

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
         // send notification
         socket_notification.send(JSON.stringify({type: 'user_notification', data: {object_id: response.data.id, notification_type: 'user'}}));
         toastSuccess('Success');

         $("#form").trigger("reset"); // reset form
         $("#select2-department").val('').trigger('change'); // reset permissions select2
         $("#select2-permissions").val([]).trigger('change'); // reset permissions select2
         $("#select2-groups").val([]).trigger('change'); // reset groups select2
         $('#modal-add-user').modal('toggle');
         $("#btn_save").attr('disabled', false)
         table.ajax.reload();
      }).catch(function (error) { // error
         if (error.response.data.username) showFieldErrors(error.response.data.username, 'username'); else removeFieldErrors('username');
         if (error.response.data.last_name) showFieldErrors(error.response.data.last_name, 'lastname'); else removeFieldErrors('lastname');
         if (error.response.data.first_name) {
            if (error.response.data.first_name) showFieldErrors(error.response.data.first_name, 'firstname'); else removeFieldErrors('firstname');
            if (error.response.data.first_name.fullname) showFieldErrors(error.response.data.first_name.fullname, 'fullname'); else removeFieldErrors('fullname');
        } else removeFieldErrors('firstname');
         if (error.response.data.password) showFieldErrors(error.response.data.password, 'password'); else removeFieldErrors('password');
         if (error.response.data.email) showFieldErrors(error.response.data.email, 'email'); else removeFieldErrors('email');
         if (error.response.data.contact_no) showFieldErrors(error.response.data.contact_no, 'contact'); else removeFieldErrors('contact');
         if (error.response.data.department) showFieldErrors(error.response.data.department, 'department'); else removeFieldErrors('department');
         $("#btn_save").attr('disabled', false)
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
      
      Swal.fire({
         title: 'Are you sure?',
         icon: 'question',
         showCancelButton: true,
         cancelButtonText: 'Cancel',
         confirmButtonText: 'Continue',
         reverseButtons: true
      }).then((result) => {
         if (result.value) {
            $(this).prop('disabled', true) // disable button

            axios({
               url: `/api/core/verify/user/${id}/`,
               method: "PUT",
               headers: axiosConfig
            }).then(function (response) {
               $("#spinner_verify").removeClass('d-none');
               $('#verify_user').prop('disabled', false)

               // send notification
               socket_notification.send(JSON.stringify({type: 'user_notification', data: {object_id: response.data.id, notification_type: 'user'}})), 

               setTimeout(function() { 
                  $("#spinner_verify").addClass('d-none');
                  $('#modal-add-user').modal('toggle');
                  toastSuccess('Success'); // alert
               }, 500);  

               getCounterDash(); // reload counter
               table.ajax.reload(); // reload table
            }).catch(function (error) {
               toastError(error.response.statusText)
            });
         }
      });
   });

   // Decline User
   $('#decline_user').click(function (e) {
      const id = $(this).data('user');

      Swal.fire({
         title: 'Remarks/Reason',
         input: 'textarea',
         inputPlaceholder: 'Type your message here...',
         inputAttributes: {
            'aria-label': 'Type your message here',
            'maxlength': 100,
         },
         showCancelButton: true,
         cancelButtonText: 'Cancel',
         confirmButtonText: 'Submit',
         reverseButtons: true,
      }).then((result) => {
         $(this).prop('disabled', true) // disable button

         axios({
            url: `/api/core/decline/user/${id}/`,
            method: "PUT",
            data: {'remarks' : result.value},
            headers: axiosConfig
         }).then(function (response) {
            $("#spinner_decline").removeClass('d-none');
            $('#decline_user').prop('disabled', false)
            
            // send notification
            socket_notification.send(JSON.stringify({type: 'user_notification', data: {object_id: response.data.id, notification_type: 'user'}}))

            setTimeout(function() { 
               $("#spinner_decline").addClass('d-none');
               $('#modal-add-user').modal('toggle');
               toastSuccess('Success'); // alert
            }, 500);         

            getCounterDash(); // reload counter
            table.ajax.reload(); // reload table
         }).catch(function (error) {
            toastError(error.response.statusText)
         });
      });
   });

   // Verify User Anayway 
   $('#verifyanyway_user').click(function (e) {
      const id = $(this).data('user');
      
      Swal.fire({
         title: 'Are you sure?',
         html: '<p class="m-0">User has not yet submitted any form of identification.</p>',
         icon: 'question',
         showCancelButton: true,
         cancelButtonText: 'Cancel',
         confirmButtonText: 'Verify Anyway',
         confirmButtonColor: '#17a2b8',
         reverseButtons: true
      }).then((result) => {
         if (result.value) {
            $(this).prop('disabled', true) // disable button

            axios({
               url: `/api/core/verify/user/${id}/`,
               method: "PUT",
               headers: axiosConfig
            }).then(function (response) {
               $("#spinner_verifyanyway").removeClass('d-none');
               $('#verifyanyway_user').prop('disabled', false)

               // send notification
               socket_notification.send(JSON.stringify({type: 'user_notification', data: {object_id: response.data.id, notification_type: 'user'}}))
       
               setTimeout(function() { 
                  $("#spinner_verifyanyway").addClass('d-none');
                  $('#modal-add-user').modal('toggle');
                  toastSuccess('Success'); // alert
               }, 500);    
               
               getCounterDash(); // reload counter
               table.ajax.reload(); // reload table
            }).catch(function (error) {
               toastError(error.response.statusText)
            });
         }
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
      let errors = ''
      for (i = 0; i < obj.length; i++) errors += `${obj[i]} `;
      $(`#${field}-error`).html(`*${errors}`)
      
      if (field === 'password') {
         $(`#txt-${field}1`).addClass('form-error')
         $(`#txt-${field}2`).addClass('form-error')
      } else if (field === 'changepassword') {
         $(`#txt-${field}1`).addClass('form-error')
         $(`#txt-${field}2`).addClass('form-error')
      } else if (field === 'fullname') {
         $(`#txt-firstname`).addClass('form-error')
         $(`#txt-lastname`).addClass('form-error')
         $(`#firstname-error`).html(`*${errors}`)
      } else if (field === 'department') {
         $(`#select2-${field}`).next().find('.select2-selection').addClass('form-error')
      } else $(`#txt-${field}`).addClass('form-error');

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
      removeFieldErrors('email');
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
         let file_url = (window.location.protocol == "https:") ? document.file.replace("http://", "https://") : document.file;
         let file = (file_url.includes('socket')) ? file_url.replace('socket', window.location.host) : file_url;

         $('#file_wrapper').append(`
            <li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-2 list-preview" data-file="${file}">
               <img src="${file}" alt="${document.file_name}" height="40" width="auto">
               <p class="text-muted m-0 px-2">${document.file_name}</p>
               <p class="text-muted m-0 px-2">${moment(document.uploaded_at).format('DD MMMM YYYY h:mm:ss a')}</p>
            </li>`
         )
      });
   }

   let viewDetailsTab = function(obj) {    
      $('#login_data').html(`${obj.last_login ? `${moment(obj.last_login).format('ddd, DD MMMM YYYY h:mm:ss a')}` : '-'}`);
      $('#created_data').html(`${obj.created_by ? `${obj.created_by.name},` : ''} ${obj.date_joined ? `${moment(obj.date_joined).format('ddd, DD MMMM YYYY h:mm:ss a')}` : '-'}`);
      $('#modified_data').html(`${obj.modified_by ? `${obj.modified_by.name},` : ''} ${obj.modified_at ? `${moment(obj.modified_at).format('ddd, DD MMMM YYYY h:mm:ss a')}` : '-'}`);
      $('#verified_data').html(`${obj.verified_by  ? `${obj.verified_by.name},` : ''} ${obj.verified_at ? `${moment(obj.verified_at).format('ddd, DD MMMM YYYY h:mm:ss a')}` : '-'}`);
   }

   let viewActivityLogTab = function(user) {
      $('.table-activity').DataTable().clear().destroy();
      $('.table-activity').DataTable({
         "searching": false,
         "responsive": true,
         "lengthChange": false,
         "autoWidth": false,
         "serverSide": false,
         "pageLength" : 10,
         "info" : false,
         "ajax": {
            url: '/api/ticket/logs/?format=datatables',
            type: "GET",
            data: {
               "user": user,
            }
         },
         "columns" : [
            {
               data: "datetime",
               render: function (data, type, row) {
                  if (type == 'display') data = moment(row.datetime).format('DD MMMM YYYY h:mm:ss a');
                  return data
               },
            },
            {
               data: "user",
               render: function (data, type, row) {
                  if (type == 'display') {
                     if (row.user) {
                        if (row.user.id == user) data = 'User';
                        else data = `${row.user.first_name} ${row.user.last_name}`;
                     }
                     else data = 'System';
                  }
                  return data
               },
            },
            {
               data: "changed_fields",
               render: function (data, type, row) {
                  if (type == 'display') {
                     if (row.event_type == 'Update') { // // UPDATE Event type 
                        let action = row.changed_fields;
                        if (Object.keys(action).length == 1) {
                           if (action.last_login) data = 'Logged in';
                           else if (action.is_verified) {
                              if (action.is_verified[1] == 'None') data = 'Upload files'
                              else if (action.is_verified[1] == 'False') data = 'Decline verification'
                           }
                           else if (action.is_staff) data = (action.is_staff[1] == 'True') ? 'Allow staff permission' : 'Remove staff permission'
                           else if (action.is_superuser) data = (action.is_superuser[1] == 'True') ? 'Allow superuser permission' : 'Remove superuser permission'
                           else if (action.username) data = 'Change username'
                           else if (action.password) data = 'Change password'
                           else data = 'Update profile';
                        } else if (Object.keys(action).length == 2) {
                           if (action.is_staff && action.is_superuser) data = 'Update permissions'
                           else if (action.username && action.modified_by) data = 'Change username'
                           else if (action.is_staff && action.modified_by) data = (action.is_staff[1] == 'True') ? 'Allow staff permission' : 'Remove staff permission'
                           else if (action.is_superuser && action.modified_by) data = (action.is_superuser[1] == 'True') ? 'Allow superuser permission' : 'Remove superuser permission'
                           else if (action.is_verified && action.remarks) data = 'Decline verification'
                           else data = 'Update profile' 
                        } else if (Object.keys(action).length >= 3) {
                           if (action.is_verified && action.verified_at && action.verified_by) data = 'Verify'
                           else data = 'Update profile' 
                        } 
                     }
                     else if (row.event_type == 'Create') {
                        if (!row.changed_fields) data = 'Register';
                     }
                  }
                  return data
               },
            },
         ],
         "order": [[0, "desc"]],
      });
   }

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
         $('#spinner_declined').addClass('d-none'); // remove spinners
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
});