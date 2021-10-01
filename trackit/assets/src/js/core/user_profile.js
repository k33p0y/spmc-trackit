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
      data.contact_no = $('#txt-contact').val();

      // axios put
      axios({
         method: 'PUT',
         url: url,
         data: data,
         headers: axiosConfig,
      }).then(res => { // success

         $.when( toastSuccess('Success')).then(function () {
            $('#modal-profile').modal('hide');
            location.reload();
         });
         
      }).catch(err => { // error
         if (err.response.data.email) showFieldErrors(err.response.data.email, 'email'); else removeFieldErrors('email');
         if (err.response.data.contact_no) showFieldErrors(err.response.data.contact_no, 'contact'); else removeFieldErrors('contact');
      }) 
   });

   // Change Password
   $("#btn-change-password").click(function (e) {
      console.log()
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
               console.log(err.response.data);
               if (err.response.data.current_password) showFieldErrors(err.response.data.current_password, 'current_password'); else removeFieldErrors('current_password');
               if (err.response.data.new_password) showFieldErrors(err.response.data.new_password, 'new_password'); else removeFieldErrors('new_password');
            });
         }
      });
   });
   

   let showFieldErrors = function(obj, field){
      if (field === 'current_password') {
         $(`#txt-${field}`).addClass('form-error').val('')
         $(`#txt-new_password1`).val('')
         $(`#txt-new_password2`).val('')
      }  else if (field === 'new_password') {
         $(`#txt-${field}1`).addClass('form-error').val('')
         $(`#txt-${field}2`).addClass('form-error').val('')
      }  else $(`#txt-${field}`).addClass('form-error');
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
      }  else $(`#txt-${field}`).removeClass('form-error');
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
});