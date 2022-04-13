$(document).ready(function() {
    let table = $('#dt_events').DataTable({
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
                    data = `<a href='#' class='btn-link-orange action-link'> ${date} </a>`
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
                data: null,
                render: function (data, type, row) {
                    return 0;
                },
            }
        ],
        "order": [[0, "asc"]],
    }); // table end
});