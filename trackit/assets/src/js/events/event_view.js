$(document).ready(function() {
    let table = $('#dt_schedules').DataTable({
        "searching": false,
        "responsive": true,
        "lengthChange": false,
        "autoWidth": false, 
        "serverside": false,
        "processing": true,
        "pageLength": 15,
        "ajax": {
            url: '/api/events/eventdate/?format=datatables',
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
            },
            {
                data: "time_start",
                render: function (data, type, row) {
                    return moment(row.date + ' ' + row.time_start).format('h:mm:ss a')
                },
            },
            {
                data: "time_end",
                render: function (data, type, row) {
                    return moment(row.date + ' ' + row.time_end).format('h:mm:ss a')
                },
            },
            {
                data: "atttendance",
                render: function (data, type, row) {
                    return row.attendance;
                },
            },
            {
                data: "is_active",
                render: function (data, type, row) {
                    if (row.is_active === true) data = "<i class='fas fa-check-circle text-success'></i>";
                    else data = "<i class='fas fa-times-circle text-secondary'></i>";
                    return data
                },
            }
        ],
        "order": [[0, "asc"]],
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
        
        $('.card-attendance').each(function(i, e) { // iterate rows
            const attendance = $(this).find('div.col .attendance-box');
            const attended = attendance.is(':checked');
            const id = attendance.data().attendanceId;

            axios.patch(`/api/events/eventticket/${id}/`, {attended: attended}, {headers: axiosConfig});
        });

        $.when(toastSuccess('Success')).then(() => location.reload());
    });

    let getEventTicket = function(url) {
        axios.get(url, axiosConfig).then(res => {
            $('.spinner').addClass('d-none');
            res.data.results.forEach(obj => {
                $('.attandance-wrap').append(
                    `<div class="card-attendance row">
                        <div class="col col-3">${obj.ticket.ticket_no}</div>
                        <div class="col col-3">${obj.ticket.requested_by.name}</div>
                        <div class="col col-3">${obj.ticket.status.name}</div>
                        <div class="col">
                            <div class="icheck-material-orange m-0 attendance-check">
                                <input type="checkbox" class="attendance-box m-0 p-0" id="chk_attendance_${obj.id}" ${obj.attended ? 'checked' : ''} data-attendance-id=${obj.id} />
                                <label for="chk_attendance_${obj.id}" class="m-0"></label>
                            </div>
                        </div>
                        <div class="col">
                            <button type="submit" class="btn btn-sm btn-link p-0" id="btn_save"><i class="fas fa-trash-alt text-danger"></i></button>
                        </div>
                    </div>`
                )
            });
            if (res.data.next) getEventTicket(res.data.next);
        });
    }
});
