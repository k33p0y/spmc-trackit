$(document).ready(function () {
    // Check if user has already done or skip walkthrough
    axios.get('/api/config/tour/').then(res => { // response
        const response = res.data.results;
        let request = new Object();
        // if has response and is_explore value is false; call walkthrough fn with PUT method and url
        // if empty response; call walkthrough fn with POST method to create instance  
        if (response.length > 0 && !response[0].is_explore_req_view) {
            request.method = 'PUT';
            request.url = `/api/config/tour/${response[0].id}/`;
            exploreRequestView(request);
        }
        else if (response.length == 0) {
            request.method = 'POST';
            request.url = `/api/config/tour/`;
            exploreRequestView(request);
        }
    }).catch(err => { // error
        toastError(err.response.statusText) // alert
    });

    // get ticket number in localStorage if available
    if (localStorage.getItem('ticketNumber')){
        localStorage.removeItem('ticketNumber');
    }

    // set notification instance to unread = False
    if (localStorage.getItem('notification-id')){
        axios.delete(`/api/user/notifications/${localStorage.getItem('notification-id')}/`, {headers: axiosConfig})
        localStorage.removeItem('notification-id');
    }

    // humanize date
    $('.list-datetime').each((i, e) => {
        const date_str = $(`#${e.id}`).text();
        const date = moment(new Date(date_str)).format("MMMM DD, YYYY hh:mm A");
        
        if (date_str) $(`#${e.id}`).text(date); else ''
    });

    // Generate Reference No
    $('#btn_generate').click(function() {
        let id = $(this).data().ticketId;

        axios({
            url: `/api/requests/${id}/generate-reference/`,
            method: "PATCH",
            headers: axiosConfig
        }).then(function (response) {
            // Show Spinners
            $(".ref-spinner").removeClass('d-none');
            $("#ref_context").html('');
            $("#btn_generate").prop('disabled', true)

            setTimeout(function() { 
                $(".ref-spinner").addClass('d-none');
                $("#ref_context").removeClass('text-muted').html(response.data.reference_no);
                $("#btn_generate").remove();
            }, 800);
        }).catch(function (error) {
            toastError(error.response.data);
        });
    });

    $('.btn-view-logs').click(function(){
        // set ticket number in localStorage
        localStorage.setItem('ticket-number', $(this).data('ticket-number'));
    });

    // Events 
    $('#btn_reshedule').click(function () { // reschedule
        Swal.fire({
            title: 'Remarks/Reason',
            input: 'textarea',
            inputPlaceholder: 'Type your reason here...',
            inputAttributes: {
               'aria-label': 'Type your reason here',
               'maxlength': 100,
            },
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Submit',
            reverseButtons: true,
            inputValidator: (value) => {
                if (!value) return 'This field may not be blank'
            }
        }).then((result) => {
            $(this).prop('disabled', true) // disable button
            if (result.value) {
                const schedule_id =  $(this).data().scheduleId;
                axios.put(`/api/events/reschedule/${schedule_id}/`, 
                    {remarks: result.value}, 
                    {headers: axiosConfig}
                ).then(res => {
                    $.when(toastSuccess('Success')).then(() => location.reload());
                }).catch(err => {
                    toastError(err.response.statusText);
                    $(this).attr("disabled", false) // enable button
                });
            } else  $(this).prop('disabled', false); // enable button
        });
    });

    // Transfer Ticket Officer 
    $('#select_person').select2({
        allowClear: true,
        placeholder: 'Select User',
        cache: true,
    });

    $('#btn_transfer').click(function () { // transfer
        $(this).prop('disabled', true); 
        let task = $("#taskId").val();
        let person = $('#select_person').val();
        let remark = $('#txt_remark').val();

        axios({
            method: 'PUT',
            url: `/api/tasks/transfer/${task}/`,
            data: {
                person: person,
                remark: remark
            },
            headers: axiosConfig
        }).then(res => {
            $.when(toastSuccess('Success')).then(() => location.reload());
            $('#select_person').val([]).trigger('change');
            $('#text_remark').val(); 
            $('#people-error').text(null); 
            $("#transferModal").modal('toggle');
        }).catch(err => {
            toastError(err.response.statusText)
            if (err.response.data.person) {
                $('#select_person').next().find('.select2-selection').addClass('form-error');
                $('#person-error').html(err.response.data.person.shift())
            } else {
                $('#select_person').next().find('.select2-selection').removeClass('form-error');
                $('#person-error').html('')
            }
            if (err.response.data.remark) {
                $('#txt_remark').addClass('form-error');
                $('#remark_error').html(err.response.data.remark.shift())
            } else {
                $('#txt_remark').removeClass('form-error');
                $('#remark_error').html('')
            }
            $('#btn_transfer').prop('disabled', false); // enable button
        });
    });
    
    // get task
    $('.btn-add-task').click(function () {
        let opentask_id = $(this).data().opentaskId;
        axios({
            method: 'PUT',
            url: `/api/tasks/open/${opentask_id}/`,
            headers: axiosConfig
        }).then(results => {
            socket_notification.send(JSON.stringify({ type: 'task_notification', data: { object_id: results.data.task_type.id, notification_type: 'action' } }))
            $.when(toastSuccess('Success')).then(() => location.reload());
        }).catch(error => {
            toastError(error.response.statusText)
        })
    })

    // walkthrough click event
    $('.tour-me').click(function() {
        exploreRequestView();
    });
});
