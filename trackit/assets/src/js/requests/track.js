$(document).ready(function () {

   var getTrackingNum = function() {
      let ticket_number = localStorage.getItem('ticket-number')
      if (ticket_number) $('#search-input').val(ticket_number);
      localStorage.removeItem('ticket-number');
      let tracking_num = $('#search-input').val();
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
                        if (row.changed_fields.reference_no) data = 'Generate Reference No';
                        else if (row.changed_fields.status) data = `${row.changed_fields.status[0]}`; // index 0 for the current status, 1 for the previous status
                        else if (row.changed_fields.form_data) data = 'Update';
                  }
               }
               return data
            },
         }, // STATUS
         {  
            data: null,
            render: function (data, type, row) {
               data = ''
               if (row.event_type === "Update" && row.changed_fields.status) {
                  let is_approve = JSON.parse(`${row.remarks.is_approve}`);
                  let is_pass = JSON.parse(`${row.remarks.is_pass}`);
               
                  if (is_approve != null) { // Has Approve
                     if (is_approve) {
                        data = "<span class='text-success'> <i class='fas fa-sm fa-check-circle'></i> Approved </span>";
                     } else {
                        data = "<span class='text-danger'> <i class='fas fa-sm fa-times-circle'></i> Disapproved </span>";
                     }
                  } else if (is_pass != null) { // Has Pass
                     if (is_pass) {
                        data = "<span class='text-success'> <i class='fas fa-sm fa-check-circle'></i> Passed </span>";
                     } else {
                        data = "<span class='text-danger'> <i class='fas fa-sm fa-times-circle'></i> Failed </span>";
                     }
                  } else data = ''
               }
               return data
            },
         }, // APPROVE_PASS
         { 
            data: "remarks",
            render: function (data, type, row) {
               if (row.event_type === "Update" && row.changed_fields.reference_no) data = `Ref# ${row.changed_fields.reference_no[1]}`
               else if (row.event_type === "Update" && row.changed_fields.status) data = `${row.remarks.remark}`
               else if (row.event_type === "Update" && row.changed_fields.form_data) data = 'Change form details'
               else data = ''
               return data 
            }
         }, // REMARK
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

   // Search Bar onSearch Event
   $("#search-input").on('search', function () {
      table.ajax.reload();
      return false; // prevent refresh
   });

   // Search Bar onClick Event
   $("#execute-search").click(function () {
      table.ajax.reload();
      return false; // prevent refresh
   });
});
