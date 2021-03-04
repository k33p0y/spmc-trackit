$(document).ready(function () {
   let alert_msg = '';
   // Submit Form
   $("#btn-change-password").click(function (e) {
      e.preventDefault();

      // Variables
      let data = {}

      // Data
      data.password = $('#txt-password').val();
      data.password2 = $('#txt-password2').val();
      data.username = $('#txt-username').val();
      data.department = $('#txt-department').val();
      var id = $('#txt-id').val();
      alert_msg = 'Saved Successfully';
      
      console.log(data);

      axios({
         method: 'put',
         url: `/api/core/user/${id}/`,
         data: data,
         headers: axiosConfig,
      }).then(function (response) { // success


         $.when(
            Toast.fire({
               icon: 'success',
               title: alert_msg,
            })
         ).then(function () {
            $(location).attr('href', '/')
         });
      }).catch(function (error) { // error
         console.log(error)
         if (error.response.data.password) showFieldErrors(error.response.data.password, 'password'); else removeFieldErrors('password');
         if (error.response.data.password2) showFieldErrors(error.response.data.password2, 'password2'); else removeFieldErrors('password2');

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