$(document).ready(function () {
    // Select2 Config
    $('#select_form').select2({
        allowClear: true,
        placeholder: 'Select Form',
        // cache: true,
    });

    $('#select_form').on('change', function() {
        let form_id = $($(this), "option:selected").val();

        axios.get(`/api/requests/forms/${form_id}/`, {headers : axiosConfig}).then(response => {
            const form_status = response.data.status;
            const row_boards = $('.row-fluid').empty();
            
            form_status.forEach(status => {
                row_boards.append(
                    `<div class="col col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
                        <div class="card card-boards bg-secondary mb-2">
                            <div class="card-header"> <div class="card-title">${status.name}</div> </div>
                            <div class="card-body card-body-column" data-status-id="${status.id}" id="column_${status.id}"></div>
                        </div>
                    </div>`
                );
                    
                axios.get(`/api/requests/lists/`, { 
                    params : {status:status.id, form:form_id}, 
                    headers : axiosConfig 
                }).then (response => {
                    const tickets = response.data
                    const card_body = $(`#column_${status.id}`);

                    tickets.forEach(tic => {
                        let fname_char = tic.requested_by.first_name.charAt(0)
                        let lname_char = tic.requested_by.last_name.charAt(0)
                        let name_repr =  fname_char.concat(lname_char)

                        card_body.append(
                            `<div class="list-item" data-ticket-id="${tic.ticket_id}">
                                <div class="list-item-body">
                                    <p><b>#${tic.ticket_no}</b> - ${tic.category.name} </p>  
                                </div>
                                <div class="list-item-footer">
                                    <div class="members ml-auto">${name_repr}</div>
                                </div>
                            </div>`
                        ); 
                    });
                }).then(response => {
                    $('.card-body-column').sortable({
                        connectWith: ".card-body-column",
                        start: function (event, ui) {
                            ui.item.addClass('tilt')
                            ui.placeholder.height(ui.item.height());
                            ui.placeholder.css('visibility', 'visible');
                            ui.placeholder.css('background-color', '#d9dce6');
                            ui.placeholder.css('box-shadow', 'none');
                        },
                        stop: function (event, ui) {
                            ui.item.removeClass('tilt');
                        },
                        receive: function( event, ui ) {
                            let ticket = ui.item.data().ticketId;
                            let status = ui.item.parent().data().statusId;

                            updateStatus(ticket, status);
                        }
                    });

                    $('.card-body-column').disableSelection();
                });
            });            
        });
    });
});

function updateStatus(ticket, status) {

    axios({
        url: `/api/requests/lists/${ticket}/`,
        method: "PATCH",
        data: {status: status},
        headers: axiosConfig,
    }).then(response => {
        console.log(response)
        Toast.fire({
            icon: 'success',
            title: 'Status Updated',
        });
    })
}