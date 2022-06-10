$(document).ready(function () {
   $('#select2_nextstep').select2(); // select2 steps
   $('#select2_event').select2({placeholder: 'Select Event'}); // select2 events
   $('#select2_schedule').select2({placeholder: 'Select Date'}); // select2 schedule

   // character counter
   $('#txtarea-remark').on("input", function() {
      let maxlength = $(this).attr("maxlength");
      let currentLength = $(this).val().length;
      $('#char_count').html(currentLength);

      if (currentLength >= maxlength)$('#error-info-remark').html("You have reached the maximum number of characters.");
      else $('#error-info-remark').html('Optional, Maximum of 100 characters only')
  });

   // select2_event on change
   $('#select2_event').on('change', function () {
      let date = moment().format('YYYY-MM-DD');
      let event = $("#select2_event").val();
      let url = `/api/events/eventdate/all/?date=${date}&event=${event}`
      $("#select2_schedule").empty().append('<option></option>').removeAttr('disabled'); 
      getEventDatesAPI(url, event)
   });
   
   // accept action 
   $('.btn-accept').click(function (e) {
      e.preventDefault();
      let ticket_id = $(this).data().ticketId;
      var status = $("#select2_nextstep").val()
      // let status = (typeof step === "undefined") ? next_step : step;
      let remark = $('#txtarea-remark').val();
      let is_approve = ($(this).data().approve) ? true : null;
      let is_pass = ($(this).data().pass) ? true : null;
      
      if (validateRemark()) postAction(ticket_id, status, remark, is_approve, is_pass);
   });

   // refuse action
   $('.btn-refuse').click(function (e) {
      e.preventDefault();
      let ticket_id = $(this).data().ticketId;
      let status = ($(this).data().nextStep == $("#select2_nextstep").val()) ? $(this).data().prevStep : $("#select2_nextstep").val();
      let remark = $('#txtarea-remark').val();
      let is_approve = ($(this).data().approve == false) ? false : null;
      let is_pass = ($(this).data().pass == false) ? false : null;

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

   // post action
   const postAction = function(ticket, status, remark, is_approve, is_pass) {
      let data = new Object();
      data.ticket = ticket
      data.remark = remark;
      data.is_approve = is_approve;
      data.is_pass = is_pass;
      data.status = status;   
      data.event_date = ($('#current_step').data().hasEvent) ? $("#select2_schedule").val() : '';
      
      axios({
         method: 'POST',
         url:`/api/requests/ticket/actions/`,
         data: data, 
         headers: axiosConfig,
      }).then(res => {
         socket_notification.send(JSON.stringify({type: 'notification', data: {object_id: res.data.ticket, notification_type: 'ticket'}}))
         $.when(toastSuccess('Success')).then(function () {
            location.reload();
         });
      }).catch(err => {
         toastError(err.response.statusText)
      });
   }; 

   const validateRemark = function() {
      is_valid = true;

      if($('#current_step').data().hasEvent) { // validate events dropdown
         // event select2
         if($('#select2_event').val()) { 
            $('#select2_event').next().find('.select2-selection').removeClass('form-error');
            $('#event_error').html('');
         } else {
            $('#select2_event').next().find('.select2-selection').addClass('form-error');
            $('#event_error').html('*This field is required.');
            is_valid = false;
         }

         // schedule select2
         if($('#select2_schedule').val()) { 
            $('#select2_schedule').next().find('.select2-selection').removeClass('form-error');
            $('#schedule_error').html('');
         } else {
            $('#select2_schedule').next().find('.select2-selection').addClass('form-error');
            $('#schedule_error').html('*This field is required.');
            is_valid = false;
         }
      }

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
   };

   const getEventDatesAPI = function(url, event) {
      axios.get(url, axiosConfig).then(res => {      
         res.data.results.forEach(schedule => {
            const date = moment(schedule.date).format("MMMM DD, YYYY (ddd)");
            const start = moment(schedule.date + ' ' + schedule.time_start).format("h:mm A");
            const end = moment(schedule.date + ' ' + schedule.time_end).format("h:mm A");
            $("#select2_schedule").append(`<option value='${schedule.id}'>${date} ${start} - ${end}</option>`)
         });

         if (res.data.next) { // check if there is next page to API
            if (res.data.next.includes('socket')){ // check if host == socket
               let url = res.data.next.replace('socket', window.location.host)
               getEventDatesAPI(url, event)
            } else getEventDatesAPI(res.data.next, event)
         } 
      });
   };
});

