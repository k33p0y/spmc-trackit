$(document).ready(function() {
    let table = $('#dt_mytasks').DataTable({
        "searching": false,
        "responsive": true,
        "lengthChange": false,
        "autoWidth": false, 
        "serverSide": true,
        "processing": true,
        "paging" : false,
        "language": {
            processing: $('#table_spinner').html()
         },
        "pageLength": 15,
        "ajax": {
            url: '/api/tasks/all/?format=datatables',
            type: "GET",
        },
        "columns": [
            {
                data: "ticket",
                render: function (data, type, row) {
                    let description = (row.ticket.description.length >= 80) ? `${row.ticket.description.substr(0, 80)} ...` : row.ticket.description;
                    let template = `<p class="font-weight-bold m-0" data-toggle="tooltip" data-placement="top" title="${row.ticket.description}">${description}</p>
                        <span class="badge badge-pill text-light" style="background-color:${row.ticket.request_form.color}!important">${row.ticket.request_form.prefix}</span>
                        <span class="badge badge-light2 badge-pill">${row.ticket.reference_no}</span>
                        <span class="badge badge-orange-pastel badge-pill">${row.task_type.name}</span>`;
                    if (type == 'display') data = template
                    return data
                },
                width: "45%"
            }, // tikcket
            {
                data: "ticket",
                render: function (data, type, row) {
                    if (type == 'display') data = `<a href='/requests/${row.ticket.ticket_id}/view' class='btn-link-orange action-link btn_view'> ${row.ticket.ticket_no} </a>`
                    return data
                }
            }, // ticket no
            {
                data: "officers",
                render: function (data, type, row) {
                    function memberItem() {
                        let template = '';
                        row.officers.forEach(officer => {
                           const fullname = officer.full_name
                           const initials = `${officer.first_name.charAt(0)}${officer.last_name.charAt(0)}`
                           template += `<div class="member-profile member-overlap-item" data-toggle="tooltip" data-placement="top" title="${fullname}">${initials}</div>`
                        })
                        return template
                     }
                    if (type == 'display') data = `<div class="d-flex">${memberItem()}</div>`
                    return data
                },
                orderable: false,
            }, // officers
            {
                data: "date_created",
                render: function (data, type, row) {
                    let date = moment(row.date_created).format('DD MMMM YYYY');
                    let time = moment(row.date_created).format('h:mm:ss a');
                    if (type == 'display') data = `<p class="title mb-0">${date}</p><span class="sub-title">${time}</span>`
                    return data
                },
            }, // date_created
            {
                data: null,
                render: function (data, type, row) {
                    let template = `<div class="d-flex align-items-center">
                        <button type="button" class="btn btn-outline-secondary btn-sm p-0 px-2 mr-1" data-toggle="tooltip" data-placement="top" title="Add collaborator"><i class="fas fa-xs fa-user-plus"></i></button>
                        <button type="button" class="btn btn-outline-secondary btn-sm p-0 px-2 mr-1" data-toggle="tooltip" data-placement="top" title="Transfer Task"><i class="fas fa-xs fa-exchange-alt"></i></button>
                        <button type="button" class="btn btn-outline-danger btn-sm p-0 px-2 mr-1" data-toggle="tooltip" data-placement="top" title="Remove Task"><i class="fas fa-xs fa-trash-alt"></i></button>
                    </div>`
                    return data = template
                },
                orderable: false
            } // dropdown
        ],
    }); // table end
});