[
    '{{repeat(5, 7)}}',
    {
        id: '{{index()}}',
        season: 1,
        episode: '{{index() + 1}}',
        poster: 'http://placehold.it/320x180',
        originalTitle: '{{firstName()}} {{lorem(5, "words")}}',
        releaseDate: '{{date(new Date())}}',
        isLast: '{{bool()}}',
        isWatched: '{{bool()}}',
        isReleased: '{{bool()}}',
        views: '{{integer(100,10000)}}',
        locale_data: {
                title: '{{surname()}} {{lorem(2, "words")}}',
                synopsis: '{{lorem(1, "paragraphs")}}'
        },
        links: [
            '{{repeat(1,5)}}',
            {
                id: '{{index()}}',
                url: 'http://www.url.com',
                host: 'exashare',
                lang: '{{random("fr", "en")}}',
                subtitles_lang: '{{random("fr", "", "en")}}'
            }
        ]
    }
]