$(document).ready(function () {
    let todosTbl = $('#dt_mytasks').DataTable({
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
            url: '/api/tasks/list/mytasks/?format=datatables',
            type: "GET",
        },
        "columns": [
            {
                data: "ticket",
                render: function (data, type, row) {
                    let description = (row.ticket.description.length >= 60) ? `${row.ticket.description.substr(0, 60)}...` : row.ticket.description;
                    let template = `<a href='/requests/${row.ticket.ticket_id}/view' class='btn-link-orange action-link btn_view'> ${row.ticket.ticket_no} </a>
                        <p class="font-weight-bold m-0" data-toggle="tooltip" data-placement="top" title="${row.ticket.description}">${description}</p>
                        <span class="badge badge-pill text-light" style="background-color:${row.ticket.request_form.color}!important">${row.ticket.request_form.prefix}</span>
                        <span class="badge badge-light2 badge-pill">${row.ticket.reference_no}</span>
                        <span class="badge badge-orange-pastel badge-pill">${row.task_type.status.name}</span>`;
                    if (type == 'display') data = template
                    return data
                },
                width: "60%"
            }, // tikcket
            {
                data: "officers",
                render: function (data, type, row) {
                    function memberItem() {
                        let template = '';
                        row.officers.forEach(officer => {
                            const fullname = (actor == officer.user_id) ? 'Me' : officer.full_name
                            const initials = `${officer.first_name.charAt(0)}${officer.last_name.charAt(0)}`
                            template += `<div class="member-profile member-overlap-item" data-toggle="tooltip" data-placement="top" title="${fullname}">${initials}</div>`
                        })
                        return template
                    }
                    if (type == 'display') data = `<div class="d-flex">${memberItem()}</div>`
                    return data
                },
                width: "15%"
                // orderable: false,
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
                    let template = `<div class="d-flex align-items-center justify-content-end actions">
                        <button class="action-item d-flex align-items-center text-secondary btn-view" type="button" data-toggle="tooltip" data-placement="top" title="Detals">
                            <span class="fa-stack" style="font-size: 8px">
                                <i class="far fa-circle fa-stack-2x"></i>
                                <i class="fas fa-info fa-stack-1x"></i>
                            </span>
                        </button>
                        <button class="action-item text-secondary btn-share" data-toggle="tooltip" data-placement="top" title='Share "${row.ticket.ticket_no}"'><i class="fas fa-lg fa-user-plus"></i></button>
                        <button class="action-item text-secondary btn-remove" data-toggle="tooltip" data-placement="top" title="Remove"><i class="fas fa-lg fa-trash-alt"></i></button>
                    </div>`
                    return data = template
                },
                orderable: false
            } // dropdown
        ],
    }); // table end

    const getOpenTasks = function (page, lookup, refresh) {
        let url = (page) ? page : '/api/tasks/open/';
        let params = (lookup) ? { search: lookup } : '';

        axios({
            method: 'GET',
            url: url,
            params: params
        }).then(response => {
            const tasks_api_next = response.data.next;
            const tasks = response.data.results;

            if (tasks_api_next) { // check if there is next page to comment list API
                if (tasks_api_next.includes('socket')) { // check if host == socket
                    let nextpage = tasks_api_next.replace('socket', window.location.host) // change socket host to window.location.host
                    $('#tasks_nextpage_url').val(nextpage);
                } else $('#tasks_nextpage_url').val(tasks_api_next);
            } else $('#tasks_nextpage_url').val(null);

            if (tasks.length > 0) {
                if (lookup) $('#opentask_lists').empty();
                if (refresh) $('#opentask_lists').empty();
                $('#opentasks_state').addClass('d-none'); // hide event state
                $('.task-wrapper').removeClass('d-none'); // show elements
                tasks.forEach(task => {
                    $('#opentask_lists').append( // render template
                        `<div class="card card-task px-3 py-2 mb-3 mx-1 animate__animated animate__flipInX animate__faster">
                            <div class="card-body p-0">
                                <div class="d-flex align-items-center">
                                    <div class="w-75">
                                        <p class="font-weight-bold text-orange m-0">${task.ticket.ticket_no}</p>
                                        <p class="font-weight-bold text-truncate m-0">${task.ticket.description}</p>
                                        <span class="badge badge-pill text-light" style="background-color:${task.ticket.request_form.color}!important">${task.ticket.request_form.prefix}</span>
                                        <span class="badge badge-light2 badge-pill">${task.ticket.reference_no}</span>
                                        <span class="badge badge-orange-pastel badge-pill">${task.task_type.status.name}</span>
                                        <p class="text-xs m-0 mt-2"><a href="/requests/${task.ticket.ticket_id}/view" class="text-muted">View Ticket</a></p>
                                    </div>
                                    <div class="ml-auto">
                                        <button type="button" class="btn btn-sm btn-outline-orange get-task" data-task-id="${task.id}" data-toggle="tooltip" data-placement="top" title="Get task"><i class="fas fa-sm fa-plus"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>`
                    )
                });
                $('.tasks-spinner').addClass('d-none');
            } else if (lookup && tasks.length == 0) {
                $('#opentask_lists').html('<p class="text-center text-muted m-0">No event data found</p>')
            } else {
                $('#opentasks_state').removeClass('d-none'); // show elements
                $('.task-wrapper').addClass('d-none'); // hide elements
            }
        }).catch(error => { // error
            toastError(error.response.statusText);
        });
    }
    getOpenTasks(null, null, false);

    // get more open tasks on scroll
    $('.list-wrapper').scroll(function () {
        if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            if ($('#tasks_nextpage_url').val()) {
                $('.tasks-spinner').removeClass('d-none');
                setTimeout(function () { getOpenTasks($('#tasks_nextpage_url').val()) }, 400);
            };
        }
    });

    // Search Bar onSearch Event
    $("#search-input").on('search', function () {
        let lookup = $('#search-input').val();
        getOpenTasks(null, lookup, false)
        return false; // prevent refresh
    });

    // // Search Bar keyPress Event
    // $('#search-input').keypress(function (event) {
    //     let lookup = $('#search-input').val();
    //     let keycode = event.keyCode || event.which;
    //     if (keycode == '13'); getOpenTasks(null, lookup, false)
    // });

    // Search Bar onClick Event
    $("#execute-search").click(function () {
        let lookup = $('#search-input').val();
        getOpenTasks(null, lookup, false)
        return false; // prevent refresh
    });

    // Events
    // get open tasks
    $('#opentask_lists').on('click', '.get-task', function () {
        let opentask_id = $(this).data().taskId;

        axios({
            method: 'PUT',
            url: `/api/tasks/open/${opentask_id}/`,
            headers: axiosConfig
        }).then(results => {
            // $(this).find('div.card-task');.addClass()
            todosTbl.ajax.reload();
            getOpenTasks(null, null, true);
        }).catch(error => {
            toastError(error.response.statusText)
        })
    });

    // detail task
    $('#dt_mytasks tbody').on('click', '.btn-view', function () {
        const dt_data = todosTbl.row($(this).parents('tr')).data();
        let people = $.map(dt_data['officers'], function( value, i ) { return value.id })
        
        $("#detailModal").modal(); // show modal
        $("#task_name").html(`"${dt_data['ticket'].ticket_no}"`);
        $("#btn_share").prop('disabled', false).data('task', dt_data['id']) // add data attribute to button

        // iterate owners
        $('.people-wrapper').empty();
        dt_data['officers'].forEach(person => {
            let initials = `${person.first_name.charAt(0)}${person.last_name.charAt(0)}`
            let name = `${person.full_name} ${person.user_id == actor ? '(you)' : ''}`
            let formatDate = moment(person.date_assigned).format('MMM DD YYYY');
            // draw template
            $('.people-wrapper').append(`
                <div class="dropdown mr-2">
                    <a class="member-link" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <div class="member-profile member-profile-lg" data-toggle="tooltip" data-placement="top" title="${name}">${initials}</div>
                    </a>
                    <div class="dropdown-menu dropdown-menu-lg text-muted p-2" aria-labelledby="dropdownMenuLink">
                        <ul class="list-group list-flush-dashed list-group-flush">
                            <li class="list-group-item d-flex p-1">
                                <small class="flex-grow-1">Name</small>
                                <small>${name}</small>
                            </li>
                            <li class="list-group-item d-flex p-1">
                                <small class="flex-grow-1">Date</small>
                                <small>${formatDate}</small>
                            </li>
                            <li class="list-group-item d-flex p-1">
                                <small class="flex-grow-1">Assign by</small>
                                <small>${person.assignee ? `${person.assignee.name}` : '-'}</small>
                            </li>
                        </ul>
                    </div>
                </div>`
            );
        });

        // task about
        $('#task_ticket').html(dt_data['ticket'].ticket_no);
        $('#task_form').html(dt_data['ticket'].request_form.name);
        $('#task_description').html(dt_data['ticket'].description);
        $('#task_type').html(dt_data['task_type'].status.name);
        $('#task_created').html(moment(dt_data['date_created']).format('DD MMMM YYYY h:mm:ss a'));
        $("#task_ticket_link").attr("href", `/requests/${dt_data['ticket'].ticket_id}/view`)
    });

    // share task
    $('#dt_mytasks tbody').on('click', '.btn-share', function () {
        const dt_data = todosTbl.row($(this).parents('tr')).data();
        let people = $.map(dt_data['officers'], function( value, i ) { return value.user_id })
        
        $("#shareModal").modal(); // show modal
        $("#task_name").html(`"${dt_data['ticket'].ticket_no}"`);
        $('#select2_people').select2({ // select2 config
            allowClear: true,
            placeholder: 'Add people',
            cache: true,
            ajax: {
                url: `/api/requests/form/status/${dt_data['task_type'].id}/`,
                dataType: 'json',
                type: "GET",
                processResults: function (data) {
                    return {
                        results: $.map(data.officer, function (item) {
                            if ($.inArray(item.id, people) == -1) {
                                return {
                                    text: item.name,
                                    slug: item.slug,
                                    id: item.id
                                }
                            }
                        })
                    };
                }
            }
        });
        $("#btn_share").prop('disabled', false).data('task', dt_data['id']) // add data attribute to button

        // iterate owners
        $('.people-wrapper').empty();
        dt_data['officers'].forEach(person => { 
            let nameTemplate = `<div class="member-profile">${person.first_name.charAt(0)}${person.last_name.charAt(0)}</div>
                <div class="text-sm-height px-2">
                    <p class="font-weight-bold text-dark mb-0">${person.full_name} ${person.user_id == actor ? '(you)' : ''}</p>
                    <small class="text-muted">${person.username}</small>
                </div>`
            let dropdownButton = `<div class="dropdown-ellipsis ml-auto">
                    <button class="btn btn-link text-secondary action-item" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-ellipsis-v"></i></button>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                        <a class="dropdown-item item-remove" href="#" data-person="${person.team_id}">Remove</a>
                    </div>
                </div>`
            if (dt_data['officers'].length > 1) $('.people-wrapper').append(`<div class="d-flex align-items-center py-2 m-0">${nameTemplate} ${person.user_id == actor ? '' : `${dropdownButton}`}</div>`);
            else $('.people-wrapper').append(`<div class="d-flex align-items-center py-2 m-0">${nameTemplate}</div>`);
        });
    });

    // share button
    $('#btn_share').click(function () {
        $(this).prop('disabled', true);  // disable Button 
        let task = $(this).data().task;
        
        axios({
            method: 'PUT',
            url: `/api/tasks/share/${task}/`,
            data: {
                people: $('#select2_people').val(),
            },
            headers: axiosConfig
        }).then(res => {
            todosTbl.ajax.reload();
            toastSuccess('Success'); // alert
            $("#shareModal").modal('toggle'); // close modal
        }).catch(err => {
            toastError(err.response.statusText)
            if (err.response.data.people) {
                $('#select2_people').next().find('.select2-selection').addClass('form-error');
                $('#people-error').html(err.response.data.people.shift())
            } else {
                $('#select2_people').next().find('.select2-selection').removeClass('form-error');
                $('#people-error').html('')
            }
            $('#btn_share').prop('disabled', false); // enable button
        })
    });

    // remove person 
    $('.people-wrapper').on('click', '.item-remove', function () {
        let person = $(this).data().person;
        axios.delete(`/api/tasks/people/${person}/`, { headers: axiosConfig }).then(res => {
            toastSuccess('Success')
        });
    });

    // remove todos task 
    $('#dt_mytasks tbody').on('click', '.btn-remove', function () {
        const dt_data = todosTbl.row($(this).parents('tr')).data();
        Swal.fire({
            title: 'Remove task',
            html: '<p class="m-0">This will remove from the lists.</p>',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Remove',
            confirmButtonColor: '#c44a56',
            reverseButtons: true
        }).then((result) => {
            if (result.value) {
                $(this).prop('disabled', true) // disable button

                axios({
                    method: 'PUT',
                    url: `/api/tasks/remove/${dt_data['id']}/`,
                    headers: axiosConfig
                }).then(res => {
                    todosTbl.ajax.reload();
                    getOpenTasks(null, null, true);
                }).catch(err => {
                    toastError(err.response.statusText)
                });
            }
        });
    });
});