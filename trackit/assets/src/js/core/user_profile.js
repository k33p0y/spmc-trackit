$(document).ready(function () {  
   // Check if user has already done or skip walkthrough
   axios.get('/api/config/tour/').then(res => { // response
      const response = res.data.results;
      let request = new Object();
      // if has response and is_explore value is false; call walkthrough fn with PUT method and url
      // if empty response; call walkthrough fn with POST method to create instance  
      if (response.length > 0 && !response[0].is_explore_profile) {
         request.method = 'PUT';
         request.url = `/api/config/tour/${response[0].id}/`;
         exploreProfile(request);
      }
      else if (response.length == 0) {
         request.method = 'POST';
         request.url = `/api/config/tour/`;
         exploreProfile(request);
      }
   }).catch(err => { // error
      toastError(err.response.statusText) // alert
   });

   var url;
   var file_arr = new Array();

   // get user in localStorage if available
   if (localStorage.getItem('user-id')) {
      localStorage.removeItem('user-id');
   }

   // set notification instance to unread = False
   if (localStorage.getItem('notification-id')){
      axios.delete(`/api/user/notifications/${localStorage.getItem('notification-id')}/`, {headers: axiosConfig})
      localStorage.removeItem('notification-id');
   }

   // datatable
   let table = $('#dt_requests').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverSide": true,
      "processing": true,
      "language": {
         processing: $('#table_spinner').html()
      },
      "pageLength": 5,
      "ajax": {
         url: '/api/requests/ticket/myrequests/?format=datatables',
         type: "GET",
      },
      "columns": [
         { 
            data: "ticket_no",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `<a href='/requests/${row.ticket_id}/view' class='btn-link-orange action-link btn_view'> ${row.ticket_no} </a>`
               }
               return data
            }
         }, // Ticket No
         {
            data: "request_form",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `<span class="td-badge text-light text-truncate" style="background-color:${row.request_form.color}">
                     <span class="d-inline d-md-none">${row.request_form.prefix} </span>
                     <span class="d-none d-md-inline">${row.request_form.name} </span>   
                  </span>`
               }
               return data
            },
         }, // Request Type
         { 
            data: "description",
            render: $.fn.dataTable.render.ellipsis(60, true),
         }, // Description
         { 
            data: "status",
            render: function (data, type, row) {
               if (type == 'display') {
                  template = `<div> ${row.status.name}
                        <div class="progress progress-table mt-1">
                           <div class="progress-bar bg-orange" role="progressbar" style="width: ${row.progress}%;" aria-valuenow="${row.progress}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                     </div>`
                  data = template
               }
               return data
            },
         }, // Status
         {
            data: "category",
            render: function (data, type, row) {
               if (type == 'display') {
                  const categories = row.category.map((category) => {return category.name});
                  const type = row.category.map((category) => {return category.category_type_name});                     
                  data = `<p class="title">${categories.join(', ')}</p> <span class="sub-title">${type[0]}</span>`
               }
               return data
            },            
         }, // Category
         {
            data: 'date_created',
            render: function (data, type, row) {
               if (type == 'display') {
                  var date = moment(row.date_created).format('DD MMMM YYYY');
                  var time = moment(row.date_created).format('h:mm:ss a');

                  data = `<p class="title mb-0">${date}</p><span class="sub-title">${time}</span>`
               }
               return data
            },
         }, // Date Create
      ],
   });
   
   // Deparments Select2 Config
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
      templateSelection: formatSelection
   });

   // Edit Profile Modal
   $('#btn-edit-profile').click(function () {
      id = $(this).data().userId;
      url = `/api/core/user-profile/${id}/`;

      // User API
      axios.get(url, {headers: axiosConfig}).then(res => {
         // Configure Modal
         $('#modal-profile').modal();
         
         // Populate fields to modal
         resetForm(); 
         $('#txt-email').val(res.data.email); // EMAIL
         $('#txt-contact').val(res.data.contact_no); // CONTACT
         $('#txt-license').val(res.data.license_no); // LICENSE

         // Pass data to save button
         $('#btn_save').data('user-id', res.data.id);
      }).catch(err => {
         toastError(error);
      });
   });

   // Submit Edit Profile Form
   $('#btn-save-profile').click(function (e) {
      e.preventDefault();
      
      // new object
      let data = new Object()
      data.email = $('#txt-email').val();
      data.license_no = $('#txt-license').val();
      data.department = $("#select2-department").val();
      data.contact_no = $('#txt-contact').val();

      // axios put
      axios({
         method: 'PUT',
         url: url,
         data: data,
         headers: axiosConfig,
      }).then(res => { // success
         // send notification
         socket_notification.send(JSON.stringify({type: 'user_notification', data: {object_id: res.data.id, notification_type: 'user'}})), 
         $.when( toastSuccess('Success')).then(function () {
            $('#modal-profile').modal('hide');
            location.reload();
         });
         
      }).catch(err => { // error
         if (err.response.data.email) showFieldErrors(err.response.data.email, 'email'); else removeFieldErrors('email');
         if (err.response.data.contact_no) showFieldErrors(err.response.data.contact_no, 'contact'); else removeFieldErrors('contact');
         if (err.response.data.department) showFieldErrors(err.response.data.department, 'department'); else removeFieldErrors('department');
      }) 
   });

   // Change Password
   $("#btn-change-password").click(function (e) {
      // Open Modal
      $('#modal-change-password').modal();

      // Pass data to save button
      resetForm(); 
      $('#btn_submit_password').data('data', {
         'id' : $(this).data('userId'),
         'username' : $(this).data('username')
      });
   }); 

   // Submit Change Password
   $('#btn_submit_password').click(function (e) {
      e.preventDefault();
      let user = $(this).data('data')
      
      Swal.fire({
         title: 'Change Password',
         html: '<p class="m-0">This will log you out of TrackIt from every devices you currently logged on. Continue?</p>',
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: 'OK',
         confirmButtonColor: '#f8bb86',
      }).then((result) => {
         if (result.value) {
            
            let data = new Object();
            data.username = user.username
            data.current_password = $('#txt-current_password').val();
            data.new_password = $('#txt-new_password1').val();
            data.confirm_password = $('#txt-new_password2').val();

            axios({
               method: 'PUT',
               url: `/api/core/user/${user.id}/change-password/`,
               data: data,
               headers: axiosConfig,
            }).then(res => { // success
               $("#change-password-form").trigger("reset"); // reset form
               $('#modal-change-password').modal('toggle');

               $.when(toastSuccess('Password Change')).then(function () {
                  $('#modal-change-password').modal('hide');
                  location.reload();
               });
               
            }).catch(err => { // error
               if (err.response.data.current_password) showFieldErrors(err.response.data.current_password, 'current_password'); else removeFieldErrors('current_password');
               if (err.response.data.new_password) showFieldErrors(err.response.data.new_password, 'new_password'); else removeFieldErrors('new_password');
            });
         }
      });
   });

   // Upload Modal   
   // browse file upload
   $('#file_upload').on('change', function () {
      const files = this.files;
      const file_lists = $('.upload-zone');

      // limit maximum files
      if (files.length <= 2) {
         if (file_arr.length < 2) {
            // placeholder 
            if (files) $('.upload-content').addClass('d-none');
            else $('.upload-content').removeClass('d-none');

            // Appending Display
            Object.values(files).forEach(file => {
               let type = imageType(file.type);
               let size = imageSize(file.size);

               if (type == 'invalid') { // If file is not registered
                  this.value = "";
                  alertError('File type is not supported!');
               } else if (size == 'invalid') { // If image is more than 5MB
                  this.value = "";
                  alertError('Image is too big!');
               } else {
                  file_lists.append(
                     `<div class="card zone-item w-50 h-100 m-2">
                        <div class="card-body p-1 m-0">
                              <button class="btn btn-danger btn-remove" data-file-id="file_${file.name}">
                                 <i class="fas fa-minus"></i>
                              </button>
                              <img src="${URL.createObjectURL(file)}" class="card-img-top" id="${file.name}" alt="...">
                        </div>
                        <div class="card-footer p-1 m-0">
                              <span class="far ${type} text-warning text-center"></span>
                              <small class="text-muted text-center">${size}</small>
                        </div>
                     </div>`
                  )
                  file_arr.push({
                     id: `file_${file.name}`,
                     file: file
                  });
               }
            });
         } else alertError('You can only upload a maximum of 2 files');
      } else alertError('You can only upload a maximum of 2 files');
  });

  // remove Attachment
  $('.upload-zone').on('click', '.btn-remove', function () {
      let file_id = $(this).data().fileId;

      // loop through the files array and check if the file id of that file matches data-file-id
      // and get the index of the match
      for (var i = 0; i < file_arr.length; ++i) {
         if (file_id == file_arr[i].id) file_arr.splice(i, 1);
      };

      // remove to appended div
      $(this).parents("div.zone-item ").remove();

      // show placeholder
      if (!file_arr.length) $('.upload-content').removeClass('d-none');
   });

   // upload files submit
   $('#btn_upload').click(function (e) {
      e.preventDefault()
      $(this).prop('disabled', true)

      // if array is not empty
      if (file_arr.length > 0) {
          var percent = 0;
          let file_loaded = 1;

          $(".btn-remove").addClass('d-none')
          $(".upload-overlay").removeClass('d-none')

          file_arr.forEach(file => { // iterate each array
              let form_data = new FormData()
              form_data.append('file', file.file)

              axios.post('/api/core/all/verification/', form_data, {
                  headers: uploadConfig
              }).then(response => {
                  percent = Math.round(((file_loaded) / file_arr.length) * 100);
                  $('#upload_progress').animate(
                      { "width": `${percent}%` }, 0, function () {
                          if (percent == 100) $('#upload_progress').html(`${percent}%`);
                          else $('#upload_progress').html(`Uploading ${percent}%`);
                      }
                  );
                  file_loaded++;
                  if (percent == 100) {
                     // send notification
                     socket_notification.send(JSON.stringify({type: 'user_notification', data: {object_id: response.data.user, notification_type: 'user'}})), 
                     setTimeout(() => {
                        Swal.fire({
                           icon: 'success',
                           title: 'Verification Complete',
                           html: `<p class="text-secondary">You'll be able to create requests after we review your information and verify it within approximately 24 hours.</p>`,
                           confirmButtonColor: '#17a2b8',
                        }).then(() => {
                           location.reload();
                        })
                     }, 500);
                  }
              }).then().catch(error => {
                  toastError(error)
              });
          })

      } else {
         toastError('Please choose a file to upload')
         $('.btn-remove').removeClass('d-none')
         $(".upload-overlay").addClass('d-none')
         $(this).prop('disabled', false)
      }
  });

   let showFieldErrors = function(obj, field){
      if (field === 'current_password') {
         $(`#txt-${field}`).addClass('form-error').val('')
         $(`#txt-new_password1`).val('')
         $(`#txt-new_password2`).val('')
      }  else if (field === 'new_password') {
         $(`#txt-${field}1`).addClass('form-error').val('')
         $(`#txt-${field}2`).addClass('form-error').val('')
      }  else if (field === 'department') {
         $(`#select2-${field}`).next().find('.select2-selection').addClass('form-error')
      } else $(`#txt-${field}`).addClass('form-error');
      let errors = ''
      for (i=0; i<obj.length; i++) errors += `${obj[i]} `;
      $(`#${field}-error`).html(`*${errors}`)
   };

   let removeFieldErrors = function(field){
      if (field === 'current_password') {
         $(`#txt-${field}`).removeClass('form-error')
      } else if (field === 'new_password') {
         $(`#txt-${field}1`).removeClass('form-error')
         $(`#txt-${field}2`).removeClass('form-error')
      }  else if (field === 'department') {
         $(`#select2-${field}`).next().find('.select2-selection').removeClass('form-error')
      } else $(`#txt-${field}`).removeClass('form-error');
      $(`#${field}-error`).html(``)
   };

   let resetForm = function(e){
      $('#form').trigger('reset');
      $("#change-password-form").trigger("reset");
      removeFieldErrors('email');
      removeFieldErrors('contact_no');
      removeFieldErrors('license_no');
      removeFieldErrors('current_password');
      removeFieldErrors('new_password');  
   }

   // walkthrough click event
   $('.tour-me').click(function() {
      exploreProfile();
   });
});