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
      "ordering":false,
      "paging": false,
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
               if (type == 'display') data = `<p class="title mb-1">${moment(row.datetime).format('DD MMMM YYYY')}</p>`
               return data
            },
         }, // DATE
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') data = `<p class="title mb-1">${moment(row.datetime).format('h:mm:ss a')}</p>`;
               return data;
            },
         }, // TIME
         {
            data: "event_type",
            render: function (data, type, row) {
               if (type == 'display') {
                  if (row.event_type === "Create") data = `${row.event_type}`;
                  else if (row.event_type === "Update") {
                     if (row.changed_fields.reference_no) data = 'Generate Reference No';
                     else data = 'Update';
                  }
               }
               return data
            },
         }, // ACTION
         {
            data: "changed_fields",
            render: function (data, type, row) {
               if (type == 'display') {
                  if (row.changed_fields) {
                     if (row.changed_fields.reference_no) data = row.changed_fields.reference_no[0];
                     else if (row.changed_fields.status) data = `Status: ${row.changed_fields.status[0]}`;
                     else if (row.changed_fields.description) data = `Title: ${row.changed_fields.description[0]}`;
                     else if (row.changed_fields.is_active) data = `Is Active: ${row.changed_fields.is_active[0]}`;
                     else if (row.changed_fields.form_data) data = 'Form: Request details';
                     // else if (row.changed_fields.form) data = row.changed_fields.form[1];
                  }
               }
               return data
            },
         }, // CHANGES OLD
         {
            data: "changed_fields",
            render: function (data, type, row) {
               if (type == 'display') {
                  if (row.changed_fields) {
                     if (row.changed_fields.reference_no) data = row.changed_fields.reference_no[1];
                     else if (row.changed_fields.status) data = `Status: ${row.changed_fields.status[1]}`;
                     else if (row.changed_fields.description) data = `Title: ${row.changed_fields.description[1]}`;
                     else if (row.changed_fields.is_active) data = `Is Active: ${row.changed_fields.is_active[1]}`;
                     else if (row.changed_fields.form_data) data = 'Form: Request details';
                     // else if (row.changed_fields.form) data = row.changed_fields.form[1];
                  }
               }
               return data
            },
         }, // CHANGES NEw
         {  
            data: null,
            render: function (data, type, row) {
               data = ''
               if (row.event_type === "Update" && row.changed_fields.status) {
                  let is_approve = JSON.parse(`${row.remarks.is_approve}`);
                  let is_pass = JSON.parse(`${row.remarks.is_pass}`);
                  if (is_approve != null) { // Has Approve
                     if (is_approve) data = "<span class='text-success'> <i class='fas fa-sm fa-check-circle'></i> Approved </span>";
                     else data = "<span class='text-danger'> <i class='fas fa-sm fa-times-circle'></i> Disapproved </span>";
                  } else if (is_pass != null) { // Has Pass
                     if (is_pass) data = "<span class='text-success'> <i class='fas fa-sm fa-check-circle'></i> Passed </span>";
                     else data = "<span class='text-danger'> <i class='fas fa-sm fa-times-circle'></i> Failed </span>";
                  } else data = ''
               }
               return data
            },
         }, // APPROVE_PASS
         { 
            data: "remarks",
            render: function (data, type, row) {
               data = (row.event_type === "Update" && row.changed_fields.status) ? `${row.remarks.remark}` : '';
               return data 
            }
         }, // REMARK
         { 
            data: "user",
            render: function (data, type, row) {
               if (type == 'display') {
                  let action_user = `${row.user.first_name} ${row.user.last_name}`;
                  data = (row.ticket.task_officer.includes(action_user)) ? row.ticket.task_officer.join(', ') : action_user
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
