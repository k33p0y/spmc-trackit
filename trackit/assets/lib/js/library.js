// Get User
const actor = JSON.parse($('#user_id').text());

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


// Sweet Alert Toast
const Toast = Swal.mixin({
   toast: true,
   position: 'center',
   showConfirmButton: false,
   timer: 1500,
   timerProgressBar: true,
   onOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
   }
});

function navigator() {
   // Next
   $('.btn-next').click(function () {
      let tab = $(this).closest('.tab-pane');
      $(`#${tab[0].id}, .nav-pills li.nav-item a`)
         .removeClass('active');
      $(`.nav-pills li.nav-item a[href="#${tab.next()[0].id}"]`)
         .addClass('active')
         .removeClass('disabled');
      tab.next().addClass('show active');
   });

   // Previous
   $('.btn-prev').click(function () {
      let tab = $(this).closest('.tab-pane');
      $(`#${tab[0].id}, .nav-pills li.nav-item a`).removeClass('active');
      $(`.nav-pills li.nav-item a[href="#${tab.prev()[0].id}"]`).addClass('active');
      tab.prev().addClass('show active');
   });
}

function getCategory(type_id) {
   $.ajax({
      url: '/requests/categories/json',
      type: 'POST',
      data: {
         'type_id': type_id
      },
      beforeSend: function (xhr, settings) {
         xhr.setRequestHeader("X-CSRFToken", csrftoken);
      },
      success: function (data) {
         // Show Category Row
         $('#form-group-category').slideDown();

         // Empty Dropdown Values
         $("#dd_categories")
            .empty()
            .append('<option></option>');

         // Populate Dropdown
         data.forEach(key => {
            $("#dd_categories").append(`<option value='${key.id}'>${key.name}</option>`)
         });
      },
   });
}

// PROMISE Method with AJAX
function doTheThing(form_id) {
   return new Promise((resolve, reject) => {
      $.ajax({
         url: `/api/requests/forms/${form_id}`,
         type: 'GET',
         success: function (data) {
            resolve(data)
         },
         error: function (error) {
            reject(error)
         },
      });
   });
}

// Gernerate Custom Forms
function generateForm(forms) {
   $(".custom-form").empty();

   forms.forEach(form => {

      let title = form.title;
      let form_field = form.form_field;
      let is_admin = form.is_admin;

      if (form_field.length > 1) {
         $(".custom-form").append(
            `<div class="form-group">
               <label> ${title} </label>
               <div class="type-group"></div>
               <small class="error-info" id="error-info-type"></small>
            </div>`
         );

         form_field.forEach(field => {
            if (field.type == "text") {
               $(".type-group").append(
                  `<input type="text" class="form-control form-control-sm" id="${field.id}" placeholder="Enter ${title}">`
               );
            }
            if (field.type == "textarea") {
               $(".type-group").append(
                  `<textarea class="form-control form-control-sm" id="${field.id}" placeholder="Enter ${title}" rows="2"></textarea>`
               );
            }
            if (field.type == "radio") {
               field.option.forEach(opt => {
                  $(".type-group").append(
                     `<div class="icheck-material-orange icheck-inline m-0 mr-3">
                        <input type="radio" id="${opt.id}" name="${field.id}" />
                        <label for="${opt.id}">${opt.name}</label>
                     </div>`
                  );
               });
            }
            if (field.type == "check") {
               counter = 1;
               field.option.forEach(opt => {
                  $(".type-group").append(
                     `<div class="icheck-material-orange icheck-inline m-0 mr-3">
                        <input type="checkbox" id="${opt.id}"/>
                        <label for="${opt.id}">${opt.name}</label>
                     </div>`
                  );
                  counter++;
               });
            }
         });
      } else {
         if (form_field.type == "text") {
            $(".custom-form").append(
               `<div class=" form-group">
                  <label> ${title} </label>
                  <input type="text" class="form-control form-control-sm" id="${form_field.id}" placeholder="Enter ${title}">
                  <small class="error-info" id="error-info-type"></small>
               </div>`
            );
         }
         if (form_field.type == "textarea") {
            $(".custom-form").append(
               `<div class=" form-group">
                  <label> ${title} </label>
                  <textarea class="form-control form-control-sm" id="${form_field.id}" placeholder="Enter ${title}" rows="2"></textarea>
                  <small class="error-info" id="error-info-type"></small>
               </div>`
            );
         }
         if (form_field.type == "radio") {
            $(".custom-form").append(
               `<div class=" form-group">
                  <label> ${title} </label>
                  <div class="radio-group"></div>
                  <small class="error-info" id="error-info-type"></small>
               </div>`
            );
            form_field.option.forEach(opt => {
               $(".radio-group").append(
                  `<div class="icheck-material-orange icheck-inline m-0 mr-3">
                     <input type="radio" id="${opt.id}" name="${form_field.id}" />
                     <label for="${opt.id}">${opt.name}</label>
                  </div>`
               );
            });
         }
         if (form_field.type == "check") {
            $(".custom-form").append(
               `<div class=" form-group">
                  <label> ${title}</label>
                  <div class="check-group"></div>
                  <small class="error-info" id="error-info-type"></small>
               </div>`
            );

            form_field.option.forEach(opt => {
               $(".check-group").append(
                  `<div class="icheck-material-orange icheck-inline m-0 mr-3">
                     <input type="checkbox" id="${opt.id}"/>
                     <label for="${opt.id}">${opt.name}</label>
                  </div>`
               );
            });
         }
      }
   });
}

// Get form Values
function getFormValues(forms) {
   let fields_arr = new Array();

   forms.forEach(form => {
      let title = form.title;
      let form_field = form.form_field;
      let is_admin = form.is_admin;
      let answer, fields;

      if (form_field.length > 1) {
         fields = new Array();
         form_field.forEach(field => {
            if (field.type == "text" || field.type == "textarea") {
               answer = $(`#${field.id}`).val();
            }
            if (field.type == "radio") {
               field.option.forEach(opt => {
                  if ($(`#${opt.id}`).is(":checked")) {
                     answer = new Object();
                     answer.key = opt.id;
                     answer.value = true;
                  }
               });
            }
            if (field.type == "check") {
               answer = new Array();
               field.option.forEach(opt => {
                  if ($(`#${opt.id}`).is(":checked")) {
                     answer.push({
                        "key": opt.id,
                        "value": true
                     })
                  }
               });
            }

            fields.push({
               "id": field.id,
               "name": field.name,
               "type": field.type,
               "option": field.option,
               "answer": answer,
            });
         });
      } else {
         if (form_field.type == "text" || form_field.type == "textarea") {
            answer = $(`#${form_field.id}`).val();
         }
         if (form_field.type == "radio") {
            form_field.option.forEach(opt => {
               if ($(`#${opt.id}`).is(":checked")) {
                  answer = new Object();
                  answer.key = opt.id;
                  answer.value = true;
               }
            });
         }
         if (form_field.type == "check") {
            answer = new Array();
            form_field.option.forEach(opt => {
               if ($(`#${opt.id}`).is(":checked")) {
                  answer.push({
                     "key": opt.id,
                     "value": true
                  })
               }
            });
         }

         fields = new Object();
         fields.id = form_field.id;
         fields.name = form_field.name;
         fields.type = form_field.type;
         fields.option = form_field.option;
         fields.answer = answer;
      }

      fields_arr.push({
         "title": form.title,
         "form_field": fields,
         "is_admin": form.is_admin,
      });
   });

   console.log(fields_arr)

   clean = cleanJSON(fields_arr);
   return clean;
}


