$(document).ready(function () {
   // List Table
   let table = $('#dt_requests').DataTable({
      "searching": false,
      "responsive": true,
      "autoWidth": false,
      "paging": false,
      "info": false,
      "columnDefs": [{
         "targets": [0,1,2,3,4],
         "orderable": false
      }]
   });

   $('.carousel-inner').on('click', '.btn-more', function() {
      axios
         .get(`/api/announcement/all/article/${$(this).data().articleId}/`)
         .then(res => {
            let resources = '';
            let content = '';
            // if has body 
            if (res.data.content) content = `<div class="mb-4">${res.data.content}</div>`
            // if has resources
            if (res.data.resources) {
               res.data.resources.forEach(resource => {
                  let file_url = (window.location.protocol == "https:") ? resource.file.replace("http://", "https://") : resource.file;
                  let file = (file_url.includes('socket')) ? file_url.replace('socket', window.location.host) : file_url;

                  resources += `<div class="col-2 mb-2">
                     <a href="${file}" target="_blank" class="file-anchor" data-toggle="tooltip" title="${resource.file_name}">
                        <div class="card border shadow-sm resource-item m-0">
                           <div class="d-flex flex-row align-items-center px-2 py-1">
                              <div class="far fa-sm ${fileType(resource.file_type, media_type)}"></div>         
                              <div class="card-body p-0 ml-1 text-truncate text-secondary">
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
});