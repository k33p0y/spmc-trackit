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

    // Attendance 
    $('#btn_present, #btn_absent').click(function () {
        $(this).attr("disabled", true) // disable button
        let attended = $(this).data().attended;
        let schedule_id =  $(this).data().scheduleId;

        axios.patch(`/api/events/attendance/${schedule_id}/`, 
            {attended: attended}, 
            {headers: axiosConfig}
        ).then(res => {
            $.when(toastSuccess('Success')).then(() => location.reload());
        }).catch(err => {
            toastError(err.response.statusText);
            $(this).attr("disabled", false) // enable button
        });
    });

    // walkthrough click event
    $('.tour-me').click(function() {
        exploreRequestView();
    });
});
