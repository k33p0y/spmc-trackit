$(document).ready(function () {
    const getOpenTasks = function (page, filters, refresh) {
        let url = (page) ? page : '/api/tasks/open/';
        let params = (filters) ? filters : '';
    
        axios({
            method: 'GET',
            url: url,
            params: params
        }).then(response => {
            const tasks_api_next = response.data.next;
            const tasks = response.data.results;
            $('#load_more').addClass('d-none');
            $('#otask_count').text(response.data.count)
            
            if (tasks_api_next) { // check if there is next page to comment list API
                $('#load_more').removeClass(' d-none').prop('disabled', false);
                if (tasks_api_next.includes('socket')) { // check if host == socket
                    let nextpage = tasks_api_next.replace('socket', window.location.host) // change socket host to window.location.host
                    $('#tasks_nextpage_url').val(nextpage);
                } else $('#tasks_nextpage_url').val(tasks_api_next);
            } else $('#tasks_nextpage_url').val(null);
    
            if (tasks.length > 0) {
                if (refresh) $('#opentask_lists').empty();
                // $('#opentask_lists').empty();
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
                $('#button-text').html('Load more');
            } else if (filters && tasks.length == 0) {
                $('#opentask_lists').html('<p class="text-center text-muted m-0">No event data found</p>')
            } else {
                $('#opentasks_state').removeClass('d-none'); // show elements
                $('.task-wrapper').addClass('d-none'); // hide elements
            }
        }).catch(error => { // error
            toastError(error.response.statusText);
        });
    };
    getOpenTasks(null, null, false);

    // get more open tasks on scroll
    $('#load_more').click(function () {
        if ($('#tasks_nextpage_url').val()) {
            $('#button-text').html($('.tasks-spinner').html());
            setTimeout(function () { getOpenTasks($('#tasks_nextpage_url').val()) }, 400);
        };
    });

    const taskDetail = function(dt_data) {
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
        (dt_data['date_created']) ? $('#task_created').html(moment(dt_data['date_created']).format('DD MMMM YYYY h:mm:ss a')) : '';
        (dt_data['date_completed']) ? $('#task_complete').html(moment(dt_data['date_completed']).format('DD MMMM YYYY h:mm:ss a')) : '';
        $("#task_ticket_link").attr("href", `/requests/${dt_data['ticket'].ticket_id}/view`)
    };
  
    // get ticket number in localStorage if available
    if (localStorage.getItem('task-id')){
        localStorage.removeItem('task-id');
    }
    // set notification instance to unread = False
    if (localStorage.getItem('notification-id')){
        axios.delete(`/api/user/notifications/${localStorage.getItem('notification-id')}/`, {headers: axiosConfig})
        localStorage.removeItem('notification-id');
    }
    
    // Check if user has already done or skip walkthrough
    axios.get('/api/config/tour/').then(res => { // response
        const response = res.data.results;
        let request = new Object();
        // if has response and is_explore value is false; call walkthrough fn with PUT method and url
        // if empty response; call walkthrough fn with POST method to create instance  
        if (response.length > 0 && !response[0].is_explore_task) {
            request.method = 'PUT';
            request.url = `/api/config/tour/${response[0].id}/`;
            exploreTask(request);
        }
        else if (response.length == 0) {
            request.method = 'POST';
            request.url = `/api/config/tour/`;
            exploreTask(request);
        }
    }).catch(err => { // error
        toastError(err.response.statusText) // alert
    });

    // RETRIEVE / GET
    let searchInput = function() { return $('#search_input_task').val(); }
    let statusFilter = function() { return $('#status-filter').val(); }
    let dateFromFilter = function() { return $('#date-from-filter').val(); }
    let dateToFilter = function() { return $('#date-to-filter').val(); }

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
            data: {
                "search": searchInput,
                "task_type": statusFilter,
                "date_from": dateFromFilter,
                "date_to": dateToFilter,
            },
        },
        "columns": [
            {
                data: "ticket",
                render: function (data, type, row) {
                    let description = (row.ticket.description.length >= 50) ? `${row.ticket.description.substr(0, 50)}...` : row.ticket.description;
                    let template = `<div class="d-flex align-items-center">
                            <div class="mr-auto">
                                <a href='/requests/${row.ticket.ticket_id}/view' class='btn-link-orange action-link btn_view'> ${row.ticket.ticket_no} </a>
                                <p class="font-weight-bold m-0" data-toggle="tooltip" data-placement="top" title="${row.ticket.description}">${description}</p>
                                <span class="badge badge-pill text-light" style="background-color:${row.ticket.request_form.color}!important">${row.ticket.request_form.prefix}</span>
                                <span class="badge badge-light2 badge-pill">${row.ticket.reference_no}</span>
                            </div>
                        </div>`;
                    if (type == 'display') data = template
                    return data
                },
                width: "50%"
            }, // ticket
            {
                data: "task_type.status.name",
                render: function (data, type, row) {
                    if (type == 'display') data = row.task_type.status.name
                    return data
                },
                width: "20%"
            }, // type
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
                // width: "10%"
                // orderable: false,
            }, // officers
            {
                data: "date_created",
                render: function (data, type, row) {
                    if (type == 'display') {
                        var date = moment(row.date_created).format('DD MMMM YYYY');
                        var time = moment(row.date_created).format('h:mm:ss a');
                        data = `<p class="title mb-0">${date}</p><span class="sub-title">${time}</span>`
                    }
                    return data
                },
            }, // date_created
            {
                data: null,
                render: function (data, type, row) {
                    let share_btn = (row.task_type.officers_len > 1) ? `<button class="action-item text-secondary btn-share" data-toggle="tooltip" data-placement="top" title='Share "${row.ticket.ticket_no}"'><i class="fas fa-lg fa-user-plus"></i></button>` : '' ;
                    let trash_btn = `<button class="action-item text-secondary btn-remove" data-toggle="tooltip" data-placement="top" title="Remove"><i class="fas fa-lg fa-trash-alt"></i></button>`;
                    let template = `<div class="d-flex align-items-center justify-content-end actions">
                        <button class="action-item d-flex align-items-center text-secondary btn-view" type="button" data-toggle="tooltip" data-placement="top" title="Details">
                            <span class="fa-stack" style="font-size: 8px">
                                <i class="far fa-circle fa-stack-2x"></i>
                                <i class="fas fa-info fa-stack-1x"></i>
                            </span>
                        </button>
                        ${(row.task_type.is_client_step || row.task_type.is_head_step) ? '' : share_btn}
                        ${row.task_type.officers_len > 1 ? trash_btn : ''}
                    </div>`
                    return data = template
                },
                orderable: false
            } // dropdown
        ],
        "order": [[ 3, "desc" ]],
    }); // table end
    
    let completeTbl = $('#dt_completed').DataTable({
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
            url: '/api/tasks/list/completed/?format=datatables',
            type: "GET",
            data: {
                "search": searchInput,
                "task_type": statusFilter,
                "date_from": dateFromFilter,
                "date_to": dateToFilter,
            }
        },
        "columns": [
            {
                data: "ticket",
                render: function (data, type, row) {
                    let description = (row.ticket.description.length >= 60) ? `${row.ticket.description.substr(0, 60)}...` : row.ticket.description;
                    let template = `<a href='/requests/${row.ticket.ticket_id}/view' class='btn-link-orange action-link btn_view'> ${row.ticket.ticket_no} </a>
                        <p class="font-weight-bold m-0" data-toggle="tooltip" data-placement="top" title="${row.ticket.description}">${description}</p>
                        <span class="badge badge-pill text-light" style="background-color:${row.ticket.request_form.color}!important">${row.ticket.request_form.prefix}</span>
                        <span class="badge badge-light2 badge-pill">${row.ticket.reference_no}</span>`;
                    if (type == 'display') data = template
                    return data
                },
                width: "60%"
            }, // tikcket
            {
                data: "task_type.status.name",
                render: function (data, type, row) {
                    if (type == 'display') data = row.task_type.status.name
                    return data
                },
                width: "20%"
            }, // type
            {
                data: "date_completed",
                render: function (data, type, row) {
                    let date = moment(row.date_created).format('DD MMMM YYYY');
                    let time = moment(row.date_created).format('h:mm:ss a');
                    if (type == 'display') data = `<p class="title mb-0">${date}</p><span class="sub-title">${time}</span>`
                    return data
                },
            }, // date_completed
            {
                data: null,
                render: function (data, type, row) {
                    let template = `<div class="d-flex align-items-center justify-content-end actions">
                            <button class="action-item d-flex align-items-center text-secondary btn-view" type="button" data-toggle="tooltip" data-placement="top" title="Details">
                                <span class="fa-stack" style="font-size: 8px">
                                    <i class="far fa-circle fa-stack-2x"></i>
                                    <i class="fas fa-info fa-stack-1x"></i>
                                </span>
                            </button>
                        </div>`
                    return data = template
                },
                orderable: false
            } // dropdown
        ],
        "order": [[ 2, "desc" ]],
    }); // table end


    // pill tab shown event.
    $('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
        switch(e.target.id) {
            case "pills-todo-tab":
                $('#search_input_task').val("");
                $('#form-filter').trigger("reset");
                $('#form-filter select').trigger("change");
                todosTbl.ajax.reload();
                break;
            case "pills-complete-tab":
                $('#search_input_task').val("");
                $('#form-filter').trigger("reset");
                $('#form-filter select').trigger("change");
                completeTbl.ajax.reload();
                break;
        }
    });
        
    //  // // // // // // // // // // // // // // // SEARCHING AND FILTERING EVENTS 
    $('.select-filter').select2(); // select2 config

    // // // // // // // // // // // // // // // //  OPEN TASK SEARCH BAR
    // onClick Event
    $("#execute_search_opentask").click(function () {
        let lookup = $('#search_input_opentask').val();
        getOpenTasks(null, {search: lookup}, true)
        return false; // prevent refresh
    });
    // onSearch Event
    $("#search_input_opentask").on('search', function () {
        let lookup = $('#search_input_opentask').val();
        getOpenTasks(null, {search: lookup}, true)
        return false; // prevent refresh
    });
    // keyPress Event
    $('#search_input_opentask').keypress(function (event) {
        let lookup = $('#search_input_opentask').val();
        let keycode = event.keyCode || event.which;
        if (keycode == '13') getOpenTasks(null, {search: lookup}, true)
    });
    // apply filter
    $("#btn_apply_ofilter").click(function () {
        let status = $("#status-ofilter").val()
        getOpenTasks(null, {task_type: status}, true)
        return false; // prevent refresh
    });
    // clear filter
    $("#btn_clear_ofilter").click(function () {
        $('#form-ofilter').trigger("reset");
        $('#form-ofilter select').trigger("change");
        getOpenTasks(null, null, true)
        return false; // prevent refresh
    });
    // close Dropdown 
    $('#close_dropdown_ofilter').click(function (){ toggleFilter() });

    // // // // // // // // // // // // // // // //  TASK SEARCH BAR                          
    // onClick Event
     $("#execute_search_task").click(function () {
        if ($("#pills-todo-tab").hasClass('active')) todosTbl.ajax.reload();
        else if ($("#pills-complete-tab").hasClass('active')) completeTbl.ajax.reload();  
        return false; // prevent refresh
    });
    // onSearch Event
    $("#search_input_task").on('search', function () {
        if ($("#pills-todo-tab").hasClass('active')) todosTbl.ajax.reload();
        else if ($("#pills-complete-tab").hasClass('active')) completeTbl.ajax.reload();  
        return false; // prevent refresh
    });
    // keyPress Event
    $('#search_input_task').keypress(function(event){
        let keycode = event.keyCode || event.which;
        if (keycode == '13') {
            if ($("#pills-todo-tab").hasClass('active')) todosTbl.ajax.reload();
            else if ($("#pills-complete-tab").hasClass('active')) completeTbl.ajax.reload();  
        }
    });

    // // // // // // // // // // // // // // // //  DROPDOWN FILTERS    
    // apply filter
    $("#btn_apply").click(function () {
        if ($("#pills-todo-tab").hasClass('active')) todosTbl.ajax.reload();
        else if ($("#pills-complete-tab").hasClass('active')) completeTbl.ajax.reload();  
        return false; // prevent refresh
    });
    // clear filter
    $("#btn_clear").click(function () {
        $('#form-filter').trigger("reset");
        $('#form-filter select').trigger("change");

        if ($("#pills-todo-tab").hasClass('active')) todosTbl.ajax.reload();
        else if ($("#pills-complete-tab").hasClass('active')) completeTbl.ajax.reload();  
        return false; // prevent refresh
    });
    // close Dropdown 
    $('#close_dropdown').click(function (){ toggleFilter() });
    // prevent dropdown from closing
    $('.dropdown-filter').on('hide.bs.dropdown', function (e) {
        if (e.clickEvent) e.preventDefault();      
    });
    // close dropdown when click outside 
    $(document).on('click', function (e) { toggleFilter() });

    // Events
    // get/own open tasks
    $('#opentask_lists').on('click', '.get-task', function () {
        let opentask_id = $(this).data().taskId;

        axios({
            method: 'PUT',
            url: `/api/tasks/open/${opentask_id}/`,
            headers: axiosConfig
        }).then(results => {
            socket_notification.send(JSON.stringify({ type: 'task_notification', data: { object_id: results.data.task_type.id, notification_type: 'action' } }))
            todosTbl.ajax.reload();
            getOpenTasks(null, null, true);
        }).catch(error => {
            toastError(error.response.statusText)
        })
    });

    // detail task
    $('#dt_mytasks tbody').on('click', '.btn-view', function () {
        const dt_data = todosTbl.row($(this).parents('tr')).data();
        taskDetail(dt_data)
    });

    $('#dt_completed tbody').on('click', '.btn-view', function () {
        const dt_data = completeTbl.row($(this).parents('tr')).data();
        taskDetail(dt_data)
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
        let people = $('#select2_people').val()
        axios({
            method: 'PUT',
            url: `/api/tasks/share/${task}/`,
            data: {
                people: people,
            },
            headers: axiosConfig
        }).then(res => {
            socket_notification.send(JSON.stringify({ type: 'task_notification', data: { object_id: people, notification_type: 'task_share' } }))
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
        });
    });

    // remove person 
    $('.people-wrapper').on('click', '.item-remove', function () {
        let person = $(this).data().person;
        axios.delete(`/api/tasks/people/${person}/`, { headers: axiosConfig }).then(res => {
            socket_notification.send(JSON.stringify({ type: 'task_notification', data: { object_id: person, notification_type: 'task_remove' } }))
            todosTbl.ajax.reload()
            toastSuccess('Success');
            $("#shareModal").modal('toggle'); // close modal
        });
    });

    // remove todos task 
    $('#dt_mytasks tbody').on('click', '.btn-remove', function () {
        const dt_data = todosTbl.row($(this).parents('tr')).data();
        let req_url = (dt_data.officers.length > 1) ? `/api/tasks/people/${dt_data.logged_in_officer}/` : `/api/tasks/remove/${dt_data.id}/`;
        let req_method = (dt_data.officers.length > 1) ? 'DELETE' : 'PUT';
        let msg1 = 'This removes you from the lists and prevents you from taking action on the request module.';
        let msg2 = 'By doing this, it will be dropped from the lists and added back to the open tasks.';
        
        Swal.fire({
            title: 'Are You sure?',
            html: `<p class="m-0">${dt_data.officers.length > 1 ? msg1 : msg2}</p>`,
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
                    method: req_method,
                    url: req_url,
                    headers: axiosConfig
                }).then(res => {
                    (res.config.method == 'put') ? getOpenTasks(null, null, true) : '';
                    todosTbl.ajax.reload();
                    toastSuccess('Success');
                }).catch(err => {
                    toastError(err.response.statusText)
                });
            }
        });
    });

    // walkthrough click event
    $('.tour-me').click(function() {
        exploreTask();
    });
});