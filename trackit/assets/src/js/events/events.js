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
            url: '/api/events/all/?format=datatables',
            type: "GET"
        },
        "columns": [
            {
                data: "title",
                render: function (data, type, row) {
                    let headline_html = `<div><p class="title text-nowrap m-0">${row.title}</p><span class="sub-title text-muted">${row.subject}</span></div>`;
                    if (type == 'display') data = `<a href='/announcement/article/${row.id}/view' class='text-orange btn-edit'> ${headline_html} </a>`
                    return data
                },
            },
            {
                data: "event_for",
                render: function (data, type, row) {
                    if (type == 'display') data = row.event_for.name;
                    return data
                },
            },
            {
                data: "participants",
            },
            {
                data: "scheduled_dates",
                render: function (data, type, row) {
                    let dates = new Array()
                    if (row.scheduled_dates.length > 0){
                        row.scheduled_dates.forEach(date => dates.push(date.date))
                    }
                    if (type == 'display') data = dates
                    return data
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
        "order": [[4, "desc"]],
    }); // table end
});