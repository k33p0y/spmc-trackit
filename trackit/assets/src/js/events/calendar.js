// Fullcalendar plugin
document.addEventListener('DOMContentLoaded', function() {
    var draggableEl = document.getElementById('event_lists');
    var draggable = new FullCalendar.Draggable(draggableEl, {
        itemSelector: '.event-card',
        eventData: function(eventEl) {
        return {
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
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          },
          editable: true,
          droppable: true, // this allows things to be dropped onto the calendar
    });
    calendar.render();
});

// jquery
$(document).ready(function() {
    // events
    const getEvents = function (page, lookup) {
        let url = (page) ? page : '/api/events/all';
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
                    $('#event_lists').append(
                        `<div class="card event-card mt-2 mb-1" style="border-left-color:${event.highlight}" data-color="${event.highlight}">
                            <div class="d-flex flex-row align-items-center">
                                <div class="d-flex-inline mr-auto">
                                    <p class="event-title">${event.title}</p>
                                    <span class="event-subject">${event.subject}</span>
                                </div>
                                <button class="btn btn-link btn-link-orange p-0 ml-2" id="event_edit"><i class="fas fa-sm fa-edit"></i></button>
                                <button class="btn btn-link btn-link-orange p-0 ml-2" id="event_drag"><i class="fas fa-grip-vertical"></i></button>
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

            (event_api.next) ? $('#page_next').removeClass('disabled').data('pageturn', event_api.next) : $('#page_next').addClass('disabled');
            (event_api.previous) ? $('#page_previous').removeClass('disabled').data('pageturn', event_api.previous) : $('#page_previous').addClass('disabled');

        }).catch(error => { // error
            console.log(error);
        });
    }
    getEvents(null, null);
    
    $('#event_pagination li').on('click', function() {
        let page = $(this).data().pageturn;
        getEvents(page)
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
});