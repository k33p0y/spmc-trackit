// Fullcalendar plugin
$(function() {
    var viewModalEl = new bootstrap.Modal(document.getElementById("modalViewEvent"), {});
    var scheduleModalEl = new bootstrap.Modal(document.getElementById("scheduleModal"), {});
    var draggableEl = document.getElementById('event_lists');
    var draggable = new FullCalendar.Draggable(draggableEl, {
        itemSelector: '.event-card',
        eventData: function(eventEl) {
            return {
                id: eventEl.dataset.event,
                title: eventEl.querySelector('.event-title').innerText,
                backgroundColor: eventEl.dataset.color,
                borderColor: eventEl.dataset.color
            };
        }
    });

    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        views: {
            month: { 
                editable: false
            }
        },
        themeSystem: 'bootstrap',
        editable: true,
        droppable: true, // this allows things to be dropped onto the calendar
        nowIndicator : true,
        lazyFetching : true,
        allDaySlot: false,
        fixedWeekCount: false,
        // slotDuration : '00:15:00', // 15 min interaval
        // slotMinTime: '06:00:00',
        // slotMaxTime: '20:00:00',
        eventMaxStack : '4',
        dayMaxEvents: true,
        // contentHeight: 'auto',
        events: function(info, successCallback, failureCallback) { // fetch events via ajax
            $.ajax({
                url: '/api/events/eventdate/calendar',
                success: function(response) {
                    let events = new Array()
                    response.forEach(event => {
                        events.push({
                            id: event.id,
                            title: event.event.title,
                            start: `${event.date} ${event.time_start}`,
                            end: `${event.date} ${event.time_end}`,
                            color: event.event.highlight,
                            event_id: event.event.id,
                            event_subject: event.event.subject,
                            event_venue: event.venue,
                            event_url: event.address,
                            attendance: event.attendance,
                        })
                    });
                    successCallback(events)
                }
            });
        },
        eventReceive: function(info) { // when external event dropped receive
            if (info.event.allDay) info.revert();
            else {
                const date = moment(info.event.start).format('DD MMMM YYYY');
                const start_time = moment(info.event.start).format('h:mm A');
                const end_time = moment(info.event.start).add(1, "h").format("h:mm A");
                scheduleModalEl.show();
                $(".title-event").text(info.event.title); // venue
                $(".title-datetime").text(`${date} ${start_time} - ${end_time}`); // datetime
                $('#btn_save_schedule').click(function() {  // save modal event
                    let method = 'POST';
                    let url = '/api/events/eventdate/schedule/'; // update request url
                    let eventObj = new Object();
                    eventObj.date = moment(info.event.start).format('YYYY-MM-DD'); // date
                    eventObj.time_start = moment(info.event.start).format('HH:mm'); // time start 24 hr format
                    eventObj.time_end = moment(info.event.start).add(1, "h").format("HH:mm"); // time end 24 hr format
                    eventObj.venue = $('#txt_venue').val(); // venue
                    eventObj.address = $('#txt_link').val(); // link
                    eventObj.event = info.event.id; // event
                    saveEvent(info, eventObj, method, url);
                    info.revert();
                });
                $('#btn_close_schedule').click(function() { info.revert(); }); // close modal
            }
        },
        eventResize: function(info) { // when event dropped resize
            console.log(info.event)
            const date = moment(info.event.start).format('dddd, DD MMMM YYYY');
            const start_time = moment(info.event.start).format('h:mm A');
            const end_time = moment(info.event.end).format('h:mm A');
            const address = (info.event.extendedProps.event_url) ? "<i class='fas fa-xs fa-link text-orange'></i>" : '';
            Swal.fire({
                title: 'Review changes',
                html: `<p class="mb-1"> <b>Event:</b> ${info.event.title}</p>
                    <p class="mb-1"> <b>Date: </b> ${date}</p>
                    <p class="mb-1"> <b>Time:</b> ${start_time} - ${end_time}</p>
                    <p class="mb-1"> <b>Venue:</b> ${info.event.extendedProps.event_venue} ${address}</p> `,
                icon: 'info',
                showCancelButton: true,
                reverseButtons: true,
                confirmButtonText: 'Save',
                cancelButtonText: 'Discard',
                confirmButtonColor: '#f17f32'
            }).then((result) => {
                if (result.isConfirmed) {
                    let method = 'PUT';
                    let url = `/api/events/eventdate/schedule/${parseInt(info.event.id)}/`; // update request url
                    let eventObj = new Object();
                    eventObj.date = moment(info.event.start).format('YYYY-MM-DD'); // date
                    eventObj.time_start = moment(info.event.start).format('HH:mm'); // time start 24 hr format
                    eventObj.time_end = moment(info.event.end).format("HH:mm"); // time end 24 hr format
                    eventObj.venue = info.event.extendedProps.event_venue; // venue
                    eventObj.address = (info.event.extendedProps.event_url) ? info.event.extendedProps.event_url: ''; // link
                    eventObj.event = info.event.extendedProps.event_id; // event
                    saveEvent(info, eventObj, method, url);
                } else info.revert();
            });
        },
        eventDrop: function(info) { // when event dropped dragged
            const date = moment(info.event.start).format('dddd, DD MMMM YYYY');
            const start_time = moment(info.event.start).format('h:mm A');
            const end_time = moment(info.event.end).format('h:mm A');
            const address = (info.event.extendedProps.event_url) ? "<i class='fas fa-xs fa-link text-orange'></i>" : '';
            Swal.fire({
                title: 'Review changes',
                html: `<p class="mb-1"> <b>Event:</b> ${info.event.title}</p>
                    <p class="mb-1"> <b>Date: </b> ${date}</p>
                    <p class="mb-1"> <b>Time:</b> ${start_time} - ${end_time}</p>
                    <p class="mb-1"> <b>Venue:</b> ${info.event.extendedProps.event_venue} ${address}</p> `,
                icon: 'info',
                showCancelButton: true,
                reverseButtons: true,
                confirmButtonText: 'Save',
                confirmButtonColor: '#f17f32',
            }).then((result) => {
                if (result.isConfirmed) {
                    let method = 'PUT'; // update event
                    let url = `/api/events/eventdate/schedule/${parseInt(info.event.id)}/`; // update request url
                    let eventObj = new Object();
                    eventObj.date = moment(info.event.start).format('YYYY-MM-DD'); // date
                    eventObj.time_start = moment(info.event.start).format('HH:mm'); // time start 24 hr format
                    eventObj.time_end = moment(info.event.end).format("HH:mm"); // time end 24 hr format
                    eventObj.venue = info.event.extendedProps.event_venue; // venue
                    eventObj.address = (info.event.extendedProps.event_url) ? info.event.extendedProps.event_url: ''; // link
                    eventObj.event = info.event.extendedProps.event_id; // event
                    saveEvent(info, eventObj, method, url);
                } else info.revert();
            });
        },
        eventClick: function(info) {  // when event is clicked
            let date = moment(info.event.start).format('dddd, DD MMMM YYYY');
            let time_start = moment(info.event.start).format('h:mm A');
            let time_end = moment(info.event.end).format('h:mm A');
            viewModalEl.show();
            document.getElementById('event_title').innerHTML = info.event.title;
            document.getElementById('event_subject').innerHTML = (info.event.extendedProps.event_subject) ? info.event.extendedProps.event_subject : '';
            document.getElementById('event_date').innerHTML = date;
            document.getElementById('event_time').innerHTML = `${time_start} - ${time_end}`;
            document.getElementById('event_venue').innerHTML = (info.event.extendedProps.event_venue);
            document.getElementById('event_link').innerHTML = (info.event.extendedProps.event_url) ? info.event.extendedProps.event_url : '';
            document.getElementById('event_attendance').innerHTML = info.event.extendedProps.attendance;
            document.getElementById('btn_delete').setAttribute('schedule', info.event.id)
        },
    });
    calendar.render();

    // save events fn
    const saveEvent = function(info, eventObj, method, url) {
        axios({
            method: method,
            url: url,
            data: {
                date : eventObj.date,
                time_start : eventObj.time_start,
                time_end : eventObj.time_end,
                venue : eventObj.venue,
                address : eventObj.address,
                event : eventObj.event,
                is_active: true
            },
            headers: axiosConfig,
        }).then(res => { // success
            calendar.refetchEvents();
            scheduleModalEl.hide()
            toastSuccess('Success');
        }).catch(err => { // error
            info.revert();
            toastError(err.response.statusText);
            if (err.response.data.date) showFieldErrors(err.response.data.date, 'date'); else removeFieldErrors('date');
            if (err.response.data.time_start) showFieldErrors(err.response.data.time_start, 'time_start'); else removeFieldErrors('ti   me_start');
            if (err.response.data.time_end) showFieldErrors(err.response.data.time_end, 'time_end'); else removeFieldErrors('time_end');
            if (err.response.data.venue) showFieldErrors(err.response.data.venue, 'venue'); else removeFieldErrors('venue');
            if (err.response.data.address) showFieldErrors(err.response.data.address, 'link'); else removeFieldErrors('link');
        });
    }

    const showFieldErrors = function(obj, field) {
        // error message
        let msg = '';
        obj.forEach(error => {msg += `${error} `});
        $(`#${field}_error`).html(`*${msg} `)

        // Add error class change border color to red
        if (field == 'eventfor') $(`#select2_${field}`).next().find('.select2-selection').addClass('form-error');
        if (field == 'date') $('.info-datetime').addClass('error-info').text(`*${msg} `);
        else $(`#txt_${field}`).addClass('form-error');
    };

    const removeFieldErrors = function(field) {
        // Remove error class for border color
        if (field == 'title') $(`#txt_${field}`).removeClass('form-error');
        if (field == 'preface') $(`#txt_${field}`).removeClass('form-error');
        $(`#${field}_error`).html('');
    };

    // remove event using jQuery
    $('#btn_delete').click(function() { 
       let schedule = $(this).attr('schedule');
       axios({
            method: 'PATCH',
            url: `/api/events/eventdate/partial/${schedule}/`,
            data: {
                is_active : false
            },
            headers: axiosConfig,
        }).then(res => { // success
            calendar.refetchEvents();
            viewModalEl.hide();
            toastSuccess('Success');
        }).catch(err => { // error
            toastError(err.response.statusText);
        });
    });
});

// jquery
$(document).ready(function() {
    // events
    const getEvents = function (page, lookup) {
        let url = (page) ? page : '/api/events/calendar/all/?is_active=True';
        let params = (lookup) ? { search : lookup} : '';

        axios({ // get events 
            method: 'GET',
            url: url,
            params: params
        }).then(response => { // success
            const event_api = response.data;  
            const events = response.data.results;

            if (events.length > 0) {
                $('#events_state, .event-spinner').addClass('d-none'); // hide event state
                $('.event-lists-wrapper').removeClass('d-none'); // show list wrapper
                $('#event_lists').empty(); // empty lists
                events.forEach(event => {
                    $('#event_lists').append( // render template
                        `<div class="card event-card mt-2 mb-1 animate__animated animate__flipInX animate__faster" style="border-left-color:${event.highlight}" data-color="${event.highlight}" data-event="${event.id}">
                            <div class="d-flex flex-row align-items-center event-card-wrap">
                                <div class="d-flex-inline mr-auto">
                                    <p class="event-title">${event.title}</p>
                                    <span class="event-subject">${event.subject}</span>
                                </div>
                                <button type="button" class="btn btn-link btn-link-secondary p-0 ml-2 event-edit" data-event="${event.id}"><i class="fas fa-sm fa-edit"></i></button>
                                <button type="button" class="btn btn-link btn-link-secondary p-0 ml-2 event-drag"><i class="fas fa-grip-vertical"></i></button>
                            </div>
                        </div>`
                    )
                });                
            } else if (lookup && events.length == 0) {
                $('#event_lists').html('<p class="text-center text-muted m-0">No event data found</p>')
            } else {
                $('#events_state').removeClass('d-none'); // show event state
                $('.event-lists-wrapper').addClass('d-none'); // hide list wrapper
            }

            // next page
            if (event_api.next) { // check if there is next page API
                if (event_api.next.includes('socket')){ // check if host == socket
                   let url = event_api.next.replace('socket', window.location.host)
                   $('#page_next').removeClass('disabled').data('pageturn', url) 
                } else $('#page_next').removeClass('disabled').data('pageturn', event_api.next) 
            } else $('#page_next').addClass('disabled');

            // prev page
            if (event_api.previous) { // check if there is next page API
                if (event_api.previous.includes('socket')){ // check if host == socket
                   let url = event_api.previous.replace('socket', window.location.host)
                   $('#page_previous').removeClass('disabled').data('pageturn', url) 
                } else $('#page_previous').removeClass('disabled').data('pageturn', event_api.previous) 
            } else $('#page_previous').addClass('disabled');

        }).catch(error => { // error
            toastError(error.response.statusText);
        });
    }
    getEvents(null, null);

    // change event modal
    $("#event_lists").on('click', '.event-edit', function() {
        let event = $(this).data().event;
        axios.get(`/api/events/all/${event}`).then(res => {
            resetForm() // reset modal
            $("#modalChangeEvent").modal(); // open modal
            
            // populate fields
            $('#color_picker .color-palette').each(function () { // highlight active state 
                if (rgb2hex($(this).css('background-color')) == res.data.highlight || $(this).css('background-color') == res.data.highlight) $(this).addClass('active');
            });
            $('#txt_title').val(res.data.title); // title
            $('#txt_subject').val(res.data.subject); // subject
            $('#select2_eventfor').val(res.data.event_for.id).trigger('change'); // event_for
            $('#chk_status').prop("checked", res.data.is_active); // is_active

            $('#btn_save').data('event', event); // attached data to save button
        });
    });

    // update event
    $('#btn_save').click(function() {
        let event = $(this).data().event; // event data
        $(this).attr('disabled', true) //  disable button
            
        axios({
            method: 'PUT',
            url: `/api/events/event/${event}/`,
            data: {
                title : $('#txt_title').val(),
                subject : $('#txt_subject').val(),
                highlight : $('#color_picker .active').css('background-color'),
                event_for : $('#select2_eventfor').val(),
                is_active :  $('#chk_status').is(':checked'),
                schedule : []
            },
            headers: axiosConfig,
        }).then(function (response) { // success
            $.when(toastSuccess('Success')).then(() => {
                $('#modalChangeEvent').modal('hide');  // hide modals
                $('#btn_save').attr('disabled', false); // enable button
                location.reload();
            }) // alert
        }).catch(function (error) { // error
            toastError(error.response.statusText);
            $("#btn_save").prop('disabled', false); // enable button
            if (error.response.data.title) showFieldErrors(error.response.data.title, 'title'); else removeFieldErrors('title');
            if (error.response.data.event_for) showFieldErrors(error.response.data.event_for, 'eventfor'); else removeFieldErrors('eventfor');
        });
    });

    // pages
    $('#event_pagination li').on('click', function() {
        let page = $(this).data().pageturn;
        getEvents(page)
    });

    $('#select2_eventfor').select2({
        placeholder: 'Select Form'
    })

    $('#color_picker').on('click', '.color-palette', function() {
        $('.color-palette').removeClass('active');
        $(this).addClass('active')
    });
    
    // Search Bar onSearch Event
    $("#search-input").on('search', function () {
        let lookup = $('#search-input').val();
        getEvents(null, lookup)
        return false; // prevent refresh
    });

    // Search Bar keyPress Event
    $('#search-input').keypress(function(event){
        let lookup = $('#search-input').val();
        let keycode = event.keyCode || event.which;
        if (keycode == '13') ; getEvents(null, lookup)
    });

    // Search Bar onClick Event
    $("#execute-search").click(function () {
        let lookup = $('#search-input').val();
        getEvents(null, lookup)
        return false; // prevent refresh
    });

    var rgb2hex = function(bg_color) {
        var rgb = bg_color.replace(/\s/g,'').match(/^rgba?\((\d+),(\d+),(\d+)/i);
        return (rgb && rgb.length === 4) ? "#" +
           ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
           ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
           ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : bg_color;   
    };

    let showFieldErrors = function(obj, field) {
        // Add error class change border color to red
        if (field == 'title') $(`#txt_${field}`).addClass('form-error');
        if (field == 'eventfor') $(`#select2_${field}`).next().find('.select2-selection').addClass('form-error');
        if (field == 'date') $(`.txt-${field}`).addClass('form-error');

        // error message
        let msg = '';
        obj.forEach(error => {msg += `${error} `});
        $(`#${field}_error`).html(`*${msg} `)
    };

    let removeFieldErrors = function(field) {
        // Remove error class for border color
        if (field == 'title') $(`#txt_${field}`).removeClass('form-error');
        if (field == 'preface') $(`#txt_${field}`).removeClass('form-error');
        $(`#${field}_error`).html('');
    };

    var resetForm = function() {
        $('.color-palette').removeClass('active');
        $('#txt_title').val('');
        $('#txt_subject').val('');
        $("#select2_eventfor").val([]).trigger('change');
        $('#chk_status').prop("checked", true);
    }
});