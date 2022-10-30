import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

async function search() {
  let userInput = document.getElementById('searchbar');
  let userInputValue = userInput.value;
  let errorDiv = document.getElementById('error');
  let results = document.getElementById('results');
  let data;
  localStorage.setItem('nextPageToken', 'false');
  localStorage.setItem('prevPageToken', 'false');
  if (errorDiv.innerHTML != '') {
      results.innerHTML = '';
      errorDiv.innerHTML = '';
  }
  if (userInputValue != '') {
      userInputValue.trim().replace(' ', '%20');
      let url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${userInputValue}&key=AIzaSyBDfzpEUdss3yp6v9ml5KDuBG7FzUT8HAA`;
      let response = await fetch(url);
      data = await response.json();
      results.innerHTML = '';
      console.log(data);
  } else {
      userInput.classList.add('red-placeholder-text')
      return
  }
  let flagForNoChannels = true;
  if (Object.keys(data).includes('items')) {
      for (let item of data.items) {
          if (item.id.kind === 'youtube#channel') {
              flagForNoChannels = false;
              results.appendChild(generateChannelCard(item));
          }
      }
  } else {
      errorDiv.innerHTML = 'No channels results found';
      // userInput.value = '';
  }
  if (flagForNoChannels) {
      errorDiv.innerHTML = 'No channels results found';
  }
}

function checkForNextAndPrevPageToken(data) {
  console.log(data);
  if (Object.keys(data).includes('nextPageToken')) {
      localStorage.setItem('nextPageToken', data.nextPageToken);
      if (!Object.keys(data).includes('prevPageToken')) {
          localStorage.setItem('prevPageToken', 'false');
      }
      if (Object.keys(data).includes('prevPageToken')) {
          localStorage.setItem('prevPageToken', data.prevPageToken);
          if (!Object.keys(data).includes('nextPageToken')) {
              localStorage.setItem('nextPageToken', 'false');
          }
      }
  }else{
    localStorage.setItem('prevPageToken', 'false');
    localStorage.setItem('nextPageToken', 'false'); 
  }
}

function generateChannelCard(item) {
  let link = document.createElement('a');
  let container = document.createElement('div');
  let image = document.createElement('img');
  let title = document.createElement('h3');
  let description = document.createElement('p');
  // let statistics = createStatisticsElement(item);
  let showVideosButton = document.createElement('a');
  link.setAttribute('href', 'https://youtube.com/channel/' + item.id);
  link.setAttribute('target', '_blank');
  container.id = 'channelContainer';
  container.className = 'container';
  container.classList.add('grey', 'lighten-4', 'black-text', 'waves-effect', 'waves-dark');
  description.classList.add('flow-text');
  title.innerHTML = item.snippet.title;
  description.innerHTML = item.snippet.description;
  image.src = item.snippet.thumbnails.default.url;
  // image.width = item.snippet.thumbnails.default.width;
  // image.height = item.snippet.thumbnails.default.height;
  image.classList.add('circle', 'responsive-img');
  link.innerHTML = 'Go to Channel';
  link.classList.add('btn-small');
  showVideosButton.innerHTML = 'Show videos';
  showVideosButton.setAttribute('href', '#videoResults');
  showVideosButton.classList.add('modal-trigger', 'btn-small', 'blue', 'lighten-2');
  showVideosButton.addEventListener('click', () => {
      let videoResults = document.querySelector('.modal-content');
      videoResults.innerHTML = '<h1>Video Results</h1>';
      showVideosButtonEvent(item);
  });
  container.appendChild(image);
  // container.appendChild(statistics);
  container.appendChild(title);
  container.appendChild(link);
  container.appendChild(showVideosButton);
  container.appendChild(description);
  return container;
}

// function createStatisticsElement(item){
//     let statistics = document.createElement('div');
//     let viewCount = document.createElement('p');
//     let subscriberCount = document.createElement('p');
//     let videoCount = document.createElement('p');
//     statistics.classList.add('right');
//     statistics.id = 'statistics';
//     viewCount.innerHTML = `${item.statistics.viewCount} Views`;
//     subscriberCount.innerHTML = `${item.statistics.subscriberCount} Subscribers`;
//     videoCount.innerHTML = `${item.statistics.videoCount} Videos`;
//     statistics.appendChild(viewCount);
//     statistics.appendChild(subscriberCount);
//     statistics.appendChild(videoCount);
//     return statistics
// }

async function fetchVideos(id, pageToken = 0) {
  let response;
  let data;
  if (pageToken === 0) {
      response = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=${id}&maxResults=10&key=AIzaSyBDfzpEUdss3yp6v9ml5KDuBG7FzUT8HAA`);
      data = await response.json();
  } else {
      response = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=${id}&maxResults=10&pageToken=${pageToken}&key=AIzaSyBDfzpEUdss3yp6v9ml5KDuBG7FzUT8HAA`);
      data = await response.json();
  }
  return data;
}

async function showVideosButtonEvent(item) {
  let videoData = await fetchVideos(item.id.channelId);
  localStorage.setItem('channelId', item.id.channelId);
  let container = document.createElement('div');
  let videoResults = document.querySelector('.modal-content');
  let buttonContainer = document.querySelector('.modal-footer');
  // videoResults.innerHTML = '<h1>Video Results</h1>';
  container.classList.add('row');
  // console.log(videoData);
  for (let video of videoData.items) {
      if (video.id.kind === 'youtube#video') {
          let card = generateVideoCard(video);
          container.appendChild(card);
      }
  }
  checkForNextAndPrevPageToken(videoData);
  buttonContainer.innerHTML = '';
  createPageButtons();
  // localStorage.setItem('nextPageToken', 'false');
  // localStorage.setItem('prevPageToken', 'false');
  videoResults.appendChild(container);
}

function generateVideoCard(video) {
  let videoUrl = `https://www.youtube.com/watch?v=${
      video.id.videoId
  }`;
  let container = document.createElement('div');
  let videoCard = document.createElement('div');
  let cardImage = document.createElement('div');
  let cardContent = document.createElement('div');
  let title = document.createElement('span');
  let description = document.createElement('p');
  let image = document.createElement('img');
  let publishTime = document.createElement('p');
  let link = document.createElement('a');
  container.classList.add('col', 's12', 'l6');
  videoCard.classList.add('card');
  cardImage.classList.add('card-image');
  cardContent.classList.add('card-content');
  title.innerHTML = video.snippet.title;
  title.classList.add('flow-text', 'card-title');
  description.innerHTML = video.snippet.description;
  description.classList.add('flow-text','videoDescription');
  publishTime.innerHTML = `Upload time: ${
      video.snippet.publishTime.replace('T', ' ').replace('Z', '').replace(/[-]/g,'/')
  }`;
  publishTime.classList.add('flow-text');
  image.setAttribute('src', video.snippet.thumbnails.high.url);
  image.width = video.snippet.thumbnails.high.width;
  image.height = video.snippet.thumbnails.high.height;
  image.classList.add('responsive-img');
  link.setAttribute('href', videoUrl);
  link.setAttribute('target', '_blank');
  link.appendChild(image)
  cardImage.appendChild(link);
  cardContent.appendChild(title);
  cardContent.appendChild(description);
  cardContent.appendChild(publishTime);
  videoCard.appendChild(cardImage);
  videoCard.appendChild(cardContent);
  container.appendChild(videoCard);
  return container;
}

localStorage.clear();

function createPageButtons() {
  let buttonContainer = document.querySelector('.modal-footer');
  let channelId = localStorage.getItem('channelId');
  let nextPageToken = localStorage.getItem('nextPageToken');
  let prevPageToken = localStorage.getItem('prevPageToken');

  if (prevPageToken != 'false') {
    let prevPageButton = document.createElement('p');
    prevPageButton.innerHTML = 'Back';
    prevPageButton.classList.add('btn');
    prevPageButton.addEventListener('click', async () => {
        let videoData = await fetchVideos(channelId,prevPageToken);
        let container = document.createElement('div');
        let videoResults = document.querySelector('.modal-content');
        container.classList.add('row');
        checkForNextAndPrevPageToken(videoData);
        for (let video of videoData.items) {
            if (video.id.kind === 'youtube#video') {
                let card = generateVideoCard(video);
                container.appendChild(card);
            }
        }
        prevPageButton.parentElement.innerHTML = '';
        videoResults.innerHTML = '<h1>Video Results</h1>';
        createPageButtons();
        videoResults.appendChild(container);
    });
    buttonContainer.appendChild(prevPageButton);
}

  if (nextPageToken != 'false') {
      let nextPageButton = document.createElement('p');
      nextPageButton.innerHTML = 'Next';
      nextPageButton.classList.add('btn');
      nextPageButton.addEventListener('click', async () => {
          let videoData = await fetchVideos(channelId,nextPageToken);
          let container = document.createElement('div');
          let videoResults = document.querySelector('.modal-content');
          container.classList.add('row');
          checkForNextAndPrevPageToken(videoData);
          for (let video of videoData.items) {
              if (video.id.kind === 'youtube#video') {
                  let card = generateVideoCard(video);
                  container.appendChild(card);
              }
          }
          nextPageButton.parentElement.innerHTML = '';
          videoResults.innerHTML = '<h1>Video Results</h1>';
          createPageButtons();
          videoResults.appendChild(container);
      });
      buttonContainer.appendChild(nextPageButton);
  }
 

}

let searchBtn = document.getElementById('search');
searchBtn.addEventListener('click', () => {
  search();
})

let input = document.getElementById('searchbar');
input.addEventListener('click', () => {
  input.classList.remove('red-placeholder-text');
})


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
