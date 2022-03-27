const API_KEY = 'c31b84624bc041479fd85a5c8198ff65';
const choicesElem = document.querySelector('.js-choice');
const newsList = document.querySelector('.news-list');
const formSearch = document.querySelector('.form-search');
const mainTitle = document.querySelector('.main__title');


	// возвращает только слово
const declOfNum = (n, titles) => titles[n % 10 === 1 && n % 100 !== 11 ?
	0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
 

const choices = new Choices(choicesElem, {
	searchEnabled: false,
	itemSelectText: '',

});

//app get

const getData = (error, url) => {
	return fetch(url, {
		headers: {
			'X-Api-Key': API_KEY,
		}
	}).then(response => {
		if(!response.ok) {
			throw	error(new Error(response.status))
		}
		return response.json()
	}).catch(error);
	

};

const getCorectFormat = isoDate => {
	const date = new Date(isoDate);
	const fullDate = date.toLocaleString('en-GB', {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	});

	const fullTime = date.toLocaleString('en-GB', {
		hour: "2-digit",
		minute: "2-digit",
	});

	return `<span>${fullDate}</span> ${fullTime}`
}

const getImage = url => new Promise((resolve) => {
	const image = new Image(270, 200);
	image.addEventListener('load', () => {
		resolve(image);
	}),
	image.addEventListener('error', () => {
		image.src = './img/not.jpg';
		resolve(image);
	}),

	image.src = url || 'img/not.jpg';
	image.className = 'news-image';
	return image;
})

const renderCard = (data) => {
	
	newsList.textContent = '';
	data.forEach(async ({ urlToImage, title, url, description, publishedAt, author }) => {
		
		const card = document.createElement('li');
		card.className = 'news-item';

		const image = await getImage(urlToImage);
		image.alt = title;
		card.append(image);

		card.insertAdjacentHTML('beforeend', 
		`
			<h3 class="news-title">
				<a href="${url}" target="_blank" class="news-link">${title || ''}</a>
			</h3>
			<p class="news-descriptions">
				${description || ''}
			</p>
			<div class="news-dats">
				<time class="news-datetime" datetime="${publishedAt}">
					${getCorectFormat(publishedAt)}
				</time>
				<div class="news-author">${author || ''}</div>
			</div>
		`);

		
		newsList.append(card);
	});
	
}

const showError = (err) => {
	console.warn(err);
	newsList.innerHTML = '';
	mainTitle.textContent = `Произошла ошибка, повторите попытку `;
	mainTitle.classList.remove('hide');

}


const loadNews = async () => {
	newsList.innerHTML = '<li class="preload"></li>';
	const	country = localStorage.getItem('country') || 'ru';
	choices.setChoiceByValue(country);
	mainTitle.classList.add('hide');
	const data = await getData(showError, `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=100`);
	renderCard(data.articles);
	
};

const loadSearch = async (value) => {
	newsList.innerHTML = '<li class="preload"></li>';
	const data = await getData(showError, `https://newsapi.org/v2/everything?q=${value}`);
	mainTitle.classList.remove('hide');
	const strSearch = ['найден', 'найдено', 'найдено'];	
	const strResolt = ['результат', 'результата', 'результатов'];
	const count = data.articles.length;
	mainTitle.textContent = `По вашему запросу “${value}” ${declOfNum(count, strSearch)} ${count} ${declOfNum(count, strResolt)}`;
	choices.setChoiceByValue('');
	renderCard(data.articles);

};

choicesElem.addEventListener('change', (e) => {
	const value = e.detail.value;
	localStorage.setItem('country', value)
	loadNews(value);
});

formSearch.addEventListener('submit', event => {
	event.preventDefault();
	loadSearch(formSearch.search.value);
	
	formSearch.reset();	
});

loadNews();
