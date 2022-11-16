$(document).ready(function () {
   $('#select2_nextstep').select2(); // select2 steps
   $('#select2_officer').select2({ placeholder: 'Select officer' }); // select2 officer
   $('#select2_event').select2({ placeholder: 'Select event' }); // select2 events
   $('#select2_schedule').select2({ placeholder: 'Select date' }); // select2 schedule

   // character counter
   $('#txtarea-remark').on("input", function () {
      let maxlength = $(this).attr("maxlength");
      let currentLength = $(this).val().length;
      $('#char_count').html(currentLength);

      if (currentLength >= maxlength) $('#error-info-remark').html("You have reached the maximum number of characters.");
      else $('#error-info-remark').html('Optional, Maximum of 100 characters only')
   });

   // select2_nextstep on change
   $('#select2_nextstep').on('change', function () {
      let step_id = $("#select2_nextstep option:selected").data().formstatusid;
      let ticket_id = $(".ticket-no").data().ticketId;
      $("#select2_officer").empty();
      axios.get('/api/requests/formstatus/officer/', { params: { step: step_id, ticket_id: ticket_id } }, axiosConfig).then(res => {
         let response = res.data.results.shift();
         let officers = response.officers;
         if (officers.length == 1) {
            let person = officers.shift();
            $("#select2_officer").attr('multiple', false).select2().append(`<option value='${person.id}' selected>${person.name}</option>`)
         } else {
            $("#select2_officer").attr('multiple', true).select2({ placeholder: 'Select officer' });
            officers.forEach(person => $("#select2_officer").append(`<option value='${person.id}'>${person.name}</option>`));
         }
      });
   });   

   // select2_event on change
   $('#select2_event').on('change', function () {
      let event = $("#select2_event").val();
      let url = `/api/events/eventdate/all/?event=${event}&is_active=${true}&dates=${true}`
      $("#select2_schedule").empty().append('<option></option>').removeAttr('disabled');
      getEventDatesAPI(url, event)
   });

   // accept action 
   $('.btn-accept').click(function (e) {
      e.preventDefault();
      let ticket_id = $(this).data().ticketId;
      let status = $("#select2_nextstep").val()
      let formstatus = $("#select2_nextstep option:selected").data().formstatusid
      let is_approve = ($(this).data().approve) ? true : null;
      let is_pass = ($(this).data().pass) ? true : null;

      if (validateRemark()) postAction(ticket_id, status, formstatus, is_approve, is_pass);
   });

   // refuse action
   $('.btn-refuse').click(function (e) {
      e.preventDefault();
      let ticket_id = $(this).data().ticketId;
      let status = ($(this).data().nextStep == $("#select2_nextstep").val()) ? $(this).data().prevStep : $("#select2_nextstep").val();
      let formstatus = ($(this).data().nextStep == $("#select2_nextstep").val()) ?  $(this).data().prevformstatusId : $("#select2_nextstep option:selected").data().formstatusid 
      let is_approve = ($(this).data().approve == false) ? false : null;
      let is_pass = ($(this).data().pass == false) ? false : null;

      // If head disapprove set status to close
      if ($(this).data().headDisapprove) {
         status = $('#select2_nextstep option:last-child').val();
      }

      if (validateRemark()) {
         Swal.fire({
            title: 'Are you sure?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'OK',
            confirmButtonColor: '#17a2b8',
         }).then((result) => {
            if (result.value) {
               postAction(ticket_id, status, formstatus, is_approve, is_pass);
            }
         })
      }
   });

   // post action
   const postAction = function (ticket, status, formstatus, is_approve, is_pass) {     
      let data = new Object();
      data.ticket = ticket
      data.remark = $('#txtarea-remark').val();
      data.task = ($("#current_step").data().task) ? $("#current_step").data().task : null; // get if has current task
      data.is_approve = is_approve;
      data.is_pass = is_pass;
      data.status = status;
      data.formstatus = formstatus;
      data.assign_to = ($("#select2_officer").val()) ? $("#select2_officer").val() : '';
      data.scheduled_event = ($("#current_step").data().scheduledEvent) ? $("#current_step").data().scheduledEvent : null; // get if has current event
      data.event_date = ($('#current_step').data().hasEvent) ? $("#select2_schedule").val() : '';

      axios({
         method: 'POST',
         url: `/api/requests/ticket/actions/`,
         data: data,
         headers: axiosConfig,
      }).then(res => {
         socket_notification.send(JSON.stringify({ type: 'action_notification', data: { object_id: formstatus, notification_type: 'action' } }))
         $.when(toastSuccess('Success')).then(function () {
            location.reload();
         });
      }).catch(err => {
         toastError(err.response.statusText)
         if (err.response.data.ticket.attendance) $('.error-action').html(`*${err.response.data.ticket.attendance}`); else $('.error-action').html();
      });
   };

   const validateRemark = function () {
      is_valid = true;

      if ($('#current_step').data().hasEvent) { // validate events dropdown
         // event select2
         if ($('#select2_event').val()) {
            $('#select2_event').next().find('.select2-selection').removeClass('form-error');
            $('#event_error').html('');
         } else {
            $('#select2_event').next().find('.select2-selection').addClass('form-error');
            $('#event_error').html('*This field is required.');
            is_valid = false;
         }

         // schedule select2
         if ($('#select2_schedule').val()) {
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

   const getEventDatesAPI = function (url, event) {
      axios.get(url, axiosConfig).then(res => {
         res.data.results.forEach(schedule => {
            const date = moment(schedule.date).format("MMMM DD, YYYY (ddd)");
            const start = moment(schedule.date + ' ' + schedule.time_start).format("h:mm A");
            const end = moment(schedule.date + ' ' + schedule.time_end).format("h:mm A");
            $("#select2_schedule").append(`<option value='${schedule.id}'>${date} ${start} - ${end}</option>`)
         });

         if (res.data.next) { // check if there is next page to API
            if (res.data.next.includes('socket')) { // check if host == socket
               let url = res.data.next.replace('socket', window.location.host)
               getEventDatesAPI(url, event)
            } else getEventDatesAPI(res.data.next, event)
         }
      });
   };
});

