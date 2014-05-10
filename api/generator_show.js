[
    {
        id: '{{index()}}',
        seasons_count: '{{integer(1,10)}}',
        duration: '{{random(22,32,52)}}',
        poster: 'http://placehold.it/320x180',
        originalTitle: '{{firstName()}} {{lorem(5, "words")}}',
        prod_status: '{{bool()}}',
        yearStart: '{{integer(2000,2005)}}',
        yearStop: '{{integer(2008,2010)}}',
        country: {
            code: '{{integer(1,29)}}',
            name: '{{country()}}'
        },
        genre: {
            code: '{{integer(1,29)}}',
            name: '{{firstName()}}'
        },
        data_member: {
            lastEpisodeWatched: '{{integer(1,29)}}',
            follow: '{{bool()}}'
        },
        views: '{{integer(100,10000)}}',
        locale_data: {
                title: '{{surname()}} {{lorem(2, "words")}}',
                synopsis: '{{lorem(1, "paragraphs")}}'
        }
    }
]