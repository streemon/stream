{
	media: '{{random("movie", "show")}}',
	media_id: '{{index() + 100}}',
	count: '{{integer(5, 7)}}',
	comments:
	[
		'{{repeat(5, 7)}}',
		{
			id: '{{index()}}',
			author_id: '{{index() + 200}}',
			author_avatar: 'http://placehold.it/32x32',
			date: '{{date(new Date())}}',
			isLast: '{{bool()}}',
			comment: '{{lorem(1, "paragraphs")}}'
		}
	]
}