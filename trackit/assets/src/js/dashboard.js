$(document).ready(function () {
    // $('body').bootstrapMaterialDesign();

    // $('.nav-menu').click(function () {
    //     // $(this).removeClass('selected');
    //     // $(this).addClass('selected');
    // });

   // List Table
   let table = $('#dt_requests').DataTable({
    "searching": false,
    "responsive": true,
    "lengthChange": false,
    "autoWidth": false,
    "serverside": true,
    "processing": true,
    "pageLength": 10,
    "ajax": {
       url: '/api/requests/lists/?format=datatables',
       type: "GET",
    //    data: {
    //       "search_input": searchInput,
    //       "category_id": categoryId,
    //       "department_id": departmentId,
    //       "status_id": statusId,
    //       "is_active": isActive
    //    },
    },
    "columns": [
       { data: "ticket_no" }, // Ticket No
       {
        data: "status",
        render: function (data, type, row) {
           if (type == 'display') {
              data = row.status.name
           }
           return data
        },
     }, // Status 
    ],
 });

});