$(document).ready(function () {
 
    // RETRIEVE / GET
    let table = $('#dt_articles').DataTable({
       "searching": false,
       "responsive": true,
       "lengthChange": false,
       "autoWidth": false,
       "serverside": true,
       "processing": true,
       "pageLength": 15,
       "ajax": {
         url: '/api/announcement/all/article/?format=datatables',
         type: "GET",
         // data: {
         //    "search": searchInput,
         //    "is_staff": staffFilter,
         //    "is_superuser": superuserFilter,
         //    "is_active": activeFilter,
         //    "department": departmentFilter,
         //    "group": groupFilter,
         //    "date_from": dateFromFilter,
         //    "date_to": dateToFilter,
         //    "status" : statusFilter
         // }
      },
      "columns": [
         {
            data: "title",
            render: function (data, type, row) {
               if (type == 'display') data = `<a href='#' class='btn-link-orange action-link btn_view'> ${row.title} </a>`
               return data
            },
         },
         {
            data: "author",
            render: function (data, type, row) {
               if (type == 'display') data = `${row.author.name}`;
               return data
            },
         },
         {
            data: "date_publish",
            render: function (data, type, row) {
               if (type == 'display') {
                  var date = moment(row.date_publish).format('DD MMMM YYYY');
                  var time = moment(row.date_publish).format('h:mm:ss a');

                  data = `<p class="title mb-0">${date}</p><span class="sub-title">${time}</span>`
               }
               return data
            },
         },
         {
            data: "is_publish",
            render: function (data, type, row) {
               data = (row.is_publish) ? "<i class='fas fa-thumbtack text-success'></i>" : "<i class='fas fa-bookmark text-orange' ></i>";
               return data
            },
         },
         {
            data: "is_active",
            render: function (data, type, row) {
               data = (row.is_active) ? "<i class='fas fa-check-circle text-success'></i>" : "<i class='fas fa-times-circle text-secondary'></i>";
               return data
            },
         }
      ],
      // "order": [[4, "desc"]],
    }); // table end
 });