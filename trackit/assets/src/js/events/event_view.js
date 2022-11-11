$(document).ready(function() {
    
    // Local Variables
    let action, url;
    let searchInput = function() { return $('#search_input').val(); }
    let statusFilter = function() { return $('#status-filter').val(); }
    let dateFromFilter = function() { return $('#date-from-filter').val(); }
    let dateToFilter = function() { return $('#date-to-filter').val(); }
    let timeStartFilter = function() { return $('#time-start-filter').val(); }
    let timeEndFilter = function() { return $('#time-end-filter').val(); }
    let activeFilter = function() { return $('#active-filter').val(); }
    
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
        "pageLength": 15,
        "ajax": {
            url: '/api/events/eventdate/all/?format=datatables',
            type: "GET",
            data: {
                "event": $('#event_id').data().eventId,
                "search": searchInput,
                "status" : statusFilter,
                "date_from": dateFromFilter,
                "date_to": dateToFilter,
                "time_start" : timeStartFilter,
                "time_end" : timeEndFilter,
                "is_active" : activeFilter
            },
        },
        "columns": [
            {
                data: "date",
                render: function (data, type, row) {
                    let date = moment(row.date).format('DD MMMM YYYY');
                    data = `<a href='#' class='action-link view-schedule' style="color:${row.highlight}" data-toggle="tooltip" data-placement="top" title="View Attendance"> ${date} </a>`
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
                render: function (data, type, row) {
                    link = (row.address) ? "<i class='fas fa-sm fa-link text-orange ml-2'></i>" : '';
                    data = `${row.venue}${link}`
                    return data
                },
            }, // Venue
            {
                data: "state",
                render: function (data, type, row) {
                    switch(row.state.id) {
                        case 1: 
                            data = `<span class="badge badge-pill badge-success">${row.state.text}</span>` // upcoming
                            break;
                        case 2: 
                            data = `<span class="badge badge-pill badge-primary">${row.state.text}</span>` // on going
                            break;
                        case 3: 
                            data = `<span class="badge badge-pill badge-secondary">${row.state.text}</span>` // ended
                            break;
                    }
                    return data
                },
            }, // Is Active
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
                    // let template = `<a href='#' class='text-secondary view-schedule mr-2' data-toggle="tooltip" data-placement="top" title="View Attendance"><i class="fas fa-lg fa-clipboard-list"></i></a>
                    //     <a href='#' class='text-secondary edit-schedule mr-2' data-toggle="tooltip" data-placement="top" title="Edit"><i class='fas fa-lg fa-edit'></i></a>` 
                    return `<a href='#' class='text-secondary edit-schedule' data-toggle="tooltip" data-placement="top" title="Edit"><i class='fas fa-lg fa-edit'></i></a>`
                },
                orderable : false,
            }, // Null
        ],
        "order": [[0, "desc"], [1, "desc"]],
    }); // table end

    // // // // // // // // // // // // // // // //  SEARCH AND FILTERS
    $('.select-filter').select2(); // select2 config

    $("#search_input").on('search', function () { // Search Bar onSearch Event
        table.ajax.reload(); 
        return false; // prevent refresh
    });
    $("#execute_search").click(function () { // Search Bar onClick Event
        table.ajax.reload();
        return false; // prevent refresh
    });
    $('#search_input').keypress(function(event) { // Search Bar keyPress Event
        let keycode = event.keyCode || event.which;
        if (keycode == '13') table.ajax.reload();
    });
    
    // Apply Filter
    $("#btn_apply").click(function () {
        table.ajax.reload();
        return false; // prevent refresh
    });
    // Clear Filter
    $("#btn_clear").click(function () {
        $('#form-filter').trigger("reset");
        $('#form-filter select').trigger("change");
        table.ajax.reload();
        return false; // prevent refresh
    });
    // Close Dropdown 
    $('#close_dropdown').click(function () { toggleFilter() });
    // Close Dropdown When Click Outside 
    $(document).on('click', function (e) { toggleFilter() });
    // Dropdown Prevent From closing
    $('.dropdown-filter').on('hide.bs.dropdown', function (e) {
        if (e.clickEvent) e.preventDefault();
    });

    // // view schedule
    $('#dt_schedules tbody').on('click', '.view-schedule', function () {
        let dt_data = table.row($(this).parents('tr')).data();
        let date = moment(dt_data['date']).format('ddd, DD MMM YYYY');
        let time_start = moment(dt_data['date'] + ' ' + dt_data['time_start']).format('h:mm A');
        let time_end = moment(dt_data['date'] + ' ' + dt_data['time_end']).format('h:mm A');
        let event_date = moment(dt_data['date'] + ' ' + dt_data['time_start']);
        let day = moment(event_date).format('dddd');
        let duration_obj = moment.duration(moment(time_end, 'HH:mm a').diff(moment(time_start, 'HH:mm a')));
        let hours = parseInt(duration_obj.asHours())
        let mins = parseInt(duration_obj.asMinutes()) % 60;
        let link = (dt_data['address']) ? `<a href="${dt_data['address']}" class="text-secondary" target="_blank" data-toggle="tooltip" data-placement="top" title="${dt_data['address']}"><i class="fas fa-sm fa-link"></i></a>` : null;
        
        $("#viewSchedule").modal(); // open modal
        $("#viewSchedule .title-datetime").text(`${date} ${time_start} - ${time_end}`); // title date
        $("#viewSchedule .title-duration").text(`${hours}h and ${mins}min`); // title venue
        $("#viewSchedule .title-participants").text(dt_data['attendance']); // title attendance
        $("#viewSchedule .title-venue").html(`${dt_data['venue']} ${link}`); // title venue
        $('#viewSchedule #btn_save_attendance').prop('disabled', false).attr('data-schedule-id', dt_data['id']); // set data value to button        
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
        console.log(moment(`${dt_data['date']} ${dt_data['time_start']}`).format("HH:mm"))
        $("#scheduleModal").modal(); // open modal
        $("#scheduleModal #txt_date").val(dt_data['date']); // date
        // need to covert time format value to match with POST
        $("#scheduleModal #txt_time_start").val(moment(`${dt_data['date']} ${dt_data['time_start']}`).format("HH:mm")); // time start
        $("#scheduleModal #txt_time_end").val(moment(`${dt_data['date']} ${dt_data['time_end']}`).format("HH:mm")); // time end
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
        const scheduleId = $(this).data().scheduleId;
        const attendance = new Array();
        $('.card-attendance').each(function() { // iterate rows
            if ($(this).find('div.col .attendance-box').length > 0) { // if element exists
                let rowObj = new Object();
                rowObj.id = $(this).data().attendanceId;
                rowObj.attended = $(this).find('div.col .attendance-box').is(":checked");
                attendance.push(rowObj);
            }
        });

        if (attendance.length > 0) { // if array is not empty
            $(this).prop('disabled', true)
            // put request
            axios.put(`/api/events/eventdate/attendnance/${scheduleId}/`, {attendance: attendance}, {headers: axiosConfig}).then(res => {
                $.when(toastSuccess('Success')).then(() => 
                    $("#viewSchedule").modal('hide'),
                    $("#viewSchedule #btn_save_attendance").prop('disabled', true),
                    table.ajax.reload()
                );   
            }).catch(err => {
                toastError(err.response.statusText)
            });
        } else toastError('No attendance to record')           
    }); 

    let getEventTicket = function(url, event_date) {
        axios.get(url, axiosConfig).then(res => {
            if (res.data.count > 0 ) { // if response has data
                $('#state_display').addClass('d-none'); // hide "No attendance yet" content
                $('#attendance_table').removeClass('d-none'); // show row heading
                (moment() >= event_date) ? $('#btn_save_attendance').removeClass('d-none') : $('#btn_save_attendance').addClass('d-none');  // show save button if todate get passed event date else hide
                (moment() <= event_date) ? $('#attendance_info').removeClass('d-none') : $('#attendance_info').addClass('d-none');  // show attendance_note a if todate get passed event date else hide
                res.data.results.forEach(obj => { // iterate event tickets
                    console.log(obj)
                    $('.attandance-wrap').append(
                        `<div class="card-attendance row" data-attendance-id=${obj.id}>
                            <div class="col">${obj.ticket.requested_by.name}</div>
                            <div class="col">${obj.ticket.ticket_no}</div>
                            <div class="col d-none d-md-block">${obj.ticket.status.name}</div>
                            <div class="col col-md-2">
                                ${obj.is_reschedule ? 'Rescheduled' : `
                                <div class="icheck-material-orange m-0">
                                    <input type="checkbox" class="attendance-box" id="attendance_${obj.id}" ${obj.attended ? 'checked' : ''} ${moment() >= event_date ? '' : 'disabled'} />
                                    <label for="attendance_${obj.id}" class="mb-0"></label>
                                </div>`}
                            </div>
                        </div>`
                    )
                });
                if (res.data.next) getEventTicket(res.data.next);
            } else {
                $('#state_display').removeClass('d-none'); // show "No attendance yet" content
                $('#attendance_info').addClass('d-none'); // hide info text
                $('#attendance_table').addClass('d-none'); // hide row heading
                $('#btn_save_attendance').addClass('d-none'); // hide save button
            }            
        });
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
    