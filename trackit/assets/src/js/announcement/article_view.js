$(document).ready(function () { 
    // publish 
    $('#btn_publish').click(function (e) {
        e.preventDefault();
        Swal.fire({
            title: 'Publish Article',
            html: '<p class="m-0">This article will be published for all users in the dashboard.</p>',
            icon: 'info',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Publish',
            reverseButtons: true
         }).then((result) => {
            if (result.value) {
               let eventHandler = $('#btn_publish');
               let article = eventHandler.data().articleId;
               eventHandler.prop("disabled", true) // disable button
               patchArticle(article, eventHandler);
            }
         });
    });

    // unpublish 
    $('#btn_unpublish').click(function (e) {
        e.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            html: '<p class="m-0">This article will be removed and will no longer be available for all users in the dashboard.</p>',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Unpublish',
            confirmButtonColor: '#c44a56',
            reverseButtons: true
         }).then((result) => {
            if (result.value) {
               let eventHandler = $('#btn_unpublish');
               let article = eventHandler.data().articleId;
               eventHandler.prop("disabled", true) // disable button
               patchArticle(article, eventHandler);
            }
         });
    });

    let patchArticle = function (article, eventHandler) {
        axios({
            method: 'PUT',
            url: `/api/news/article/publish/${article}/`,
            headers: axiosConfig,
        }).then(function (res) { // success
            $.when(toastSuccess('Success')).then(() => {
                eventHandler.prop("disabled", false)  // enable button
                $(location).attr('href', '/announcement/lists')
            }) // Alert
        }).catch(function (err) { // error
            toastError(err.response.statusText) // alert
        });
    }
});