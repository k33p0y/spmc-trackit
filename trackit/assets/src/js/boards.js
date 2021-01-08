$(document).ready(function () {
    // Select2 Config
    $('#select_form').select2({
        allowClear: true,
        placeholder: 'Select Form',
        // cache: true,
    });

    $('#select_form').on('change', function() {
        let form_id = $($(this), "option:selected").val();
        let draggedItem = null;

        axios.get(`/api/requests/forms/${form_id}/`, {headers : axiosConfig}).then(response => {
            const form_status = response.data.status;
            const row_boards = $('.row-fluid').empty();
            
            form_status.forEach(status => {
                row_boards.append(
                    `<div class="col col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
                        <div class="card card-boards bg-secondary mb-2">
                            <div class="card-header"> <div class="card-title">${status.name}</div> </div>
                            <div class="card-body card-body-${status.id} list"></div>
                            <div class="card-footer"></div>
                        </div>
                    </div>`
                );
                    
                axios.get(`/api/requests/lists/`, { 
                    params : {status:status.id, form:form_id}, 
                    headers : axiosConfig 
                }).then (response => {
                    const tickets = response.data
                    const card_body = $(`.card-body-${status.id}`);

                    tickets.forEach(tic => {
                        let fname_char = tic.requested_by.first_name.charAt(0)
                        let lname_char = tic.requested_by.last_name.charAt(0)
                        let name_repr =  fname_char.concat(lname_char)

                        card_body.append(
                            `<div class="list-item" draggable="true">
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
                    // Draggables
                    const list_items = $('.list-item');
                    const lists = $('.list');

                    list_items.each(function (index, element) {
                        const item = list_items[index];

                        $(item).on('dragstart', function () {
                            draggedItem = item;
                            setTimeout(function () { 
                                item.style.display = 'none';
                            }, 0)
                        });

                        $(item).on('dragend', function () {
                            setTimeout(function () {
                                draggedItem.style.display = 'block';
                                draggedItem = null;
                            }, 0);
                        });
                    })

                    lists.each(function (index, element) {
                        const list = lists[index];

                        $(list).on('dragover', function (e) {
                            e.preventDefault();
                        });

                        $(list).on('dragenter', function (e) {
                            e.preventDefault();
                            this.style.backgroundColor = '#d8d9e1';
                        });

                        $(list).on('dragleave', function (e) {
                            this.style.backgroundColor = '#e3E5ED';
                        });

                        $(list).on('drop', function (e) {
                            this.append(draggedItem);
                            this.style.backgroundColor = '#e3E5ED';
                        });
                    })
                });
            });            
        });
    });
});  