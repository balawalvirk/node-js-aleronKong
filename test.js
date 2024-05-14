import getThumb from 'video-thumbnail-url';

getThumb('https://middler-v1.s3.amazonaws.com/Snapsave.app_46461856ACBDBDC92CD5E621D4A556A3_video_dashinit.mp4').then(thumb_url => { // thumb_url is  url or null
    console.log(thumb_url); // http://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg
});
