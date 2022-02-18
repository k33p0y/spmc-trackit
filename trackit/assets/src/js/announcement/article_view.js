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
               let eventHandler = $('#btn_publish').prop('disabled', true) // disable button
               let article = $('#btn_publish').data().articleId;
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
               let eventHandler = $('#btn_unpublish').prop('disabled', true) // disable button
               let article = $('#btn_unpublish').data().articleId;
               patchArticle(article, eventHandler);
            }
         });
    });

    let patchArticle = function (article, eventHandler) {
        axios({
            method: 'PATCH',
            url: `/api/announcement/all/article/${article}/`,
            headers: axiosConfig,
        }).then(function (res) { // success
            $.when(toastSuccess('Success')).then(() => {
                $('#btn_save').attr('disabled', false) // enable button
                $(location).attr('href', '/announcement/lists')
            }) // Alert
        }).catch(function (err) { // error
            toastError(err.response.statusText) // alert
            if (err.response.data.title) showFieldErrors(err.response.data.title, 'title'); else removeFieldErrors('title');
        });
    }
});