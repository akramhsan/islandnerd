
(function(){
  const section = document.getElementById('ytLatest');
  if (!section) return;
  fetch('content/config.json').then(r=>r.json()).then(cfg=>{
    const channelId = cfg.youtubeChannelId;
    const playlistId = cfg.uploadsPlaylistId || (channelId ? ('UU' + channelId.substring(2)) : '');
    const rssUrl = channelId ? `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}` : null;

    // Attempt RSS parse for thumbnails (may fail due to CORS)
    if (rssUrl) {
      fetch(rssUrl).then(r=>r.text()).then(xml=>{
        const doc = new window.DOMParser().parseFromString(xml, 'text/xml');
        const entries = [...doc.querySelectorAll('entry')].slice(0,6).map(e=>({
          id: e.querySelector('yt\\:videoId')?.textContent,
          title: e.querySelector('title')?.textContent || '',
          published: e.querySelector('published')?.textContent || '',
          link: e.querySelector('link')?.getAttribute('href') || '',
          thumb: `https://i.ytimg.com/vi/${e.querySelector('yt\\:videoId')?.textContent}/hqdefault.jpg`
        }));
        if (entries.length){
          section.innerHTML = entries.map(v => `
            <div class="col-12 col-sm-6 col-lg-4">
              <a class="text-decoration-none text-reset" href="${v.link}" target="_blank" rel="noopener">
                <div class="card h-100 card-hover">
                  <img src="${v.thumb}" class="card-img-top" alt="">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="badge text-bg-danger">YouTube</span>
                      <small class="text-muted">${new Date(v.published).toLocaleDateString()}</small>
                    </div>
                    <h3 class="h6 card-title mb-0">${v.title}</h3>
                  </div>
                </div>
              </a>
            </div>
          `).join('');
          return;
        }
        throw new Error('No entries');
      }).catch(()=>{
        // Fallback to playlist iframe
        if (playlistId){
          section.innerHTML = `<div class="ratio ratio-16x9"><iframe src="https://www.youtube.com/embed?listType=playlist&list=${playlistId}" title="YouTube playlist" allowfullscreen></iframe></div>`;
        } else {
          section.innerHTML = '<p class="text-muted">Set your YouTube channel ID in content/config.json to display latest uploads.</p>';
        }
      });
    } else {
      if (playlistId){
        section.innerHTML = `<div class="ratio ratio-16x9"><iframe src="https://www.youtube.com/embed?listType=playlist&list=${playlistId}" title="YouTube playlist" allowfullscreen></iframe></div>`;
      } else {
        section.innerHTML = '<p class="text-muted">Set your YouTube channel ID in content/config.json to display latest uploads.</p>';
      }
    }
  });
})();
