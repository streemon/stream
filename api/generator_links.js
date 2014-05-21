{
    media: '{{random("movie", "episode")}}',
    media_id: '{{index() + 100}}',
    count: '{{integer(5, 7)}}',
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