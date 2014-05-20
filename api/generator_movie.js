{
	id: '{{index()}}',
	originalTitle: '{{firstName()}} {{lorem(4, "words")}}',
	duration: '{{random(22,32,52)}}',
	poster: 'http://placehold.it/320x180',
	productionYear: '{{integer(2000,2015)}}',
	locale_lang: '{{random("fr", "en")}}',
	locale_data: {
			title: '{{surname()}} {{lorem(2, "words")}}',
			synopsis: '{{lorem(1, "paragraphs")}}'
	},
	ratings: '{{integer(30,100)}}',
	country: {
		code: '{{integer(1,29)}}',
		name: '{{country()}}'
	},
	genre: {
		code: '{{integer(1,29)}}',
		name: '{{firstName()}}'
	},
	data_member: {
		watched: '{{bool()}}',
		lists:
		[
			'{{repeat(1,5)}}',
			{
				id: '{{integer(1,29)}}',
				name: '{{lorem(3, "words")}}',
				present: '{{bool()}}'
			}
		]
	},
	suggestions: 
	[
		'{{repeat(4)}}',
		{
			id: '{{integer(1,29)}}',
			title: '{{firstName()}} {{lorem(4, "words")}}',
			poster: 'http://placehold.it/160x90'
		}
	],
	views: '{{integer(100,10000)}}'
}