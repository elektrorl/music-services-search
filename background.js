function updateContextMenus() {
      chrome.contextMenus.removeAll(() => {
        chrome.storage.sync.get(['enabledServices'], (data) => {
          const enabledServices = data.enabledServices || ['spotifySearch', 'youtubeSearch', 'youtubeMusicSearch', 'bandcampSearch'];
          const contexts = ["selection"];
          const searchEngines = [
            { id: "spotifySearch", title: "Search on Spotify", url: "https://open.spotify.com/search/" },
            { id: "youtubeSearch", title: "Search on YouTube", url: "https://www.youtube.com/results?search_query=" },
            { id: "youtubeMusicSearch", title: "Search on YouTube Music", url: "https://music.youtube.com/search?q=" },
            { id: "bandcampSearch", title: "Search on Bandcamp", url: "https://bandcamp.com/search?q=" }
          ];

          searchEngines.forEach(engine => {
            if (enabledServices.includes(engine.id)) {
              chrome.contextMenus.create({
                id: engine.id,
                title: `${engine.title}: '%s'`,
                contexts: contexts
              });
            }
          });
        });
      });
    }

    chrome.runtime.onInstalled.addListener(updateContextMenus);
    chrome.storage.onChanged.addListener(updateContextMenus);

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      const searchEngines = {
        spotifySearch: "https://open.spotify.com/search/",
        youtubeSearch: "https://www.youtube.com/results?search_query=",
        youtubeMusicSearch: "https://music.youtube.com/search?q=",
        bandcampSearch: "https://bandcamp.com/search?q="
      };

      const baseUrl = searchEngines[info.menuItemId];
      if (baseUrl) {
        let query = info.selectionText;
        query = query.replace(/[^a-zA-Z0-9\s]/g, ''); // Remove non-alphanumeric characters
        query = query.replace(/\s+/g, ' ').trim(); // Remove extra spaces
        const searchUrl = `${baseUrl}${encodeURIComponent(query)}`;
        chrome.tabs.create({ url: searchUrl });
      }
    });
