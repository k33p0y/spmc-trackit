// Headers CSRF 
function getCookie(name) {
   let cookieValue = null;
   if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
         const cookie = cookies[i].trim();
         // Does this cookie string begin with the name we want?
         if (cookie.substring(0, name.length + 1) === (name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
         }
      }
   }
   return cookieValue;
}
const csrftoken = getCookie('csrftoken');

// Headers Axios
const axiosConfig = {
   "Content-Type": "application/json;charset=UTF-8",
   "Access-Control-Allow-Origin": "*",
   "X-CSRFToken": csrftoken,
};

const actor = $('.user-link').data().userId;

// Sweet Alert Toast
const Toast = Swal.mixin({
   toast: true,
   position: 'top-end',
   showConfirmButton: false,
   timer: 2000,
   // timerProgressBar: true,
   // onOpen: (toast) => {
   //    toast.addEventListener('mouseenter', Swal.stopTimer)
   //    toast.addEventListener('mouseleave', Swal.resumeTimer)
   // }
});

// Notifications
const getUserNotifications = function (){
   return axios.get('/api/user/notifications/',).then(response=>response.data).catch(response=>response.data)
};

// MIME TYPES REGISTER
const media_type = new Object();
media_type.text = ['text/plain'];
media_type.pdf = ['application/pdf'];
media_type.spreadsheet = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel','application/vnd.oasis.opendocument.spreadsheet','text/csv'];
media_type.document = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword','application/vnd.oasis.opendocument.text'];
media_type.presentation = ['application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.ms-powerpoint','application/vnd.oasis.opendocument.presentation'];
media_type.image = ['image/png','image/jpeg'];

// File Type
const fileType = function(file_type, media_type) {
   let file_icon;

   if (media_type.text.includes(file_type)) { // Text File
      file_icon = "fa-file-alt"
   } else if (media_type.pdf.includes(file_type)) { // PDF File
      file_icon = "fa-file-pdf text-danger"
   } else if (media_type.spreadsheet.includes(file_type)) { // Excel or CSV File
      file_icon = "fa-file-excel text-success"
   } else if (media_type.document.includes(file_type)) { // Word or Document File
      file_icon = "fa-file-word text-primary"
   } else if (media_type.presentation.includes(file_type)) { // Powerpoint File
      file_icon = "fa-file-powerpoint text-orange"
   } else if (media_type.image.includes(file_type)) { // Image File
      file_icon = "fa-file-image text-warning"
   } else { // Invalid File
      file_icon = 'invalid';
   }

   return file_icon;
};

// File Size
const fileSize = function(bytes) {
   let file_size;

   if (bytes < 1024) {
      file_size = `${bytes} bytes`;
   } else if (bytes >= 1024 && bytes < 1024000) { // Convert Bytes to Kilobytes
      bytes = (bytes / 1024).toFixed(1);
      file_size = `${bytes} KB`;
   } else if (bytes > 1024000 && bytes <= 25214400) { // Convert Bytes to MegaBytes & set limit 25MB 
      bytes = (bytes / 1024000).toFixed(1);
      file_size = `${bytes} MB`;
   } else { // Invalid Size 
      file_size = 'invalid';
   }

   return file_size;
};

// Post Comments
const getComments = function(ticket, next_page){
   let url = '/api/requests/comments/'
   if (next_page) url = next_page;

   if (ticket){
      axios({
         method: 'GET',
         url: url,
         params: {
            ticket_id : ticket,
         },
         headers: axiosConfig,
      }).then(function (response) { // success
         // check if there is next page to comment list API
         response.data.next ? $('#comment-nextpage-url').val(response.data.next) : $('#comment-nextpage-url').val(null);

         if (!next_page) $('.comment-section').empty();
         let comments_array = response.data.results
         for (i=0; i<comments_array.length; i++){
            if (!$(`.user-comment[data-comment-id="${comments_array[i].id}"]`).length) { // check if comment id already exist
               let fullname = `${comments_array[i].user.first_name} ${comments_array[i].user.last_name}`
               let comment = `${comments_array[i].content}`
               let date_created = `${moment(comments_array[i].date_created).format('MMM DD, YYYY hh:mm a')}`
               let logged_user_id = $('.user-link').data().userId;

               $('.comment-section').append(
                  `<div class="user-comment justify-content-start ${comments_array[i].user.id == logged_user_id ? 'bg-comment-orange' : ''}" data-comment-id="${comments_array[i].id}">
                     <div class="d-inline justify-content-start ">
                        <span class="font-weight-bold text-orange name ">${fullname}</span>
                        <span class="text-muted text-xs"> - ${date_created}</span>
                     </div>
                     <div class="mt-2">
                        <p class="comment-text m-0">${comment}</p>
                     </div>
                  </div>`
               )
            }
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

// Dropdown Filter Config
const toggleFilter = function() {return $(".dropdown-filter-toggle").dropdown('hide')}
