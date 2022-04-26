$(document).ready(function () {
   
   $('#select2_nextstep').select2(); // select2 steps
   $('#select2_event').select2({placeholder: 'Select Event'}); // select2 events
   $('#select2_schedule').select2({placeholder: 'Select Date'}); // select2 schedule

   // On Change Event Select 2
   var step;
   $('#select2_nextstep').on('change', function () { 
      step = $("#select2_nextstep option:selected").val();
   });    
   
   // Accept action 
   $('.btn-accept').click(function (e) {
      e.preventDefault();
      let ticket_id = $(this).data().ticketId;
      var next_step = $("#select2_nextstep option:selected").next().val()
      let status = (typeof step === "undefined") ? next_step : step;

      let remark = $('#txtarea-remark').val();
      let is_approve = ($(this).data().approve) ? true : '';
      let is_pass = ($(this).data().pass) ? true : '';
      
      if (validateRemark()) postAction(ticket_id, status, remark, is_approve, is_pass);
   });

   // Refuse action
   $('.btn-refuse').click(function (e) {
      e.preventDefault();
      let ticket_id = $(this).data().ticketId;
      let prev_step = $("#select2_nextstep option:selected").prev().val();
      let status = (typeof step === "undefined") ? prev_step : step;

      let remark = $('#txtarea-remark').val();
      let is_approve = ($(this).data().approve == false) ? false : '';
      let is_pass = ($(this).data().pass == false) ? false : '';
   

      // If head disapprove set status to close
      if ($(this).data().headDisapprove) {
         status = $('#select2_nextstep option:last-child').val();
      }

      if (validateRemark()){
         Swal.fire({
            title: 'Are you sure?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'OK',
            confirmButtonColor: '#17a2b8',
         }).then((result) => {
            if (result.value) {
               postAction(ticket_id, status, remark, is_approve, is_pass);
            }
         })
      }
   });

    // Post Action
   const postAction = function(ticket, status, remark, is_approve, is_pass) {
      axios({
         url:`/api/requests/ticket/status/${ticket}/`,
         method: "PATCH",
         data: {status: status},
         headers: axiosConfig,
      }).then(function (response) { // success
         let data = new Object();
         data.ticket = ticket
         data.remark = remark;
         data.is_approve = is_approve;
         data.is_pass = is_pass;
         data.status = $("#select2_nextstep option:selected").val();
   
         axios({
            method: 'POST',
            url:`/api/requests/ticket/actions/`,
            data: data,
            headers: axiosConfig,
         }).then(function (res) {
            socket_notification.send(JSON.stringify({type: 'notification', data: {object_id: res.data.ticket, notification_type: 'ticket'}}))
            $.when(toastSuccess('Success')).then(function () {
               location.reload();
            });
         });
   
      }).catch(function (error) { // error
         toastError(error.response.statusText);
      });
   }; 

   const validateRemark = function() {
      is_valid = true;

      if ($('#txtarea-remark').val()) {
         if ($('#txtarea-remark').val().length > 100) {
            $('#txtarea-remark').addClass('form-error')
            $('#error-info-remark').addClass('error-info').html('*This text is too long, Maximum of 100 characters only')
            is_valid = false
         } else {
            $('#txtarea-remark').removeClass('form-error')
            $('#error-info-remark').removeClass('error-info').html('Optional, Maximum of 100 characters only')
         }
      } 

      return is_valid
   }
});

