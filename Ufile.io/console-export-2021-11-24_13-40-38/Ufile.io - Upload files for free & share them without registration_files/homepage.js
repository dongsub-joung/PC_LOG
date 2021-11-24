// Dropzone
var failed = false;

// Instantiate clipboard by passing a string selector //
var clipboard = new Clipboard('.copy');
clipboard.on('success', function(e) {
    e.clearSelection();
    showTooltip(e.trigger, 'Copied!');
});

clipboard.on('error', function(e) {
    console.error('Action:', e.action);
    console.error('Trigger:', e.trigger);
    showTooltip(e.trigger, fallbackMessage(e.action));
});

if (document.getElementById("upload-window")) {
    if(window.location.host === "uploadfiles:8000") {
        base_url = "http://uploadfiles:8000/";
    } else {
        base_url = "https://up.ufile.io/";
    }
    var dropzone = new Dropzone('#upload-window', {
        autoProcessQueue: false,
        // chunkSize: 7000000,
        url: base_url+"v1/upload/chunk",
        // url: "/v1/upload/chunk",
        maxFilesize: $("#max_size").val(),
        maxFiles: $("#max_files").val(),
        previewsContainer: ".dropzone-notification",
        previewTemplate: "<div class=\"dz-preview dz-file-preview\">\n  <div class=\"dz-image\"><img data-dz-thumbnail /></div>\n  <div class=\"dz-details\">\n   <div class=\"dz-encrypting dz-status\"></div> <div class=\"dz-done dz-status\"></div> <div class=\"dz-size\"><span id=\"data-dz-done\">0</span> / <span data-dz-size></span> </div> <div class='queue-size'><span class='queue-current'>1</span>/<span class='queue-total'></span</span></div>\n    <div class=\"dz-filename\"><span data-dz-name></span></div>\n  </div>\n  <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n  <div class=\"dz-success-mark\">\n    <img class='uf-success' src='https://ufile.io/assets/img/widget/success.svg'>  </div>\n  <div class=\"dz-error-mark\">\n    <img class='uf-error' src='https://ufile.io/assets/img/widget/error.svg'>  </div>\n</div>",
        params: function (files, xhr, chunk) {
            if (chunk)
            {
                return {
                    chunk_index: chunk.index + 1
                };
            }
        },
        chunksUploaded: function(file, done) {
            // All chunks have been uploaded. Perform any other actions
            let currentFile = file;

            let postData = {
                "fuid": currentFile.fuid,
                "file_name": currentFile.name,
                "file_type": currentFile.name.substr((currentFile.name.lastIndexOf('.') +1)),
                "total_chunks": currentFile.upload.totalChunkCount
            };

            if($('#session_id').val())
            {
                postData.session_id = $("#session_id").val();
            }

            if(window.folder)
            {
                postData.folder_id = window.folder["id"];
            }

            // This calls server-side code to merge all chunks for the currentFile
            var finalBaseUrl = file.storageBaseUrl ? file.storageBaseUrl : base_url;

            $.ajax({
                url: finalBaseUrl + "v1/upload/finalise",
                // url: "/v1/upload/finalise",
                type: "POST",
                data: postData,
                success: function (data) {
                    done();

                    window.slug = window.slug || [];
                    window.slug.push(data.slug);

                    // set the response in global for use in queuecomplete
                    window.upload = data;
                },
                error: function (response) {
                    let responseText = JSON.parse(response.responseText);
                    let responseMessage = responseText ? responseText : "Unexpected error occured";
                        dropzone._errorProcessing([file], responseMessage, true);
                }
            });
        },
    });

    dropzone.on("addedfiles", function(files) {

        // prevent accidental navigate away
        active = true;
        // console.log("added files");
        // console.log(active);

        $("#uf-uploader").toggleClass("uf-loading");
        // get the files
        uploadQueue = files;

        // check for 0 size files
        for (var i = 0; i < uploadQueue.length; i++) {
          if(uploadQueue[i].size === 0) {
            $.growl({
                title: "Warning",
                message: "'" + uploadQueue[i].name + "'" + " file size is 0, skipping...",
                size: "huge",
                style: "warning",
                location: "tc",
                duration: 5000
            });
            dropzone.removeFile(uploadQueue[i]);
          }
        }

        // get accepted files again
        uploadQueue = dropzone.getAcceptedFiles();
        count = 0;
        totalFiles = dropzone.getAcceptedFiles().length;

        // if no valid uploads, reset and exit
        if(totalFiles === 0) {
          $("#uf-uploader").toggleClass("uf-loading");
          active = false;
          return;
        }

        console.log(count);
        console.log(files);
        // create session & process the file
        if (totalFiles)
        {
            $("#uf-uploader").addClass("uf-loading");

            create_session(uploadQueue[count]);
        }

        // if more than 1 files, create folder and upload to that
        if(totalFiles > 1)
        {
            $.ajax({
                type: "POST",
                url: '/ajax/create_folder',
                data: {
                    user_id: $('#user_id').val()
                },
                success: function(response) {
                    window.folder = response;
                },
                error: function(response) {
                    console.warn(response.responseText);
                    log_error(response.responseText);
                }
            });
        }
    });


    dropzone.on("complete", function(file) {
        if(file.status == "success")
        {
            count++;
            $(file.previewElement).fadeTo(500, 0);

            // 0.5s delays between uploads
            setTimeout(function() {
                dropzone.removeFile(file);

                $('.dz-done').hide();
                $('.dz-done').html("");

                // count started at 0 so we only check if less than totalFiles
                if(count < totalFiles)
                {
                    create_session(uploadQueue[count]);
                }
            }, 500);
        }
    });

    dropzone.on("uploadprogress", function(file, progress, bytesSent) {
        progress = bytesSent / file.size * 100;

        $('.dz-encrypting').hide();
        $('.dz-size').show();

        completed = 0;
        if (bytesSent < 1000000) {
            completed = ((bytesSent / 1000).toFixed(2) + "KB");
        }
        if (bytesSent > 1000000 && bytesSent < 1000000000) {
            completed = ((bytesSent / 1000000).toFixed(2) + "MB");
        }
        if (bytesSent > 1000000000) {
          completed = ((bytesSent / 1000000000).toFixed(3) + "GB");
        }

        uploaded = $("#data-dz-done");

        $(uploaded).html(completed);

        //$('.dz-upload').width(progress + "%");

        if (progress >= 100)
        {
            $(".dz-done").html('<i class="fas fa-circle-notch fa-spin"></i> Upload complete, storing file...');
            $('.dz-size').hide();
            $('.dz-done').show();
        }
    });


};



dropzone.on("sending", function(file, xhr, formData) {
    failed = false;

    formData.append('fuid', file.fuid);

    $(file.previewElement).fadeTo(500, 1);
    $(".dropzone-outer").hide();


    $('.queue-current').text(count + 1);
    $('.queue-total').text(totalFiles);

    // $(".dropzone-notification").slideDown();

    // addthis
    // var addthis = document.createElement("script");
    // addthis.src = "https://s7.addthis.com/js/300/addthis_widget.js#pubid=ra-56b61b1b0db9758f";
    // document.body.appendChild(addthis);
});


dropzone.on("error", function(file, message, xhr) {
    if (typeof(message) == "object" && message.hasOwnProperty('message'))
    {
      // upload_chunk API failrue
      message = message.message;
    }

    if (typeof previous !== 'undefined' && previous == message)
    {
        $.growl.error({ message: message, location: 'tc' });
    }
    else
    {
      log_error(message);
    }

    this.removeFile(file);
    previous = message;

    // if error returned by ajax
    if (typeof(xhr) != "undefined")
    {
      dropzone.removeAllFiles(true);

      $("#uf-uploader").removeClass("uf-loading");
      $(".dropzone-notification").slideUp();
      $("#uf-uploader").show();

      failed = true;
      active = false;

      // throw new Error(xhr);
    }
});

dropzone.on("maxfilesexceeded", function(file) {
  this.removeFile(file);
});


dropzone.on("queuecomplete", function() {
    // quit immediately if error encountered
    if(failed)
    {
        // code...
    }
    else
    {
        var audio = new Audio('/assets/mp3/complete.mp3');
            audio.play();

        setTimeout(function() {
            $(".dropzone-notification").slideUp();
        }, 500);

        $('#uf-uploader').hide();

        $('#edit').show();
        $('.intro-section').animate({padding: 0}, 750);
        $('.intro').hide();

        // If guest - show pop up for create account promo
        // DISABLED AS WE HAVE CRISP CHAT ATM
        $('.signup-notification').addClass('notification--reveal');

        // if this was a folder, set the URL correctly and message
        if(window.folder)
        {
            $('.success_message').html("Done! Your files are available via the following folder URL:");
            url = window.folder["url"];

            // edit icon in input field
            $("#editbutton").hide();
            $(".email-file").hide();

            // edit button in share section
            $(".edit-btn").hide();

            // text inside share section button
            $('.copy-text').text("Copy folder URL");
        }
        else
        {
            $('.success_message').html("Done! Your file is available via <span class='hidden-xs'>the following URL</span>:");

            url = window.upload["url"];
            // $(".addthis_button_email").hide();
        }

        document.querySelector('#copylink').value = url;
        $('#share-file').attr("data-url", url); //setter

        // Update the addthis share stuff
        // setTimeout(function(){
        //     addthis.update('share', 'url', url);
        //     addthis.update('share', 'title', 'Download ' + data.name + ' from ufile.io');
        // }, 500);

        var data = window.upload;

        // append upload to recent uploads list
        $(".recent-list").append('<div class="row"><div class="col-sm-4 name">' + data.name + '</div><div class="col-sm-2 expiry">' + data.expiry + '</div><div class="col-sm-2 size hidden-xs">' + data.size + '</div><div class="col-sm-3 url"><a target="_blank" href="' + data.url + '">' + data.url + '</a></div><div class="col-sm-1 actions"></div></div>');

        $(".recent-uploads-widget").removeClass("hide");

        // fill edit upload details
        $("#filename").val(data.name);

        // GA tracking
        ga('send', {
            hitType: 'event',
            eventCategory: 'Interaction',
            eventAction: 'File Uploaded'
        });

        // set upload in session via analytics endpoint
        $.ajax({
            type: "POST",
            url: "/ajax/analytics/",
            data: {
                data: window.upload,
                type: "upload",
            },
            dataType: "json",
        });
        if (typeof $crisp !== 'undefined') {
            $crisp.push(["set", "session:event", ["file_uploaded"]]);
            $crisp.push(["set", "session:event", ["upload " + url]]);
        }
    }

    active = false;

});


dropzone.on("retrying", function() {

    $(".dz-encrypting").html('<i class="fas fa-sync-alt fa-spin"></i> Connection lost, attempting to reconnect...');
    $(".dz-encrypting").show();

});



function log_error(message) {
  $.ajax({
    type: "POST",
    url: "/ajax/upload_failed",
    data: {
        message: message
    },
    dataType: "json"
  });

  $.growl({
      title: "Error",
      message: message,
      size: "huge",
      style: "error",
      location: "tc",
      duration: 5000
  });
}

if (document.getElementById("copylink")) {
    function chunksComplete(responseText) {
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            log_error(e);
            console.warn(e);
            return false;
        }

        // if no slug returned, log the error
        if(!data.slug) {
            log_error(responseText);
            return false;
        }

        window.slug = window.slug || [];
        window.slug.push(data.slug);
        console.log(window.slug);

        // set the response in global for use in queuecomplete
        window.upload = data;
    }
}




$("#expiredate").change(function() {

    var hours = $('input[name="expiry"]:checked').val();

    $.ajax({
      type: "POST",
      url: '/ajax/expiry',
      data: {
          'slug': window.slug,
          'hours': hours
      },
      success: function(response) {
        $.growl({
          title: "<i class='fa fa-check'></i> " + response,
          message: "",
          location: "tc",
          duration: 3000
        });

      },
      error: function(response) {
        $.growl({
          title: response.responseText,
          message: "",
          style: "error",
          location: "tc",
          size: "huge",
          duration: 5000
        });

      }
    });

});



// Get stats

if (document.getElementById("user-count")) {

    userCountVal = parseInt($("#user-count").text());
    userCount = new CountUp("user-count", userCountVal, userCountVal +1, 0, 2);
    if (!userCount.error) {
        userCount.start();
    }
    fileCountVal = parseInt($("#file-count").text());
    fileCount = new CountUp("file-count", fileCountVal, fileCountVal + 3, 0, 10);
    if (!fileCount.error) {
        fileCount.start();
    }
    downloadCountVal = parseInt($("#download-count").text());
    downloadCount = new CountUp("download-count", downloadCountVal, downloadCountVal + 10, 0, 50);
    if (!downloadCount.error) {
        downloadCount.start();
    }

    setInterval("updateStats()",3000);
}




// Update new values on change
function updateStats() {
    userCount.update(userCount.startVal + 1);
    fileCount.update(fileCount.startVal + 2);
    downloadCount.update(downloadCount.startVal + 15);
}



// save file via edit modal
$(document).on('click', '.save-file', function(e) {

    $('.save-file').addClass("btn--loading");

    var display_name = $("#display_name").val();
    var description = $("#description").val();



    $.ajax({
        type: "POST",
        url: '/ajax/update_file',
        data: {
            'slug': window.slug,
            'display_name': display_name,
            'description': description
        },
        success: function(response) {

          $.growl({
            title: "<i class='fa fa-check'></i> " + response,
            message: "",
            location: "tc",
            duration: 3000
          });

        },
        error: function(response) {

          $.growl({
            title: "<i class='fa fa-times'></i> " + response.responseText,
            message: "",
            location: "tc",
            style: "error",
            duration: 5000
          });

        },
        complete: function() {
          $('.save-file').removeClass("btn--loading");

          mr.modals.closeActiveModal();
        }
    });

});




function create_session(file)
{
    $(".dz-encrypting").html('<i class="fas fa-circle-notch fa-spin"></i> Starting upload...');
    $(".dz-encrypting").show();
    $(file.previewElement).fadeTo(500, 1);
    $(".dropzone-notification").slideDown();

    $.ajax({
        type: 'POST',
        url: '/v1/upload/select_storage',
        headers: {
            "x-api-key": $('#api_key').val()
        },
        success: function(response) {
            if (response && response.error === '') {
                runSessionRequest(response);
            }
        },
        error: function(xhr, status, error) {
            runSessionRequest({});
        }
    });

    var runSessionRequest = function (requestParams) {
        var url = base_url + 'v1/upload/create_session';
        var uploadUrl = '';
        if (requestParams && requestParams.storageBaseUrl) {
            url = requestParams.storageBaseUrl + 'v1/upload/create_session';
            uploadUrl = requestParams.storageBaseUrl + '/v1/upload/chunk';
        }

        $.ajax({
            type: "POST",
            url: url,
            // url: '/v1/upload/create_session',
            headers: {
                "x-api-key": $('#api_key').val()
            },
            data: {
                file_size: file.size
                // file_size: '999999999999999999999'
            },
            success: function(response) {
                file.fuid = response.fuid;
                if (uploadUrl !== '') {
                    dropzone.options.url = uploadUrl;
                    file.storageBaseUrl = requestParams.storageBaseUrl;
                }
                dropzone.processFile(file);
            },
            error: function(xhr, status, error) {
                let responseMessage = xhr.status + ' : ' + xhr.statusText + ' ' + xhr.responseText;
                dropzone._errorProcessing([file], responseMessage, true);

            }
        });
    };
}
