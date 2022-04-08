$(document).ready(function () {
    $('#select2_eventfor').select2({
        placeholder: 'Select Form'
    })
    
    $('#color_picker').on('click', '.color-palette', function() {
        $('.color-palette').removeClass('active');
        $(this).addClass('active')
    });

    // add row
    $('#btn_add').click(function () {
        $('.form-wrapper').append(`<div class="form-row">
            <div class="form-group col">
                <input type="date" class="form-control form-control-sm txt-date"/>
                <small class="error-info date-error"></small>
            </div>
            <div class="form-group col">
                <input type="time" class="form-control form-control-sm txt-start"/>
                <small class="error-info start-error"></small>
            </div>
            <div class="form-group col">
                <input type="time" class="form-control form-control-sm txt-end"/>
                <small class="error-info end-error"></small>
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

        getSchedule()
        
        axios({
            method: 'POST',
            url: '/api/events/event/',
            data: {
                title : $('#txt_title').val(),
                subject : $('#txt_subject').val(),
                highlight : $('#color_picker .active').css('background-color'),
                event_for : $('#select2_eventfor').val(),
                schedule : getSchedule()
            },
            headers: axiosConfig,
        }).then(function (response) { // success
            $.when(toastSuccess('Success')).then(() => {
                $(location).attr('href', '/events/lists')
                $('#btn_save').attr('disabled', false) // enable button
            }) // alert
        }).catch(function (error) { // error
            toastError(error.response.statusText);
            $("#btn_save").prop('disabled', false); // enable button
            if (error.response.data.title) showFieldErrors(error.response.data.title, 'title'); else removeFieldErrors('title');
            if (error.response.data.event_for) showFieldErrors(error.response.data.event_for, 'eventfor'); else removeFieldErrors('eventfor');
        });
    });

    let getSchedule = function() {
        let schedules = new Array()
        let form_row = $('.form-wrapper div.form-row')
        
        form_row.each(function () {
            const date = $(this).find('div.form-group input.txt-date');
            const time_start = $(this).find('div.form-group input.txt-start');
            const time_end = $(this).find('div.form-group input.txt-end');

            // validate empty date
            if (!date.val()) {
                date.addClass('form-error') 
                $(this).find('div.form-group small.date-error').html('*This field may not be blank.')          
            } else {
                date.removeClass('form-error') 
                $(this).find('div.form-group small.date-error').html('')
            }

            // validate empty time start
            if (!time_start.val()) {
                time_start.addClass('form-error') 
                $(this).find('div.form-group small.start-error').html('*This field may not be blank.')          
            }  else {
                time_start.removeClass('form-error') 
                $(this).find('div.form-group small.start-error').html('')
            }

            // validate empty time end
            if (!time_end.val()) {
                time_end.addClass('form-error') 
                $(this).find('div.form-group small.end-error').html('*This field may not be blank.')          
            } else {
                time_end.removeClass('form-error') 
                $(this).find('div.form-group small.end-error').html('')
            }

            if (date.val() && time_start.val() && time_end.val()) {
                schedules.push({
                    'date': date.val(),
                    'time_start': time_start.val() + ':00',
                    'time_end' : time_end.val() + ':00',
                });
            }
           
        });
        return schedules
    }

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
});