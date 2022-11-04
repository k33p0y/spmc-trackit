$(document).ready(function () {
    $('#select2_eventfor').select2({
        placeholder: 'Select Form'
    });

    // highlight active state 
    $('#color_picker .color-palette').each(function () {
        if ($(this).css('background-color') == $('#color_picker').data().highlight) {
            $(this).addClass('active')
        }
    });
    
    // color picker
    $('#color_picker').on('click', '.color-palette', function() {
        $('.color-palette').removeClass('active');
        $(this).addClass('active')
    });

    // add row
    $('#btn_add').click(function () {
        $('.form-wrapper').append(`<div class="form-row">
            <div class="form-group col-2">
                <input type="date" class="form-control form-control-sm txt-date"/>
                <small class="error-info date-error"></small>
            </div>
            <div class="form-group col-2">
                <input type="time" class="form-control form-control-sm txt-start"/>
                <small class="error-info start-error"></small>
            </div>
            <div class="form-group col-2">
                <input type="time" class="form-control form-control-sm txt-end"/>
                <small class="error-info end-error"></small>
            </div>
            <div class="form-group col">
                <input type="text" class="form-control form-control-sm txt-venue" placeholder="Enter venue"/>\
                <small class="error-info venue-error"></small>
            </div>
            <div class="form-group col">
                <input type="text" class="form-control form-control-sm txt-link" placeholder="Enter link"/>
                <small class="error-info link-error"></small>
            </div>
            <div class="form-group col-1">
            <button type="button" class="btn btn-sm btn-block btn-remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>`)
    });

    // remove row
    $('.form-wrapper').on('click', '.btn-remove', function () {
        $(this).parents("div.form-row").remove()
    });

    $('#btn_save').click(function (e) {
        e.preventDefault();
        $(this).attr('disabled', true) //  disable button
            
        axios({
            method: 'PUT',
            url: `/api/events/event/${$(this).data().eventId}/`,
            data: {
                title : $('#txt_title').val(),
                subject : $('#txt_subject').val(),
                highlight : $('#color_picker .active').css('background-color'),
                event_for : $('#select2_eventfor').val(),
                is_active :  $('#chk_status').is(':checked'),
                schedule : getSchedule()
            },
            headers: axiosConfig,
        }).then(response => { // success
            $.when(toastSuccess('Success')).then(() => {
                $(location).attr('href', `/events/event/${response.data.id}/view`)
                $('#btn_save').attr('disabled', false) // enable button
            }) // alert
        }).catch(error => { // error
            toastError(error.response.statusText);
            $("#btn_save").prop('disabled', false); // enable button
            if (error.response.data.title) showFieldErrors(error.response.data.title, 'title'); else removeFieldErrors('title');
            if (error.response.data.event_for) showFieldErrors(error.response.data.event_for, 'eventfor'); else removeFieldErrors('eventfor');
            if (error.response.data.dates) {
                error.response.data.dates.forEach((error, i) => {
                    let form_row = $('.form-wrapper div.form-row')[i];
                    if (error.date) showDatesFieldErrors(error.date, form_row, 'date'); else removeDatesFieldErrors(form_row, 'date');
                    if (error.time_start) showDatesFieldErrors(error.time_start, form_row, 'start'); else removeDatesFieldErrors(form_row, 'start');
                    if (error.time_end) showDatesFieldErrors(error.time_end, form_row, 'end'); else removeDatesFieldErrors(form_row, 'end');
                    if (error.venue) showDatesFieldErrors(error.venue, form_row, 'venue'); else removeDatesFieldErrors(form_row, 'venue');
                    if (error.link) showDatesFieldErrors(error.link, form_row, 'link'); else removeDatesFieldErrors(form_row, 'link');
                });
            };
        });
    });

    let getSchedule = function() {
        let schedules = new Array()
        let form_row = $('.form-wrapper div.form-row')
        
        form_row.each(function () {
            const id = $(this).data().eventId;
            const date = $(this).find('div.form-group input.txt-date');
            const time_start = $(this).find('div.form-group input.txt-start');
            const time_end = $(this).find('div.form-group input.txt-end');
            const venue = $(this).find('div.form-group input.txt-venue');
            const link = $(this).find('div.form-group input.txt-link');
            const is_active = $(this).find('div.form-group input.chk-status');

            schedules.push({
                'id' : (id) ? id : null,
                'date': date.val(),
                'time_start': time_start.val(),
                'time_end' : time_end.val(),
                'venue' : venue.val(),
                'link' : link.val(),
                'is_active' : is_active.is(':checked'),
            });
        });
        return schedules
    }

    let showFieldErrors = function(obj, field) {
        // Add error class change border color to red
        if (field == 'eventfor') $(`#select2_${field}`).next().find('.select2-selection').addClass('form-error');
        else $(`#txt_${field}`).addClass('form-error')
        // error message
        let msg = '';
        obj.forEach(error => {msg += `${error} `});
        $(`#${field}_error`).html(`*${msg} `)
    };
    let removeFieldErrors = function(field) {
        // Remove error class for border color
        if (field == 'eventfor') $(`#select2_${field}`).next().find('.select2-selection').removeClass('form-error');
        else $(`#txt_${field}`).removeClass('form-error');
        $(`#${field}_error`).html('');
    };
    let showDatesFieldErrors = function(obj, row, field) {
        $(row).find(`div.form-group input.txt-${field}`).addClass('form-error');
        $(row).find(`div.form-group small.${field}-error`).html(obj);
    };
    let removeDatesFieldErrors = function(row, field) {
        $(row).find(`div.form-group input.txt-${field}`).removeClass('form-error');
        $(row).find(`div.form-group small.${field}-error`).html('');
    };
});