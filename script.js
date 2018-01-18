// YouTube API Referenz
// https://developers.google.com/youtube/iframe_api_reference

var onYouTubeIframeAPIReady = function () {

    var groupId = 192;

    var api = new PieceMakerApi({
        host: 'https://piecemaker2-api-public.herokuapp.com',
        api_key: '0310XNNLGT7YleRv'
    });

    var videoListe, player, currentVideo = 0;

    var isEditor = window.location.href.indexOf('censored') >= 0
    if (!isEditor) {
        currentVideo = 1 //erstes Video in Piecemaker
    }

    var videosLoaded = function (videos) {
        // console.log(videos)
        videoListe = videos
        var playerOptions = {
            height: '390',
            width: '640',
            videoId: videoListe[currentVideo].fields.vid_service_id, // <-- YouTube Video-ID
            playerVars: {
                'autoplay': 1,
                'controls': 1,
                'rel': 0,
                'showinfo': 0,
                'autohide': 1,
                'modestbranding': 1
            },
            events: {
                'onStateChange': function (event) {  //Schnelligkeit des Videos
                    if (!isEditor) {
                        player.setPlaybackRate(0.5)
                        
                    } else {
                        if (event.data == YT.PlayerState.ENDED) {
                            window.location.href = 'thankyou.html'
                        }
                    }
                }
            }
        }
        player = new YT.Player('video-container', playerOptions);
    }

    api.listEventsOfType(groupId, 'video', videosLoaded)

    // -------
    // Startknopf

    var playPauseVideo = function () {
        var notPlaying = player.getPlayerState() !== 1; // not playing
        if (notPlaying) {
            player.playVideo();
            // playKnopf.innerHTML = 'pause';
        } else {
            player.pauseVideo();
            // playKnopf.innerHTML = 'play';
        }
    }

    // var playKnopf = document.querySelector('#play-knopf');
    // playKnopf.addEventListener('click', playPauseVideo);

    var textfeld = document.querySelector('#textfeld')
    var textfeldFocus = function (event) {
        player.pauseVideo()
    }

    textfeld.addEventListener('focus', textfeldFocus)
    textfeld.addEventListener('keydown', textfeldFocus)

    var textForm = document.querySelector('#textform')
    var textFormSubmitted = function (event) {
        event.preventDefault()

        var annotationText = textfeld.value
        textfeld.value = ''
        var videoTime = player.getCurrentTime()
        // console.log(annotationText,videoTime)

        var annotation = {
            utc_timestamp: videoListe[currentVideo].utc_timestamp.getTime() + videoTime * 1000,
            duration: 0,
            type: 'marker',
            fields: {
                adjective: annotationText,
                title: annotationText,
                description: annotationText,
                tags: annotationText.toLowerCase()
            }
        }

        api.createEvent(groupId, annotation, annotationCreated)
    }
    textForm.addEventListener('submit', textFormSubmitted)

    var annotationCreated = function () {
        if (!isEditor) {
            if (currentVideo < videoListe.length-1) {
                currentVideo++;
                player.loadVideoById(videoListe[currentVideo].fields.vid_service_id)
            } else {
                window.location.href = 'clipcensored.html'
            }
        } else {
            player.playVideo()
        }
    }
}
