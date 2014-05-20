[
    '{{repeat(5, 7)}}',
    {
        id: '{{index()}}',
        season: 1,
        episode: '{{index() + 1}}',
        screen: 'http://placehold.it/320x180',
        originalTitle: '{{firstName()}} {{lorem(5, "words")}}',
        releaseDate: '{{date(new Date())}}',
        isLast: '{{bool()}}',
        isWatched: '{{bool()}}',
        isReleased: '{{bool()}}',
        views: '{{integer(100,10000)}}',
        locale_data: {
                title: '{{surname()}} {{lorem(2, "words")}}',
                synopsis: '{{lorem(1, "paragraphs")}}'
        }
    }
]