$(document).ready(function() {
    // Local Variables
    let action, url;

    let table = $('#dt_schedules').DataTable({
        "searching": false,
        "responsive": true,
        "lengthChange": false,
        "autoWidth": false, 
        "serverSide": true,
        "processing": true,
        "language": {
            processing: $('#table_spinner').html()
        },
        "pageLength": 10,
        "ajax": {
            url: '/api/events/eventdate/all/?format=datatables',
            type: "GET",
            data: {
                "event": $('#event_id').data().eventId,
            },
        },
        "columns": [
            {
                data: "date",
                render: function (data, type, row) {
                    let date = moment(row.date).format('DD MMMM YYYY');
                    data = `<a href='#' class='action-link view-schdule' style="color:${row.highlight}" data-toggle="tooltip" data-placement="top" title="View Attendance"> ${date} </a>`
                    return data
                },
            }, // Date
            {
                data: "time_start",
                render: function (data, type, row) {
                    return moment(row.date + ' ' + row.time_start).format('h:mm:ss a')
                },
            }, // Time Start
            {
                data: "time_end",
                render: function (data, type, row) {
                    return moment(row.date + ' ' + row.time_end).format('h:mm:ss a')
                },
            }, // Time End
            {
                data: "attendance",
                render: function (data, type, row) {
                    return row.attendance;
                },
            }, // Attendance
            {
                data: "venue",
            }, // Venue
            {
                data: "is_active",
                render: function (data, type, row) {
                    if (row.is_active === true) data = "<i class='fas fa-check-circle text-success'></i>";
                    else data = "<i class='fas fa-times-circle text-secondary'></i>";
                    return data
                },
            }, // Is Active
            {
                data: null,
                render: function (data, type, row) { 
                    return `<a href='#' class='text-secondary edit-schedule' data-toggle="tooltip" data-placement="top" title="Edit"><i class='fas fa-lg fa-edit'></i></a>`
                },
                orderable : false,
            }, // Null
            {
                data: "id",
                visible: false
            }, // Id
        ],
        "order": [[0, "desc"], [1, "desc"]],
    }); // table end

    // // view schedule
    $('#dt_schedules tbody').on('click', '.view-schdule', function () {
        let dt_data = table.row($(this).parents('tr')).data();
        let date = moment(dt_data['date']).format('DD MMMM YYYY');
        let time_start = moment(dt_data['date'] + ' ' + dt_data['time_start']).format('h:mm A');
        let time_end = moment(dt_data['date'] + ' ' + dt_data['time_end']).format('h:mm A');
        let event_date = moment(dt_data['date'] + ' ' + dt_data['time_start']);
        let day = moment(event_date).format('dddd');
        let duration_obj = moment.duration(moment(time_end, 'HH:mm a').diff(moment(time_start, 'HH:mm a')));
        let hours = parseInt(duration_obj.asHours())
        let mins = parseInt(duration_obj.asMinutes()) % 60;
        
        $("#viewSchedule").modal(); // open modal
        $("#viewSchedule .title-datetime").text(`${date} ${time_start} - ${time_end}`); // title date
        $("#viewSchedule .title-duration").text(`${hours}h and ${mins}min`); // title venue
        $("#viewSchedule .title-participants").text(dt_data['attendance']); // title attendance
        $("#viewSchedule .title-venue").text(dt_data['venue']); // title venue
        $("#viewSchedule .info-datetime").text(day); // title date
        $("#viewSchedule .info-venue").html((dt_data['address']) ? `<a href="${dt_data['address']}" class="text-secondary">${dt_data['address']}</a>` : null); // title venue
        $('#viewSchedule #btn_save_attendance').attr('data-schedule-id', dt_data['id']); // set data value to button        
        $('.attandance-wrap').empty(); // clear rows
        getEventTicket(`/api/events/eventticket/?schedule=${dt_data['id']}`, event_date)
    });

    // // add schedule
    $('#btn_add_schedule').click(function(e) {
        $("#scheduleModal").modal(); // open modal
        resetForm(); // reset form
        action = 'post';
        url = '/api/events/eventdate/schedule/';
    });

    // // edit schedule
    $('#dt_schedules tbody').on('click', '.edit-schedule', function () {
        let dt_data = table.row($(this).parents('tr')).data();
        $("#scheduleModal").modal(); // open modal
        $("#scheduleModal #txt_date").val(dt_data['date']); // date
        $("#scheduleModal #txt_time_start").val(dt_data['time_start']); // time start
        $("#scheduleModal #txt_time_end").val(dt_data['time_end']); // time end
        $("#scheduleModal #txt_venue").val(dt_data['venue']); // venue
        $("#scheduleModal #txt_link").val(dt_data['address']); // url
        $('#scheduleModal #chk_status').prop("checked", dt_data['is_active']); // is active
        action = 'put';
        url = `/api/events/eventdate/schedule/${dt_data['id']}/`;
    });

    // // save schedule
    $('#btn_save_schedule').click(function(e) {
        e.preventDefault();
        $(this).prop('disabled', true);
        let schedule_obj = new Object();
        schedule_obj.date = ($("#txt_date").val()) ? $("#txt_date").val() : null; // date
        schedule_obj.time_start = ($("#txt_time_start").val()) ? $("#txt_time_start").val() : null; // time start
        schedule_obj.time_end = ($("#txt_time_end").val()) ? $("#txt_time_end").val() : null; // time end
        schedule_obj.venue = $("#txt_venue").val(); // venue
        schedule_obj.address = $("#txt_link").val(); // url
        schedule_obj.is_active = ($('#chk_status').prop("checked") == true) ? true : false; // is active
        schedule_obj.event = $(this).data().eventId // event

        axios({
            method: action,
            url: url,
            data: schedule_obj,
            headers: axiosConfig,
        }).then(function (response) { // success
            $('#scheduleModal #btn_save_schedule').prop('disabled', false);
            $("#scheduleModal").modal('toggle'); // close modal
            toastSuccess('Success');
            table.ajax.reload();
        }).catch(function (error) { // error
            toastError(error.response.statusText)
            if (error.response.data.date) showFieldErrors(error.response.data.date, 'date'); else removeFieldErrors('date');
            if (error.response.data.time_start) showFieldErrors(error.response.data.time_start, 'time_start'); else removeFieldErrors('time_start');
            if (error.response.data.time_end) showFieldErrors(error.response.data.time_end, 'time_end'); else removeFieldErrors('time_end');
            if (error.response.data.venue) showFieldErrors(error.response.data.venue, 'venue'); else removeFieldErrors('venue');
            if (error.response.data.address) showFieldErrors(error.response.data.address, 'link'); else removeFieldErrors('link');
            $('#scheduleModal #btn_save_schedule').prop('disabled', false);
        });
    }); 

    // // save attendance
    $('#btn_save_attendance').click(function(e) {
        e.preventDefault();

        if (validateAttendance()) {
            $('#alert_error').addClass('d-none')
            $('#alert_error small').html('')
            $(this).prop('disabled', true)
            
            $('.card-attendance').each(function() { // iterate rows
                const id = $(this).data().attendanceId; // row id
                const present = $(this).find('div.col .present-box');
                let attended = present.is(":checked"); // get present bool value
                axios.patch(`/api/events/attendance/${id}/`, {attended: attended}, {headers: axiosConfig});
            });

            $.when(toastSuccess('Success')).then(() => location.reload());
        } else {
            $('#alert_error').removeClass('d-none')
            $('#alert_error small').html('*Please select an option.')
        }
        $(this).prop('disabled', false)
    }); 

    let getEventTicket = function(url, event_date) {
        axios.get(url, axiosConfig).then(res => {
            if (res.data.count > 0 ) { // if response has data
                $('#state_display').addClass('d-none'); // hide "No attendance yet" content
                $('#attendance_table').removeClass('d-none'); // show row heading
                // show save button if todate get passed event date else hide
                (moment() >= event_date) ? $('#btn_save_event').removeClass('d-none') : $('#btn_save_event').addClass('d-none'); 

                // iterate event tickets
                res.data.results.forEach(obj => {
                    $('.attandance-wrap').append(
                        `<div class="card-attendance row" data-attendance-id=${obj.id}>
                            <div class="col">${obj.ticket.requested_by.name}</div>
                            <div class="col">${obj.ticket.ticket_no}</div>
                            <div class="col">${obj.ticket.status.name}</div>
                            <div class="col col-2">
                                <div class="icheck-material-orange m-0">
                                    <input type="checkbox" class="present-box" id="attendance_${obj.id}" ${obj.attended ? 'checked' : ''} ${moment() >= event_date ? '' : 'disabled'} />
                                    <label for="attendance_${obj.id}" class="mb-0"></label>
                                </div>
                            </div>
                        </div>`
                    )
                });
                if (res.data.next) getEventTicket(res.data.next);
            } else {
                $('#state_display').removeClass('d-none'); // show "No attendance yet" content
                $('#attendance_table').addClass('d-none'); // hide row heading
                $('#btn_save_event').addClass('d-none'); // hide save button
            }            
        });
    };

    let validateAttendance = function() {
        var success = true;
        $('.card-attendance').each(function() { // iterate rows
            const present = $(this).find('div.col .present-box');
            const absent = $(this).find('div.col .absent-box');

            if (present.is(":checked") || absent.is(":checked")) {
                $(this).removeClass('row-error');
            } else {
                $(this).addClass('row-error');
                success = false;
            }
        });
        return success;
    };   

    let resetForm = function (e) {
        $('.event-form').trigger('reset');
        $('.form-control').val(null);
        $('.form-control-check').prop('checked', true)
        removeFieldErrors('all');
    }

    let showFieldErrors = function(obj, field) {
        // error message
        let msg = '';
        obj.forEach(error => {msg += `${error} `});
        $(`#${field}_error`).html(`*${msg} `)
        $(`#txt_${field}`).addClass('form-error')
    };

    let removeFieldErrors = function (field) {
        switch(field) {
            case 'all':
                $('.form-control').removeClass('form-error');
                $('.error-info').html(``)
                break;
            default:
                $(`#txt_${field}`).removeClass('form-error');
                $(`#${field}_error`).html(``)
                break;
        }
    };
});
    