[
	'{{repeat(3, 5)}}',
	{
		id: '{{index()}}',
		title: '{{firstName()}} {{lorem(5, "words")}}',
		media: '{{random("movie", "show")}}',
		mediaCount: '{{integer(5,10)}}',
		isDefault: '{{bool()}}',
		views: '{{integer(5,1000)}}',
		medias: [
			'{{repeat(5,10)}}',
			{
				id: '{{index()}}',
				originalTitle: '{{firstName()}} {{lorem(5, "words")}}',
				locale_data: {
					title: '{{surname()}} {{lorem(2, "words")}}',
					synopsis: '{{lorem(1, "paragraphs")}}'
				}
				url: 'http://www.url.com',
				poster: 'http://placehold.it/320x180'
			}
		]
	}
]