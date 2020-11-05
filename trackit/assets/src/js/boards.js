$(document).ready(function () {
    // Select2 Config
    $('#select2_forms').select2({
        allowClear: true,
        placeholder: 'Select Form',
        // cache: true,
    });

    // Draggables
    const list_items = $('.list-item');
    const lists = $('.list');

    let draggedItem = null;

    list_items.each(function (index, element) {
        const item = list_items[index];

        $(item).on('dragstart', function () {
            draggedItem = item;
            setTimeout(function () {
                item.style.display = 'none';
            }, 0)
        });

        $(item).on('dragend', function () {
            setTimeout(function () {
                draggedItem.style.display = 'block';
                draggedItem = null;
            }, 0);
        });

    })

    lists.each(function (index, element) {
        const list = lists[index];

        $(list).on('dragover', function (e) {
            e.preventDefault();
        });

        $(list).on('dragenter', function (e) {
            e.preventDefault();
            this.style.backgroundColor = '#d8d9e1';
        });

        $(list).on('dragleave', function (e) {
            this.style.backgroundColor = '#e3E5ED';
        });

        $(list).on('drop', function (e) {
            console.log('drop');
            this.append(draggedItem);
            this.style.backgroundColor = '#e3E5ED';
        });
    })
});