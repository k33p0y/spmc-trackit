$(document).ready(function () {

   var url;

   let table = $('#dt_requests').DataTable({
      "searching": false,
      "responsive": true,
      "autoWidth": false,
      "paging": false,
      "info": false,
      "columnDefs": [{
         "targets": [2],
         "render": $.fn.dataTable.render.ellipsis(60, true),
         "width": "30%"
      }]
   });

   // Deparments Select2 Config
   $('#select2-department').select2({
      allowClear: true,
      placeholder: 'Select department',
      cache: true,
   });

   // SElECT ON CHANGE EVENT
   $('#select2-department').on('change', function () { // department dropdown
      department = $("#select2-department option:selected").val();
   });

   // Edit Profile Modal
   $('#btn-edit-profile').click(function () {
      id = $(this).data().userId;
      url = `/api/core/user-profile/${id}/`;

      // User API
      axios.get(url, {headers: axiosConfig}).then(res => {
         // Configure Modal
         $('#modal-profile').modal();
         $('.password-group').hide();
         
         // Populate fields to modal
         resetForm(); 
         $('#txt-username').val(res.data.username); // USERNAME
         $('#txt-firstname').val(res.data.first_name); // FIRST NAME
         $('#txt-middlename').val(res.data.middle_name); // MIDDLE NAME
         $('#txt-lastname').val(res.data.last_name); // LAST NAME
         $('#txt-suffix').val(res.data.suffix); // EXT NAME 
         $('#txt-email').val(res.data.email); // EMAIL
         if (res.data.department) $('#select2-department').val(res.data.department.id).trigger('change'); else $('#select2-department').val('').trigger('change'); // DEPARTMENT

         // Pass data object to password button
         $("#btn-change-password").data('user', res.data);

         // Pass data to save button
         $('#btn_save').data('user-id', res.data.id);
      }).catch(err => {
         Toast.fire({
            icon: 'error',
            title: error,
         });
      });
   });

   // Submit Edit Profile Form
   $('#btn-save-profile').click(function (e) {
      e.preventDefault();
      
      // new object
      let data = new Object();
      data.username = $('#txt-username').val();
      data.first_name = $('#txt-firstname').val();
      data.middle_name = $('#txt-middlename').val();
      data.last_name = $('#txt-lastname').val();
      data.suffix = $('#txt-suffix').val();
      data.email = $('#txt-email').val();
      data.department = department

      // axios put
      axios({
         method: 'PUT',
         url: url,
         data: data,
         headers: axiosConfig,
      }).then(res => { // success

         $.when(
            Toast.fire({
               icon: 'success',
               title: 'Update Successfully',
            }),
         ).then(function () {
            $('#modal-profile').modal('hide');
            location.reload();
         });
         
      }).catch(err => { // error
         if (err.response.data.username) showFieldErrors(err.response.data.username, 'username'); else removeFieldErrors('username');
         if (err.response.data.first_name) showFieldErrors(err.response.data.first_name, 'firstname'); else removeFieldErrors('firstname');
         if (err.response.data.last_name) showFieldErrors(err.response.data.last_name, 'lastname'); else removeFieldErrors('lastname');
         if (err.response.data.email) showFieldErrors(err.response.data.email, 'email'); else removeFieldErrors('email');
         if (err.response.data.department) showFieldErrors(err.response.data.department, 'department'); else removeFieldErrors('department');
      }) 
   });


   // Change Password
   $("#btn-change-password").click(function (e) {
      // Open Modal
      $('#modal-profile').modal('hide')
      $('#modal-change-password').modal();

      // Pass data to save button
      resetForm(); 
      $('#btn_submit_password').data('data', {
         'id' : $(this).data('user').id,
         'username' : $(this).data('user').username
      })
   }); 

   // Submit Change Password
   $('#btn_submit_password').click(function (e) {
      e.preventDefault();
      let user = $(this).data('data')
      
      Swal.fire({
         title: 'This will log you out of TrackIt from every devices you currently logged on.',
         icon: 'info',
         showCancelButton: true,
         confirmButtonText: 'OK',
         confirmButtonColor: '#17a2b8',
      }).then((result) => {
         if (result.value) {
            
            let data = new Object();
            data.username = user.username
            data.password = $('#txt-changepassword1').val();
            data.password2 = $('#txt-changepassword2').val();

            axios({
               method: 'PUT',
               url: `/api/core/user/${user.id}/change-password/`,
               data: data,
               headers: axiosConfig,
            }).then(res => { // success
               $("#change-password-form").trigger("reset"); // reset form
               $('#modal-change-password').modal('toggle');

               $.when(
                  Toast.fire({
                     icon: 'success',
                     title: 'Password Changed',
                  })
               ).then(function () {
                  $('#modal-change-password').modal('hide');
                  location.reload();
               });
               
            }).catch(err => { // error
               if (err.response.data.password) showFieldErrors(err.response.data.password, 'changepassword'); else removeFieldErrors('changepassword');
            });
         }
      });
   });
   

   let showFieldErrors = function(obj, field){
      if (field === 'password') {
         $(`#txt-${field}1`).addClass('form-error')
         $(`#txt-${field}2`).addClass('form-error')
      }  else if (field === 'changepassword') {
         $(`#txt-${field}1`).addClass('form-error')
         $(`#txt-${field}2`).addClass('form-error')
      }  else if (field === 'department') {
         $(`#select2-${field}`).next().find('.select2-selection').addClass('form-error')
      }  else $(`#txt-${field}`).addClass('form-error');
      let errors = ''
      for (i=0; i<obj.length; i++) errors += `${obj[i]} `;
      $(`#${field}-error`).html(`*${errors}`)
   };

   let removeFieldErrors = function(field){
      if (field === 'password') {
         $(`#txt-${field}1`).removeClass('form-error')
         $(`#txt-${field}2`).removeClass('form-error')
      } else if (field === 'changepassword') {
         $(`#txt-${field}1`).removeClass('form-error')
         $(`#txt-${field}2`).removeClass('form-error')
      }  else if (field === 'department') {
         $(`#select2-${field}`).next().find('.select2-selection').removeClass('form-error')
      }  else $(`#txt-${field}`).removeClass('form-error');
      $(`#${field}-error`).html(``)
   };

   let resetForm = function(e){
      $('#form').trigger('reset');
      $("#change-password-form").trigger("reset");
      removeFieldErrors('username');
      removeFieldErrors('email');
      removeFieldErrors('firstname');
      removeFieldErrors('lastname');
      removeFieldErrors('password');
      removeFieldErrors('changepassword');
      removeFieldErrors('department');
   }
});