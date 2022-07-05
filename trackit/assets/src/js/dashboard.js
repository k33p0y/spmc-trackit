$(document).ready(function () {
   // Check if user has already done or skip walkthrough
   axios.get('/api/config/tour/').then(res => { // response
      const response = res.data.results;
      let request = new Object();
      // if has response and is_explore value is false; call walkthrough fn with PUT method and url
      // if empty response; call walkthrough fn with POST method to create instance  
      if (response.length > 0 && !response[0].is_explore_main) {
         request.method = 'PUT';
         request.url = `/api/config/tour/${response[0].id}/`;
         exploreTrackit(request);
      }
      else if (response.length == 0) {
         request.method = 'POST';
         request.url = `/api/config/tour/`;
         exploreTrackit(request);
      }
   }).catch(err => { // error
      toastError(err.response.statusText) // alert
   });

   // List Table
   let table = $('#dt_requests').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverSide": true,
      "processing": true,
      "paging" : false,
      "ordering": false,
      "info": false,
      "language": {
         processing: $('#table_spinner').html()
      },
      "ajax": {
         url: '/api/requests/ticket/latest/?limit=6&format=datatables',
         type: "GET",
      },
      "columns": [
         { 
            data: "ticket_no",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `<a href='/requests/${row.ticket_id}/view' class='btn-link-orange action-link btn_view'> ${row.ticket_no} </a>`
               }
               return data
            }
         }, // Ticket No
         {
            data: "request_form",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `<span class="td-badge text-light text-truncate" style="background-color:${row.request_form.color}">${row.request_form.prefix}</span>`
               }
               return data
            },
         }, // Request Type
         { 
            data: "description",
            render: $.fn.dataTable.render.ellipsis(50, true),
         }, // Description
         { 
            data: "status",
            render: function (data, type, row) {
               // console.log(row)
               if (type == 'display') {
                  template = `<div> ${row.status.name}
                        <div class="progress progress-table mt-1">
                           <div class="progress-bar bg-orange" role="progressbar" style="width: ${row.progress}%;" aria-valuenow="${row.progress}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                     </div>`
                  data = template
               }
               return data
            },
         }, // Status
         {
            data: "requested_by",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `${row.requested_by.first_name} ${row.requested_by.last_name}`
               }
               return data
            },
         }, // Requested By
      ],
   });

   // Announcement
   $('.carousel-inner').on('click', '.btn-more', function() {
      axios
         .get(`/api/announcement/all/article/${$(this).data().articleId}/`)
         .then(res => {
            let resources = '';
            let content = '';
            // if has body 
            if (res.data.content) content = `<div class="border p-4 mb-3">${res.data.content}</div>`
            // if has resources
            if (res.data.resources) {
               res.data.resources.forEach(resource => {
                  let file_url = (window.location.protocol == "https:") ? resource.file.replace("http://", "https://") : resource.file;
                  let file = (file_url.includes('socket')) ? file_url.replace('socket', window.location.host) : file_url;

                  resources += `<div class="col-3 mb-2">
                     <a href="${file}" target="_blank" class="file-anchor" data-toggle="tooltip" title="${resource.file_name}">
                        <div class="card border shadow-sm resource-item m-0">
                           <div class="d-flex flex-row align-items-center px-2 py-1">
                              <div class="far ${fileType(resource.file_type, media_type)}"></div>         
                              <div class="card-body p-0 ml-2 text-truncate text-secondary">
                                 <small class="m-0 text-secondary">${resource.file_name}</small>
                              </div>
                           </div>
                        </div>
                     </a>
                  </div>`
               });
            }
            $('.modal-readmore').html(`<div class="m-2">
                  <h6 class="font-weight-bold text-orange mb-1">${res.data.title}</h6>
                  <p class="preface m-0">${res.data.preface}</p>
                  <hr>
                  ${content}
                  <div><div class="row">${resources}</div></div>
                  <small class="text-muted">Issued on ${moment(res.data.date_publish).format('DD MMMM YYYY h:mm:ss a')} by ${res.data.author.name}</small>
               </div>`
            );
            $('#previewMore').modal();
         })
         .catch(err => {
            console.log(err)
         })
   });

   // walkthrough click event
   $('.tour-me').click(function() {
      exploreTrackit();
   });

});