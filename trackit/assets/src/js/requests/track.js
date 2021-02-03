$(document).ready(function () {

    var getTrackingNum = function() {
        // get ticket number in localStorage if available
        if (localStorage.getItem('ticketNumber')){
            $('#txt_tracking_num').val(localStorage.getItem('ticketNumber'))
            localStorage.removeItem('ticketNumber');
        }

        // set notification instance to unread = False
        if (localStorage.getItem('notification-id')){
            axios.put(`/api/user/notifications/${localStorage.getItem('notification-id')}/`, {unread: false}, {headers: axiosConfig})
            localStorage.removeItem('notification-id');
        }

        let tracking_num = $('#txt_tracking_num').val();
        if (!tracking_num) tracking_num = "None";
        return tracking_num
    }

    // RETRIEVE / GET
    // List Table
    let table = $('#dt_tracking').DataTable({
        "searching": false,
        "responsive": true,
        "lengthChange": false,
        "autoWidth": false,
        "serverside": true,
        "processing": true,
        "pageLength": 25,
        "ajax": {
            url: `/api/ticket/logs/?format=datatables`,
            type: "GET",
            data: {
                "tracking_num": getTrackingNum,
            },
            dataSrc: function (json) {
                return json.data.filter(function (item) {
                    return (item.event_type === "Create") || (item.event_type === "Update" && item.changed_fields.status);
                });
            }
        },
        "columns": [
            { 
                data: null,
                render: function (data, type, row) {
                    if (type == 'display') {
                        var date = moment(row.datetime).format('DD MMMM YYYY');
                        data = `<p class="title mb-1">${date}</p>`
                    }
                    return data
                },
            }, // DATE
            {
                data: null,
                render: function (data, type, row) {
                    if (type == 'display') {
                        var time = moment(row.datetime).format('h:mm:ss a');
                        data = `<p class="title mb-1">${time}</p>`
                    }
                    return data
                },
            }, // TIME
            {
                data: "event_type",
                render: function (data, type, row) {
                    if (type == 'display') {
                        if (row.event_type === "Create") {
                            data = `${row.event_type}`
                        } else if (row.event_type === "Update") {
                            data = `${row.changed_fields.status[0]}` // index 0 for the current status, 1 for the previous status
                        }
                    }
                    return data
                },
            }, // STATUS
            { 
                data: "user",
                render: function (data, type, row) {
                    if (type == 'display') {
                        data = `${row.user.first_name} ${row.user.last_name}`
                    }
                    return data
                },
            }, // USER
        ],
    });

    // reload datatable on enter keypress
    $('#txt_tracking_num').on("keypress", function(e) {
        if (e.keyCode == 13) {
            table.ajax.reload();
            getComments();
            return false; // prevent refresh
        }
    });
    // reload datatable on search clear
    $("#txt_tracking_num").on("search", function(evt){
        if(!$(this).val().length > 0){
            table.ajax.reload();
        }
    });

    // get ticket number comments
    let getComments = function(e){
        if ($('#txt_tracking_num').val()){
            axios({
                method: 'GET',
                url: '/api/requests/comments/',
                params: {
                    ticket_no : getTrackingNum(),
                },
                headers: axiosConfig,
            }).then(function (response) { // success
                $('.comment-section').empty();
                let comments_array = response.data.results
                for (i=0; i<comments_array.length; i++){
                    let fullname = `${comments_array[i].user.first_name} ${comments_array[i].user.last_name}`
                    let comment = `${comments_array[i].content}`
                    let date_created = `${moment(comments_array[i].date_created).format('DD MM YYYY hh:mm a')}`
                    
                    $('.comment-section').append(
                        `<div class="bg-white p-1 user-comment">
                            <div class="d-flex flex-column justify-content-start">
                                <span class="d-block font-weight-bold name">${fullname}</span>
                                <span class="text-muted text-xs">${date_created}</span>
                            </div>
                            <div class="mt-2">
                                <p class="comment-text">${comment}</p>
                            </div>
                        </div>`
                    )
                }
            }).catch(function (error) { // error
                console.log(error)
                Toast.fire({
                    icon: 'error',
                    title: 'Error in loading comments.',
                });
            });
        }
    };

    getComments();
});
