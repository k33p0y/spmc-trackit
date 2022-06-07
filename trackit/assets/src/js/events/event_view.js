$(document).ready(function() {
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
                    data = `<a href='#' class='btn-link-orange action-link view-schdule'> ${date} </a>`
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
                data: "is_active",
                render: function (data, type, row) {
                    if (row.is_active === true) data = "<i class='fas fa-check-circle text-success'></i>";
                    else data = "<i class='fas fa-times-circle text-secondary'></i>";
                    return data
                },
            }, // Is Active
            {
                data: "id",
                visible: false
            }, // Id
        ],
        "order": [[0, "desc"], [1, "desc"]],
    }); // table end

    // // view date
    $('#dt_schedules tbody').on('click', '.view-schdule', function () {
        let dt_data = table.row($(this).parents('tr')).data();
        
        let date = moment(dt_data['date']).format('DD MMMM YYYY');
        let time_start = moment(dt_data['date'] + ' ' + dt_data['time_start']).format('h:mm:ss a')
        let time_end = moment(dt_data['date'] + ' ' + dt_data['time_end']).format('h:mm:ss a')
        
        $("#viewSchedule").modal(); // open modal
        $("#viewSchedule .title-date").text(date); // title date
        $("#viewSchedule .title-time").text(`${time_start} - ${time_end}`); // tile time
        $('.attandance-wrap').empty(); // clear rows
        $('#btn_save').attr('data-scheduled-event', `${dt_data['id']}`); // set data value to button
        
        getEventTicket(`/api/events/eventticket/?schedule=${dt_data['id']}`)
    });

    // // save attendance
    $('#btn_save').click(function(e) {
        e.preventDefault();
        let scheduled_event = $(this).data().scheduledEvent;
        
        $('.card-attendance').each(function() { // iterate rows
            const id = $(this).data().attendanceId; // row id
            const present = $(this).find('div.col .present-box');
            const absent = $(this).find('div.col .absent-box');

            let attended = present.is(":checked"); // get present bool value
            
            axios.patch(`/api/events/attendance/${id}/`, {attended: attended}, {headers: axiosConfig});
        });

        $.when(toastSuccess('Success')).then(() => location.reload());
    });

    let getEventTicket = function(url) {
        axios.get(url, axiosConfig).then(res => {
            $('.spinner').addClass('d-none');
            res.data.results.forEach(obj => {
                $('.attandance-wrap').append(
                    `<div class="card-attendance row" data-attendance-id=${obj.id}>
                        <div class="col col-3">${obj.ticket.ticket_no}</div>
                        <div class="col col-3">${obj.ticket.requested_by.name}</div>
                        <div class="col col-3">${obj.ticket.status.name}</div>
                        <div class="col">
                            <div class="icheck-material-orange m-0">
                            <input type="radio" class="present-box" id="present_${obj.id}" name="attendance_${obj.id}" ${obj.attended ? 'checked' : ''}/>
                            <label for="present_${obj.id}"></label>
                            </div>
                        </div>
                        <div class="col">
                            <div class="icheck-material-orange">
                                <input type="radio" class="absent-box" id="absent_${obj.id}" name="attendance_${obj.id}" ${obj.attended === false ? 'checked' : ''}/>
                                <label for="absent_${obj.id}"></label>
                            </div>
                        </div>
                    </div>`
                )
            });
            if (res.data.next) getEventTicket(res.data.next);
        });
    }
});
