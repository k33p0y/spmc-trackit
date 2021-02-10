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

       postAction(ticket_id, status, remark);
   });

   // Refuse action
   $('.btn-refuse').click(function (e) {
       e.preventDefault();
       let ticket_id = $(this).data().ticketId;
       let prev_step = $("#dd_steps option:selected").prev().val();  
       let status = (typeof step === "undefined") ? prev_step : step;
       let remark = $('#txtarea-comment').val();

       postAction(ticket_id, status, remark);
   });
});
