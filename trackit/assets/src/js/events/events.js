$(document).ready(function() {
    let table = $('#dt_events').DataTable({
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
            url: '/api/events/all/?format=datatables',
            type: "GET"
        },
        "columns": [
            {
                data: "title",
                render: function (data, type, row) {
                    let headline_html = `<div><p class="title text-nowrap m-0">${row.title}</p><span class="sub-title text-muted">${row.subject}</span></div>`;
                    if (type == 'display') data = `<a href='/events/event/${row.id}/view' class='text-orange btn-edit'> ${headline_html} </a>`
                    return data
                },
            }, // Title
            {
                data: "event_for",
                render: function (data, type, row) {
                    if (type == 'display') data = row.event_for.name;
                    return data
                },
            }, // Event For
            {
                data: "highlight",
                render: function (data, type, row) {
                    if (type == 'display') data = `<div class= "circle" style="background-color:${row.highlight};" ></div>`;
                    return data
                },
            }, // Highlight
            {
                data: "participants",
            }, // Participants
            {
                data: "is_active",
                render: function (data, type, row) {
                if (row.is_active === true) data = "<i class='fas fa-check-circle text-success'></i>";
                else data = "<i class='fas fa-times-circle text-secondary'></i>";
                return data
                },
            } // Is Active
        ],
        "order": [[4, "desc"]],
    }); // table end
});