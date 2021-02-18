$(document).ready(function () {
   // Select2 Action Steps
   $('#dd_steps').select2();

   // On Change Event Select 2
   var step;
   $('#dd_steps').on('change', function () { 
       step = $("#dd_steps option:selected").val();
   });    
   
   // Accept action 
   $('.btn-accept').click(function (e) {
       e.preventDefault();
       let ticket_id = $(this).data().ticketId;
       var next_step = $("#dd_steps option:selected").next().val()
       let status = (typeof step === "undefined") ? next_step : step;

       let remark = $('#txtarea-comment').val();
       let is_approve = ($(this).data().approve) ? true : '';
       let is_pass = ($(this).data().pass) ? true : '';

        postAction(ticket_id, status, remark, is_approve, is_pass);
   });

   // Refuse action
   $('.btn-refuse').click(function (e) {
       e.preventDefault();
       let ticket_id = $(this).data().ticketId;
       let prev_step = $("#dd_steps option:selected").prev().val();  
       let status = (typeof step === "undefined") ? prev_step : step;

       let remark = $('#txtarea-comment').val();
       let is_approve = ($(this).data().approve == false) ? false : '';
       let is_pass = ($(this).data().pass == false) ? false : '';

       Swal.fire({
            title: 'Are you sure?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'OK',
            confirmButtonColor: '#17a2b8',
        }).then((result) => {
            if (result.value) {
                postAction(ticket_id, status, remark, is_approve, is_pass);
            }
        })
   });

    // Post Action
    const postAction = function(ticket, status, remark, is_approve, is_pass) {
        axios({
            url:`/api/requests/lists/${ticket}/`,
            method: "PATCH",
            data: {status: status},
            headers: axiosConfig,
        }).then(function (response) { // success
            let data = new Object();
            data.ticket = ticket
            data.remark = remark;
            data.is_approve = is_approve;
            data.is_pass = is_pass;
            data.status = $("#dd_steps option:selected").val();
    
            axios({
                method: 'POST',
                url: `/api/config/remark/`,
                data: data,
                headers: axiosConfig,
            }).then(function (res) {
                socket.send(JSON.stringify({type: 'step_action', data: {ticket_id: ticket}}))
                $.when(
                    Toast.fire({
                        icon: 'success',
                        title: 'Success',
                    }),
                    $('.overlay').removeClass('d-none')
                ).then(function () {
                    $(location).attr('href', '/requests/lists')
                });
            });
    
        }).catch(function (error) { // error
            console.log(error);
            Toast.fire({
                icon: 'error',
                title: error,
            });
        });
    }; 
});
