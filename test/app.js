require(['built'],
    function() {
        require(['plus'], function() {
            var data = {
                name: 'Jade',
                date: '2014.10.31',
                content: 'test requirejs'
            };

            var container = $('#container');

            var model = container.html($('#temp').html()).listen(data);

            setTimeout(function() {
                model.extend({
                    name: 'Lesley',
                    date: '2014.11.10',
                    content: 'test change'
                });
            }, 1000);
        });

    });